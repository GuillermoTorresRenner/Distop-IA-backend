import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica que un usuario sea miembro (jugador o narrador) de la crónica.
   * Devuelve el rol si lo es; null si no.
   */
  async getMembership(userId: string, chronicleId: string) {
    const member = await this.prisma.chronicleMember.findUnique({
      where: { chronicleId_userId: { chronicleId, userId } },
      select: { role: true },
    });
    return member?.role ?? null;
  }

  /**
   * Devuelve datos básicos del usuario para mostrar en la mesa
   * (lista de presencia, autor de mensajes).
   */
  async getUserPublic(userId: string) {
    return this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true,
      },
    });
  }

  /**
   * Devuelve el nickname del usuario (o el local-part del email como
   * fallback si todavía no tiene nick). Pensado para emitir chat con una
   * identidad amigable en lugar del email.
   */
  async getUserDisplayName(userId: string): Promise<string> {
    const info = await this.getUserSpeakerInfo(userId);
    return info.name;
  }

  /**
   * Devuelve nombre + filename de avatar del usuario para inflar la
   * identidad del hablante en mensajes de chat (cuando el usuario habla
   * "como sí mismo"). El consumidor debe convertir el filename a URL
   * pública si lo expone al cliente.
   */
  async getUserSpeakerInfo(
    userId: string,
  ): Promise<{ name: string; avatar: string | null }> {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, nickname: true, avatar: true },
    });
    if (!user) return { name: 'Desconocido', avatar: null };
    const name =
      user.nickname && user.nickname.trim()
        ? user.nickname.trim()
        : (user.email.split('@')[0] ?? user.email);
    return { name, avatar: user.avatar };
  }

  /**
   * Devuelve el narratorId de una crónica (o null si no existe).
   */
  async getNarratorId(chronicleId: string): Promise<string | null> {
    const c = await this.prisma.chronicle.findUnique({
      where: { id: chronicleId },
      select: { narratorId: true },
    });
    return c?.narratorId ?? null;
  }

  /**
   * Resuelve si un personaje pertenece a la crónica y devuelve su tipo y dueño.
   * Lo usa el gateway para anuncios de actualización de hoja.
   */
  /**
   * Activa un poder de disciplina para un personaje:
   *   - Verifica que el personaje pertenezca al usuario.
   *   - Verifica que el personaje haya aprendido esa disciplina al nivel >= power.level.
   *   - Si el poder requiere sangre, descuenta atómicamente (clamp a >=0).
   *   - Devuelve metadata para que el gateway emita los anuncios apropiados.
   */
  async activateDisciplinePower(
    userId: string,
    characterId: string,
    powerId: string,
  ) {
    const power = await this.prisma.disciplinePower.findUnique({
      where: { id: powerId },
      include: {
        discipline: { select: { id: true, name: true } },
        path: {
          select: {
            id: true,
            name: true,
            disciplineId: true,
            discipline: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!power) throw new NotFoundException('Discipline power not found');

    // Un poder pertenece a una disciplina monolítica (discipline) o a una
    // senda (path → discipline). Calculamos la disciplina dueña y el nombre
    // mostrable según el caso.
    const ownerDisciplineId =
      power.disciplineId ?? power.path?.disciplineId ?? null;
    const ownerDisciplineName =
      power.discipline?.name ?? power.path?.discipline?.name ?? 'Disciplina';
    if (!ownerDisciplineId) {
      throw new BadRequestException(
        'Power has no associated discipline or path',
      );
    }

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        userId: true,
        name: true,
        bloodPool: true,
        disciplines: {
          where: { disciplineId: ownerDisciplineId },
          select: {
            level: true,
            paths: { select: { pathId: true, level: true, isPrimary: true } },
          },
        },
      },
    });
    if (!character) throw new NotFoundException('Character not found');
    if (character.userId !== userId) {
      throw new ForbiddenException(
        'You can only activate powers on your own characters',
      );
    }
    // Nivel disponible: para disciplinas monolíticas, el `level` de
    // CharacterDiscipline. Para sendas, el nivel de la senda específica.
    const characterDiscipline = character.disciplines[0];
    let learned = 0;
    if (power.path) {
      const ownedPath = characterDiscipline?.paths.find(
        (p) => p.pathId === power.path!.id,
      );
      learned = ownedPath?.level ?? 0;
    } else {
      learned = characterDiscipline?.level ?? 0;
    }
    if (learned < power.level) {
      const label = power.path
        ? `${ownerDisciplineName} · ${power.path.name}`
        : ownerDisciplineName;
      throw new BadRequestException(
        `El personaje no domina ${label} a nivel ${power.level} (tiene ${learned}).`,
      );
    }

    const cost = power.bloodCost ?? 0;
    if (cost > 0 && character.bloodPool < cost) {
      throw new BadRequestException(
        `Sangre insuficiente: el poder requiere ${cost} y el personaje tiene ${character.bloodPool}.`,
      );
    }

    const bloodBefore = character.bloodPool;
    let bloodAfter = character.bloodPool;
    if (cost > 0) {
      const updated = await this.prisma.character.update({
        where: { id: characterId },
        data: { bloodPool: { decrement: cost } },
        select: { bloodPool: true },
      });
      bloodAfter = updated.bloodPool;
    }

    return {
      power: {
        id: power.id,
        name: power.name,
        level: power.level,
        description: power.description,
        summary: power.summary,
        bloodCost: cost,
        rollAttribute: power.rollAttribute,
        rollAbility: power.rollAbility,
        rollDifficulty: power.rollDifficulty,
      },
      // Resolvemos `discipline` siempre (sea monolítica o vía path) para
      // mantener el contrato estable del gateway/front.
      discipline: { id: ownerDisciplineId, name: ownerDisciplineName },
      path: power.path ? { id: power.path.id, name: power.path.name } : null,
      character: {
        id: character.id,
        name: character.name,
      },
      blood: { before: bloodBefore, after: bloodAfter, spent: cost },
    };
  }

  /**
   * Lee los atributos necesarios para tirar iniciativa (Destreza + Astucia)
   * junto con el contexto del personaje (kind/ownerId/name) para que el
   * gateway pueda validar permisos y construir la tirada.
   */
  async getInitiativeStats(
    chronicleId: string,
    characterId: string,
  ): Promise<{
    id: string;
    name: string;
    kind: 'PC' | 'NPC' | 'ANTAGONIST';
    ownerId: string;
    dexterity: number;
    wits: number;
  } | null> {
    const link = await this.prisma.chronicleCharacter.findUnique({
      where: { chronicleId_characterId: { chronicleId, characterId } },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            kind: true,
            userId: true,
            dexterity: true,
            wits: true,
          },
        },
      },
    });
    if (!link?.character) return null;
    return {
      id: link.character.id,
      name: link.character.name,
      kind: link.character.kind,
      ownerId: link.character.userId,
      dexterity: link.character.dexterity,
      wits: link.character.wits,
    };
  }

  /**
   * Resuelve un poder o ritual + los stats del personaje para construir
   * un pool canon (atributo + habilidad + modificador) y devolver la
   * dificultad declarada en el catálogo. Valida también que el personaje
   * conoce el poder/ritual al nivel requerido.
   *
   * Retorna `null` si no se puede tirar (poder/ritual sin rollAttribute).
   * El gateway decide qué hacer en ese caso (típicamente: rechazar con
   * "este poder no tiene tirada activa").
   */
  async prepareRollPower(input: {
    chronicleId: string;
    characterId: string;
    callerId: string;
    powerId?: string;
    ritualId?: string;
    modifier?: number;
  }): Promise<{
    pool: number;
    difficulty: number;
    sourceName: string;
    metadata: Record<string, unknown>;
    character: {
      id: string;
      name: string;
      kind: 'PC' | 'NPC' | 'ANTAGONIST';
      ownerId: string;
    };
  } | null> {
    if (
      (input.powerId && input.ritualId) ||
      (!input.powerId && !input.ritualId)
    ) {
      throw new BadRequestException(
        'Provide exactly one of powerId or ritualId',
      );
    }

    const character = await this.prisma.character.findUnique({
      where: { id: input.characterId },
      select: {
        id: true,
        name: true,
        kind: true,
        userId: true,
        strength: true,
        dexterity: true,
        stamina: true,
        charisma: true,
        manipulation: true,
        appearance: true,
        perception: true,
        intelligence: true,
        wits: true,
        abilities: { select: { name: true, value: true } },
        disciplines: {
          select: {
            disciplineId: true,
            level: true,
            paths: { select: { pathId: true, level: true } },
            discipline: { select: { id: true, name: true } },
          },
        },
        disciplineRituals: { select: { ritualId: true } },
      },
    });
    if (!character) throw new NotFoundException('Character not found');

    // Resolución del origen y validación de aprendizaje.
    let rollAttribute: string | null = null;
    let rollAbility: string | null = null;
    let rollDifficulty: number | null = null;
    let sourceName = '';
    let metadata: Record<string, unknown> = {};

    if (input.powerId) {
      const power = await this.prisma.disciplinePower.findUnique({
        where: { id: input.powerId },
        include: {
          discipline: { select: { id: true, name: true } },
          path: {
            select: {
              id: true,
              name: true,
              disciplineId: true,
              discipline: { select: { id: true, name: true } },
            },
          },
        },
      });
      if (!power) throw new NotFoundException('Discipline power not found');
      if (power.rollAttribute === null || power.rollDifficulty === null) {
        return null;
      }

      const ownerDisciplineId =
        power.disciplineId ?? power.path?.disciplineId ?? null;
      if (!ownerDisciplineId) {
        throw new BadRequestException(
          'Power has no associated discipline or path',
        );
      }
      const owned = character.disciplines.find(
        (d) => d.disciplineId === ownerDisciplineId,
      );
      let learned = 0;
      if (power.path) {
        learned =
          owned?.paths.find((p) => p.pathId === power.path!.id)?.level ?? 0;
      } else {
        learned = owned?.level ?? 0;
      }
      if (learned < power.level) {
        const label = power.path
          ? `${power.path.discipline?.name ?? 'Disciplina'} · ${power.path.name}`
          : (power.discipline?.name ?? 'Disciplina');
        throw new BadRequestException(
          `El personaje no domina ${label} a nivel ${power.level} (tiene ${learned}).`,
        );
      }

      rollAttribute = power.rollAttribute;
      rollAbility = power.rollAbility;
      rollDifficulty = power.rollDifficulty;
      sourceName =
        `${power.discipline?.name ?? power.path?.discipline?.name ?? ''} ${power.level} — ${power.name}`.trim();
      metadata = {
        kind: 'power',
        powerId: power.id,
        powerName: power.name,
        powerLevel: power.level,
        disciplineId: ownerDisciplineId,
        disciplineName: power.discipline?.name ?? power.path?.discipline?.name,
        pathId: power.path?.id ?? null,
        pathName: power.path?.name ?? null,
        rollAttribute,
        rollAbility,
        rollDifficulty,
      };
    } else if (input.ritualId) {
      const ritual = await this.prisma.disciplineRitual.findUnique({
        where: { id: input.ritualId },
        include: { discipline: { select: { id: true, name: true } } },
      });
      if (!ritual) throw new NotFoundException('Ritual not found');
      if (ritual.rollAttribute === null || ritual.rollDifficulty === null) {
        return null;
      }
      // El personaje debe haber aprendido este ritual.
      const learned = character.disciplineRituals.some(
        (r) => r.ritualId === ritual.id,
      );
      if (!learned) {
        throw new BadRequestException(
          `El personaje no ha aprendido el ritual "${ritual.name}".`,
        );
      }

      rollAttribute = ritual.rollAttribute;
      rollAbility = ritual.rollAbility;
      rollDifficulty = ritual.rollDifficulty;
      sourceName = `Ritual ${ritual.level} — ${ritual.name}`;
      metadata = {
        kind: 'ritual',
        ritualId: ritual.id,
        ritualName: ritual.name,
        ritualLevel: ritual.level,
        disciplineId: ritual.disciplineId,
        disciplineName: ritual.discipline.name,
        rollAttribute,
        rollAbility,
        rollDifficulty,
      };
    }

    // Pool = atributo + habilidad (o sólo atributo si no hay ability)
    // + modificador circunstancial. Mínimo 1.
    const attrValue = readAttribute(character, rollAttribute!);
    const abilityRating = rollAbility
      ? (character.abilities.find((a) => a.name === rollAbility)?.value ?? 0)
      : 0;
    const safeModifier =
      typeof input.modifier === 'number' && Number.isFinite(input.modifier)
        ? Math.max(-10, Math.min(10, Math.floor(input.modifier)))
        : 0;
    const pool = Math.max(1, attrValue + abilityRating + safeModifier);

    metadata.attributeValue = attrValue;
    metadata.abilityRating = abilityRating;
    metadata.modifier = safeModifier;

    return {
      pool,
      difficulty: rollDifficulty!,
      sourceName,
      metadata,
      character: {
        id: character.id,
        name: character.name,
        kind: character.kind,
        ownerId: character.userId,
      },
    };
  }

  async getCharacterContext(
    chronicleId: string,
    characterId: string,
  ): Promise<{
    id: string;
    name: string;
    kind: 'PC' | 'NPC' | 'ANTAGONIST';
    ownerId: string;
    /** Filename del retrato (sin URL). Quien consuma este método debe
     *  convertirlo a URL pública si lo expone al cliente. */
    avatar: string | null;
  } | null> {
    const link = await this.prisma.chronicleCharacter.findUnique({
      where: {
        chronicleId_characterId: { chronicleId, characterId },
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            kind: true,
            userId: true,
            avatar: true,
          },
        },
      },
    });
    if (!link?.character) return null;
    return {
      id: link.character.id,
      name: link.character.name,
      kind: link.character.kind,
      ownerId: link.character.userId,
      avatar: link.character.avatar,
    };
  }
}

/// Lee el valor de un atributo del personaje por su clave canónica
/// (strength, dexterity, ..., wits). Usado por `prepareRollPower` para
/// construir el pool sin tener un switch en cada llamador.
function readAttribute(
  character: {
    strength: number;
    dexterity: number;
    stamina: number;
    charisma: number;
    manipulation: number;
    appearance: number;
    perception: number;
    intelligence: number;
    wits: number;
  },
  key: string,
): number {
  switch (key) {
    case 'strength':
      return character.strength;
    case 'dexterity':
      return character.dexterity;
    case 'stamina':
      return character.stamina;
    case 'charisma':
      return character.charisma;
    case 'manipulation':
      return character.manipulation;
    case 'appearance':
      return character.appearance;
    case 'perception':
      return character.perception;
    case 'intelligence':
      return character.intelligence;
    case 'wits':
      return character.wits;
    default:
      return 0;
  }
}

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
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, nickname: true },
    });
    if (!user) return 'Desconocido';
    if (user.nickname && user.nickname.trim()) return user.nickname.trim();
    return user.email.split('@')[0] ?? user.email;
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
      },
    });
    if (!power) throw new NotFoundException('Discipline power not found');

    const character = await this.prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        userId: true,
        name: true,
        bloodPool: true,
        disciplines: {
          where: { disciplineId: power.disciplineId },
          select: { level: true },
        },
      },
    });
    if (!character) throw new NotFoundException('Character not found');
    if (character.userId !== userId) {
      throw new ForbiddenException(
        'You can only activate powers on your own characters',
      );
    }
    const learned = character.disciplines[0]?.level ?? 0;
    if (learned < power.level) {
      throw new BadRequestException(
        `El personaje no domina ${power.discipline.name} a nivel ${power.level} (tiene ${learned}).`,
      );
    }

    const cost = power.bloodCost ?? 0;
    if (cost > 0 && character.bloodPool < cost) {
      throw new BadRequestException(
        `Sangre insuficiente: el poder requiere ${cost} y el personaje tiene ${character.bloodPool}.`,
      );
    }

    let bloodBefore = character.bloodPool;
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
      discipline: power.discipline,
      character: {
        id: character.id,
        name: character.name,
      },
      blood: { before: bloodBefore, after: bloodAfter, spent: cost },
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
  } | null> {
    const link = await this.prisma.chronicleCharacter.findUnique({
      where: {
        chronicleId_characterId: { chronicleId, characterId },
      },
      include: {
        character: {
          select: { id: true, name: true, kind: true, userId: true },
        },
      },
    });
    if (!link?.character) return null;
    return {
      id: link.character.id,
      name: link.character.name,
      kind: link.character.kind,
      ownerId: link.character.userId,
    };
  }
}

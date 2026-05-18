import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CombatParticipantView {
  id: string;
  characterId: string | null;
  /** Nombre visible. Master ve siempre el real; jugadores solo PCs (filtrado en el service). */
  name: string;
  /** Solo presente cuando el caller es narrador. */
  initiative?: number | null;
  order: number;
  /**
   * Tipo de participante:
   *  - PC: personaje de un jugador (visible para todos).
   *  - NPC / ANTAGONIST: solo visible para el narrador.
   *  - FREE: entrada libre (sin Character), solo narrador.
   */
  kind: 'PC' | 'NPC' | 'ANTAGONIST' | 'FREE';
  /** Solo presente para narrador. */
  ownerId?: string | null;
}

export interface CombatStateView {
  chronicleId: string;
  cursor: number;
  round: number;
  /** Lista visible para el caller (filtrada según rol). */
  participants: CombatParticipantView[];
  /**
   * Total de participantes reales (master). En la vista del jugador puede
   * haber menos en `participants` porque se ocultan NPC/Antagonist/FREE.
   */
  totalParticipants?: number;
}

@Injectable()
export class CombatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve el tracker de la crónica. Lo crea vacío si no existe.
   * Devuelve la vista filtrada según el rol del caller.
   */
  async getStateForRole(
    chronicleId: string,
    role: 'NARRATOR' | 'PLAYER',
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    return this.toView(tracker, role);
  }

  /**
   * Agrega un participante al tracker. Solo narrador.
   * - characterId: si se provee, debe estar asociado a la crónica.
   * - displayName: obligatorio si no hay characterId (entrada libre).
   * El nuevo participante se inserta al final del orden actual.
   */
  async addParticipant(
    chronicleId: string,
    input: {
      characterId?: string | null;
      displayName?: string | null;
      initiative?: number | null;
    },
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);

    let resolvedCharacterId: string | null = null;
    let resolvedDisplayName: string | null = null;

    if (input.characterId) {
      const link = await this.prisma.chronicleCharacter.findUnique({
        where: {
          chronicleId_characterId: {
            chronicleId,
            characterId: input.characterId,
          },
        },
        include: { character: { select: { id: true, name: true } } },
      });
      if (!link?.character) {
        throw new BadRequestException(
          'El personaje no está asociado a esta crónica',
        );
      }
      // Evita duplicar el mismo character en el tracker.
      const dup = await this.prisma.combatParticipant.findFirst({
        where: { trackerId: tracker.id, characterId: input.characterId },
      });
      if (dup) {
        throw new BadRequestException(
          'Este personaje ya está en el orden de turnos',
        );
      }
      resolvedCharacterId = link.character.id;
      resolvedDisplayName = input.displayName?.trim() || null;
    } else {
      const name = input.displayName?.trim();
      if (!name) {
        throw new BadRequestException(
          'Se requiere displayName para una entrada libre',
        );
      }
      resolvedDisplayName = name;
    }

    const nextOrder = tracker.participants.length;
    await this.prisma.combatParticipant.create({
      data: {
        trackerId: tracker.id,
        characterId: resolvedCharacterId,
        displayName: resolvedDisplayName,
        initiative:
          typeof input.initiative === 'number' ? input.initiative : null,
        order: nextOrder,
      },
    });
    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Inscribe (o actualiza) un participante a partir de una tirada de
   * iniciativa. Si el personaje ya está en el tracker, le actualiza la
   * iniciativa con el nuevo total; si no, lo agrega al final del orden.
   *
   * A diferencia de `addParticipant`, este método no requiere narrador:
   * cualquier dueño legítimo del personaje (validado por el caller) puede
   * inscribirse a sí mismo o ser inscrito por el narrador.
   */
  async addOrUpdateForInitiative(
    chronicleId: string,
    characterId: string,
    initiative: number,
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);

    const link = await this.prisma.chronicleCharacter.findUnique({
      where: { chronicleId_characterId: { chronicleId, characterId } },
      include: { character: { select: { id: true, name: true } } },
    });
    if (!link?.character) {
      throw new BadRequestException(
        'El personaje no está asociado a esta crónica',
      );
    }

    const existing = await this.prisma.combatParticipant.findFirst({
      where: { trackerId: tracker.id, characterId },
    });

    if (existing) {
      await this.prisma.combatParticipant.update({
        where: { id: existing.id },
        data: { initiative },
      });
    } else {
      const nextOrder = tracker.participants.length;
      await this.prisma.combatParticipant.create({
        data: {
          trackerId: tracker.id,
          characterId,
          displayName: null,
          initiative,
          order: nextOrder,
        },
      });
    }

    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Actualiza un participante (iniciativa o displayName). Solo narrador.
   */
  async updateParticipant(
    chronicleId: string,
    participantId: string,
    patch: { initiative?: number | null; displayName?: string | null },
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    const exists = tracker.participants.find((p) => p.id === participantId);
    if (!exists) {
      throw new NotFoundException('Participante no encontrado');
    }
    const data: Record<string, unknown> = {};
    if (patch.initiative !== undefined) data.initiative = patch.initiative;
    if (patch.displayName !== undefined) {
      data.displayName = patch.displayName?.trim() || null;
    }
    await this.prisma.combatParticipant.update({
      where: { id: participantId },
      data,
    });
    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Quita un participante. Si era el del turno actual, el cursor queda
   * apuntando al siguiente (o se cicla a 0 si era el último).
   */
  async removeParticipant(
    chronicleId: string,
    participantId: string,
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    const idx = tracker.participants.findIndex((p) => p.id === participantId);
    if (idx < 0) throw new NotFoundException('Participante no encontrado');

    await this.prisma.$transaction(async (tx) => {
      await tx.combatParticipant.delete({ where: { id: participantId } });
      // Recompacta orden.
      const rest = tracker.participants.filter((p) => p.id !== participantId);
      for (let i = 0; i < rest.length; i++) {
        if (rest[i].order !== i) {
          await tx.combatParticipant.update({
            where: { id: rest[i].id },
            data: { order: i },
          });
        }
      }
      // Ajusta cursor.
      const nextLen = rest.length;
      const nextCursor =
        nextLen === 0
          ? 0
          : tracker.cursor >= nextLen
            ? 0
            : tracker.cursor > idx
              ? tracker.cursor - 1
              : tracker.cursor;
      if (nextCursor !== tracker.cursor) {
        await tx.combatTracker.update({
          where: { id: tracker.id },
          data: { cursor: nextCursor },
        });
      }
    });

    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Reordena la lista completa de participantes (drag & drop). El array
   * `orderedIds` debe contener exactamente los mismos IDs que existen en el
   * tracker. El cursor se mantiene apuntando al MISMO participante (no al
   * mismo índice).
   */
  async reorder(
    chronicleId: string,
    orderedIds: string[],
  ): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    const currentIds = tracker.participants.map((p) => p.id);
    if (orderedIds.length !== currentIds.length) {
      throw new BadRequestException(
        'La lista no coincide con los participantes actuales',
      );
    }
    const set = new Set(currentIds);
    for (const id of orderedIds) {
      if (!set.has(id)) {
        throw new BadRequestException(`Participante desconocido: ${id}`);
      }
    }

    // Identifica el participante actual antes de reordenar.
    const activeId = tracker.participants[tracker.cursor]?.id ?? null;

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.combatParticipant.update({
          where: { id: orderedIds[i] },
          data: { order: i },
        });
      }
      if (activeId) {
        const newCursor = orderedIds.indexOf(activeId);
        if (newCursor >= 0 && newCursor !== tracker.cursor) {
          await tx.combatTracker.update({
            where: { id: tracker.id },
            data: { cursor: newCursor },
          });
        }
      }
    });

    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Avanza el cursor al siguiente turno. Si llega al final, cicla a 0 e
   * incrementa el contador de asalto.
   */
  async advance(chronicleId: string): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    if (tracker.participants.length === 0) {
      throw new BadRequestException(
        'Agrega al menos un participante antes de avanzar',
      );
    }
    const nextRaw = tracker.cursor + 1;
    const wraps = nextRaw >= tracker.participants.length;
    const nextCursor = wraps ? 0 : nextRaw;
    const nextRound = wraps ? tracker.round + 1 : tracker.round;
    await this.prisma.combatTracker.update({
      where: { id: tracker.id },
      data: { cursor: nextCursor, round: nextRound },
    });
    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Reinicia el combate: cursor=0, round=1. Mantiene los participantes.
   */
  async reset(chronicleId: string): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    await this.prisma.combatTracker.update({
      where: { id: tracker.id },
      data: { cursor: 0, round: 1 },
    });
    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  /**
   * Limpia el tracker: borra todos los participantes y reinicia cursor/round.
   */
  async clear(chronicleId: string): Promise<CombatStateView> {
    const tracker = await this.ensureTracker(chronicleId);
    await this.prisma.$transaction([
      this.prisma.combatParticipant.deleteMany({
        where: { trackerId: tracker.id },
      }),
      this.prisma.combatTracker.update({
        where: { id: tracker.id },
        data: { cursor: 0, round: 1 },
      }),
    ]);
    const fresh = await this.ensureTracker(chronicleId);
    return this.toView(fresh, 'NARRATOR');
  }

  // ──────────────────────────────────────────────────────────
  // Internals
  // ──────────────────────────────────────────────────────────

  /**
   * Devuelve el tracker (con participants ordenados) creándolo si no existe.
   */
  private async ensureTracker(chronicleId: string) {
    const existing = await this.prisma.combatTracker.findUnique({
      where: { chronicleId },
      include: {
        participants: {
          orderBy: { order: 'asc' },
          include: {
            character: {
              select: { id: true, name: true, kind: true, userId: true },
            },
          },
        },
      },
    });
    if (existing) return existing;
    return this.prisma.combatTracker.create({
      data: { chronicleId },
      include: {
        participants: {
          orderBy: { order: 'asc' },
          include: {
            character: {
              select: { id: true, name: true, kind: true, userId: true },
            },
          },
        },
      },
    });
  }

  /**
   * Convierte la entidad Prisma a vista filtrada según el rol del caller.
   * Para jugadores se ocultan participantes que no sean PC y los valores de
   * iniciativa. El `cursor` siempre se devuelve tal cual (apuntando al
   * participante real), pero los jugadores pueden recibir un cursor que
   * apunta a un PC oculto si el turno actual es de un NPC/Antagonist —
   * en ese caso el front muestra "Turno del narrador".
   */
  private toView(
    tracker: Awaited<ReturnType<typeof this.ensureTracker>>,
    role: 'NARRATOR' | 'PLAYER',
  ): CombatStateView {
    const isNarrator = role === 'NARRATOR';
    const all: CombatParticipantView[] = tracker.participants.map((p) => {
      const kind = p.character?.kind ?? 'FREE';
      const fallbackName =
        p.character?.name ?? p.displayName ?? 'Sin nombre';
      const name = p.displayName?.trim() || fallbackName;
      const base: CombatParticipantView = {
        id: p.id,
        characterId: p.characterId,
        name,
        order: p.order,
        kind: kind as CombatParticipantView['kind'],
      };
      if (isNarrator) {
        base.initiative = p.initiative;
        base.ownerId = p.character?.userId ?? null;
      }
      return base;
    });

    if (isNarrator) {
      return {
        chronicleId: tracker.chronicleId,
        cursor: tracker.cursor,
        round: tracker.round,
        participants: all,
        totalParticipants: all.length,
      };
    }

    // Jugador: solo PCs visibles, sin iniciativa.
    const visible = all.filter((p) => p.kind === 'PC');
    // El cursor del jugador apunta al PC activo si el turno actual ES un PC,
    // o a -1 si el turno está en un NPC/Antagonist/FREE (turno del narrador).
    const active = all[tracker.cursor];
    let playerCursor = -1;
    if (active && active.kind === 'PC') {
      playerCursor = visible.findIndex((v) => v.id === active.id);
    }
    return {
      chronicleId: tracker.chronicleId,
      cursor: playerCursor,
      round: tracker.round,
      participants: visible,
      totalParticipants: all.length,
    };
  }

  /**
   * Helper público para el gateway: a partir del estado completo del master,
   * deriva la vista del jugador. Útil cuando el gateway ya tiene el estado
   * post-mutación y necesita emitirlo a las dos audiencias.
   */
  buildPlayerView(masterView: CombatStateView): CombatStateView {
    const visible = masterView.participants.filter((p) => p.kind === 'PC');
    const active = masterView.participants[masterView.cursor];
    let playerCursor = -1;
    if (active && active.kind === 'PC') {
      playerCursor = visible.findIndex((v) => v.id === active.id);
    }
    return {
      chronicleId: masterView.chronicleId,
      cursor: playerCursor,
      round: masterView.round,
      participants: visible.map(({ initiative, ownerId, ...rest }) => rest),
      totalParticipants: masterView.totalParticipants,
    };
  }

  /** Solo narrador puede mutar el combate. */
  assertNarrator(role: 'NARRATOR' | 'PLAYER' | null) {
    if (role !== 'NARRATOR') {
      throw new ForbiddenException('Solo el narrador puede modificar el combate');
    }
  }
}

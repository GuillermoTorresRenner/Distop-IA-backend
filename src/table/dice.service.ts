import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, WillpowerEffect } from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

/// Nivel mínimo de habilidad para poder declarar especialidad (V20).
const MIN_SKILL_FOR_SPECIALTY = 4;
/// Tope defensivo para encadenamiento de rerolls de especialidad: evita un
/// improbable bucle infinito si el RNG saca muchos 10 seguidos.
const MAX_SPECIALTY_CHAIN = 200;

export interface RollVtmInput {
  /** Pool base = atributo + habilidad + bonificadores. Sin restar heridas todavía. */
  pool: number;
  difficulty?: number;
  /** Solo válida si skillRating >= 4. El service revalida y rechaza si no. */
  specialty?: boolean;
  /** Valor de la habilidad declarada (1..5). Requerido si specialty=true. */
  skillRating?: number;
  /** Texto (markdown) de la especialidad para snapshot histórico. */
  specialtyText?: string | null;
  /** +1 éxito automático no removible por 1s. */
  willpowerForSuccess?: boolean;
  /** Anula el penalizador por heridas (lo deja en 0 efectivo). */
  willpowerForWound?: boolean;
  /** Relanza todos los fallos del pool inicial una sola vez (1s del reroll restan). */
  willpowerForReroll?: boolean;
  /**
   * Penalizador por heridas que el cliente calculó (negativo o 0). El back lo
   * persiste tal cual para reproducir el desglose en el historial.
   */
  woundPenalty?: number;
  isPublic?: boolean;
  label?: string | null;
  characterId?: string | null;
  chronicleId: string;
  userId: string;
  /** Origen de la tirada (ej. "DISCIPLINE"). */
  sourceKind?: string | null;
  /** Etiqueta legible del origen (ej. nombre de la disciplina). */
  sourceName?: string | null;
}

export interface RollVtmResult {
  /** Dados del pool inicial. */
  rolls: number[];
  /** Dados extras lanzados por la regla de especialidad (10s detonan). */
  specialtyRerolls: number[];
  /** Dados extras lanzados por la voluntad de reroll (fallos del pool inicial). */
  willpowerRerolls: number[];
  successes: number;
  isBotch: boolean;
  difficulty: number;
  specialty: boolean;
  skillRating: number | null;
  willpowerEffect: WillpowerEffect;
  willpowerSpent: boolean;
  /** Cuántos puntos de voluntad gasta esta tirada (1 por cada flag activo). */
  willpowerCost: number;
  wpForSuccess: boolean;
  wpForWound: boolean;
  wpForReroll: boolean;
  woundPenalty: number;
  /** Pool efectivo tras aplicar heridas (o ignorarlas si willpowerForWound). */
  pool: number;
}

@Injectable()
export class DiceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tira d10s y aplica reglas VtM V20 (variante de la mesa):
   *   - Penalizador por heridas se resta del pool, salvo voluntad WOUND.
   *   - dado >= difficulty cuenta como 1 éxito (10 NO dobla por defecto).
   *   - 1 = -1 éxito (cada 1 del pool resta).
   *   - Especialidad (solo si skillRating>=4): cada 10 detona un dado extra
   *     que se relanza. En ese dado extra: 10 = otro dado encadenado;
   *     1 = -1 éxito; cualquier otro >= dif suma 1 éxito; resto, nada.
   *   - Voluntad éxito: +1 éxito automático no removible por 1s, al final.
   *   - Voluntad reroll: relanza una vez todos los dados del pool inicial
   *     que no fueron éxito (incluidos los 1). En el reroll los 1 también
   *     restan y los 10 vuelven a detonar especialidad si está activa.
   *   - Voluntad herida: anula el penalizador por heridas.
   *   - Botch: 0 o menos éxitos netos pre-WP y al menos un 1 del pool inicial.
   *     La voluntad no rescata de un botch.
   */
  rollVtm(input: {
    pool: number;
    difficulty?: number;
    specialty?: boolean;
    skillRating?: number;
    willpowerForSuccess?: boolean;
    willpowerForWound?: boolean;
    willpowerForReroll?: boolean;
    woundPenalty?: number;
  }): RollVtmResult {
    const basePool = Math.max(1, Math.min(30, Math.floor(input.pool)));
    const safeDiff = Math.max(2, Math.min(10, Math.floor(input.difficulty ?? 6)));
    const skillRating =
      typeof input.skillRating === 'number'
        ? Math.max(0, Math.min(5, Math.floor(input.skillRating)))
        : null;
    const wantedSpecialty = !!input.specialty;
    // La especialidad solo es válida si skillRating>=4. Si no se cumple, el
    // service la deniega: el front debería bloquear el botón pero defendemos
    // la regla del lado del servidor también.
    if (wantedSpecialty && (skillRating === null || skillRating < MIN_SKILL_FOR_SPECIALTY)) {
      throw new BadRequestException(
        `Specialty requires a skill rating of at least ${MIN_SKILL_FOR_SPECIALTY}`,
      );
    }
    const specialty = wantedSpecialty;
    const wpSuccess = !!input.willpowerForSuccess;
    const wpWound = !!input.willpowerForWound;
    const wpReroll = !!input.willpowerForReroll;

    const rawPenalty = Math.min(0, input.woundPenalty ?? 0);
    const effectivePenalty = wpWound ? 0 : rawPenalty;
    const effectivePool = Math.max(1, basePool + effectivePenalty);

    // 1) Tirada inicial.
    //
    // `rawSuccesses` cuenta sólo dados >= dificultad (sin restar 1s).
    // `netSuccesses` aplica la resta de 1s para el resultado final.
    // `onesInPool` cuenta los 1 (no se compensan con rerolls de voluntad
    // a efectos de pifia: un 1 ya hecho es un 1 hecho).
    const rolls: number[] = [];
    let rawSuccesses = 0;
    let netSuccesses = 0;
    let onesInPool = 0;
    for (let i = 0; i < effectivePool; i++) {
      const d = randomInt(1, 11);
      rolls.push(d);
      const { delta, ones } = this.scoreDie(d, safeDiff);
      netSuccesses += delta;
      onesInPool += ones;
      if (d >= safeDiff) rawSuccesses += 1;
    }

    // 2) Reroll de fallos por Voluntad (antes que la especialidad sobre el
    // pool inicial: una decisión razonable, ya que el reroll busca rescatar
    // los fallos; los 10s del reroll detonan especialidad como dados normales).
    const willpowerRerolls: number[] = [];
    if (wpReroll) {
      for (let i = 0; i < rolls.length; i++) {
        const original = rolls[i];
        if (original >= safeDiff) continue;
        // Antes de relanzar: anulamos el efecto del dado original (los 1
        // contaban -1; los demás no contaban nada, así que no hace falta
        // restar para los 2..(diff-1), pero sí "devolver" el -1 si era 1).
        if (original === 1) {
          netSuccesses += 1; // anular el -1 del 1 que vamos a relanzar
          onesInPool -= 1;
        }
        const d = randomInt(1, 11);
        willpowerRerolls.push(d);
        const { delta, ones } = this.scoreDie(d, safeDiff);
        netSuccesses += delta;
        onesInPool += ones;
        if (d >= safeDiff) rawSuccesses += 1;
      }
    }

    // 3) Especialidad: cada 10 del pool inicial + del reroll de voluntad
    // detona un dado extra (encadenable). Si specialty está apagada, no se
    // detona nada.
    const specialtyRerolls: number[] = [];
    if (specialty) {
      let pendingTens =
        rolls.filter((d) => d === 10).length +
        willpowerRerolls.filter((d) => d === 10).length;
      let safety = 0;
      while (pendingTens > 0 && safety < MAX_SPECIALTY_CHAIN) {
        const d = randomInt(1, 11);
        specialtyRerolls.push(d);
        safety += 1;
        pendingTens -= 1;
        const { delta } = this.scoreDie(d, safeDiff);
        netSuccesses += delta;
        if (d === 10) pendingTens += 1;
        if (d >= safeDiff) rawSuccesses += 1;
        // Nota: los 1 del rerroll de especialidad SÍ restan éxitos (delta=-1),
        // pero NO disparan pifia: la pifia se evalúa por el pool original.
      }
    }

    // 4) Botch: SÓLO si no hubo ningún éxito crudo en toda la tirada
    // (pool + rerolls) y hubo al menos un 1. Si el jugador sacó al menos un
    // dado por encima de la dificultad, no es pifia aunque los 1s lo dejen
    // en cero éxitos netos.
    const isBotch = onesInPool > 0 && rawSuccesses === 0;

    let finalSuccesses: number;
    if (isBotch) {
      finalSuccesses = Math.min(netSuccesses, 0);
    } else {
      finalSuccesses = Math.max(0, netSuccesses + (wpSuccess ? 1 : 0));
    }

    // Compat: enum legacy solo refleja SUCCESS/WOUND (no REROLL).
    const willpowerEffect: WillpowerEffect =
      wpSuccess && wpWound
        ? WillpowerEffect.BOTH
        : wpSuccess
          ? WillpowerEffect.SUCCESS
          : wpWound
            ? WillpowerEffect.WOUND
            : WillpowerEffect.NONE;

    const willpowerCost =
      (wpSuccess ? 1 : 0) + (wpWound ? 1 : 0) + (wpReroll ? 1 : 0);

    return {
      rolls,
      specialtyRerolls,
      willpowerRerolls,
      successes: finalSuccesses,
      isBotch,
      difficulty: safeDiff,
      specialty,
      skillRating,
      willpowerEffect,
      willpowerSpent: willpowerCost > 0,
      willpowerCost,
      wpForSuccess: wpSuccess,
      wpForWound: wpWound,
      wpForReroll: wpReroll,
      woundPenalty: rawPenalty,
      pool: effectivePool,
    };
  }

  /// Puntúa un dado individual: devuelve `delta` (cambio en éxitos netos:
  /// +1 si >=dif, -1 si 1, 0 en otro caso) y si fue un 1.
  private scoreDie(d: number, difficulty: number): { delta: number; ones: number } {
    if (d === 1) return { delta: -1, ones: 1 };
    if (d >= difficulty) return { delta: 1, ones: 0 };
    return { delta: 0, ones: 0 };
  }

  /**
   * Ejecuta la tirada y la persiste. Si la tirada gastó Voluntad y está
   * asociada a un personaje, decrementa `willpowerCurrent` atómicamente en
   * la misma transacción (clampeado a >= 0).
   *
   * Devuelve el registro de la tirada + información del consumo de Voluntad
   * (antes/después/cuánto) para que el gateway pueda emitir el sheet:announce
   * correspondiente.
   */
  async rollAndPersist(input: RollVtmInput) {
    const result = this.rollVtm({
      pool: input.pool,
      difficulty: input.difficulty,
      specialty: input.specialty,
      skillRating: input.skillRating,
      willpowerForSuccess: input.willpowerForSuccess,
      willpowerForWound: input.willpowerForWound,
      willpowerForReroll: input.willpowerForReroll,
      woundPenalty: input.woundPenalty,
    });

    const wpCost = result.willpowerCost;

    return this.prisma.$transaction(async (tx) => {
      let willpowerBefore: number | null = null;
      let willpowerAfter: number | null = null;
      let actuallySpent = 0;

      if (input.characterId && wpCost > 0) {
        const character = await tx.character.findUnique({
          where: { id: input.characterId },
          select: { id: true, willpowerCurrent: true },
        });
        if (character) {
          willpowerBefore = character.willpowerCurrent;
          // Clampeamos: nunca gastamos más de lo disponible. Si llegó a este
          // punto con flags activos pero sin saldo, el front debería haberlo
          // evitado; defensivo igual.
          actuallySpent = Math.min(wpCost, character.willpowerCurrent);
          if (actuallySpent > 0) {
            const updated = await tx.character.update({
              where: { id: input.characterId },
              data: { willpowerCurrent: { decrement: actuallySpent } },
              select: { willpowerCurrent: true },
            });
            willpowerAfter = updated.willpowerCurrent;
          } else {
            willpowerAfter = character.willpowerCurrent;
          }
        }
      }

      const created = await tx.diceRoll.create({
        data: {
          chronicleId: input.chronicleId,
          userId: input.userId,
          characterId: input.characterId ?? null,
          label: input.label ?? null,
          pool: result.pool,
          difficulty: result.difficulty,
          specialty: result.specialty,
          skillRating: result.skillRating,
          // Sólo persistimos el texto si efectivamente la tirada usó
          // especialidad. Si no, queda null para no llenar la columna.
          specialtyText: result.specialty
            ? (input.specialtyText ?? null) || null
            : null,
          willpowerSpent: result.willpowerSpent,
          wpForSuccess: result.wpForSuccess,
          wpForWound: result.wpForWound,
          wpForReroll: result.wpForReroll,
          willpowerEffect: result.willpowerEffect,
          woundPenalty: result.woundPenalty,
          rolls: result.rolls,
          specialtyRerolls: result.specialtyRerolls,
          willpowerRerolls: result.willpowerRerolls,
          successes: result.successes,
          isBotch: result.isBotch,
          isPublic: input.isPublic ?? true,
          sourceKind: input.sourceKind ?? null,
          sourceName: input.sourceName ?? null,
        },
        include: {
          user: { select: { id: true, email: true, nickname: true, avatar: true } },
          character: { select: { id: true, name: true, kind: true } },
        },
      });

      return {
        roll: created,
        willpower: {
          before: willpowerBefore,
          after: willpowerAfter,
          spent: actuallySpent,
        },
      };
    });
  }

  /**
   * Historial de tiradas filtrado por las mismas reglas que la emisión WS:
   *   - Públicas (isPublic=true) y de PC: todos las ven.
   *   - Secretas (isPublic=false): sólo el autor (`userId`).
   *   - NPC/ANTAGONIST: autor + narrador.
   *
   * El caller pasa `viewerUserId` y `isViewerNarrator` (lo calcula el
   * controller a partir del membership).
   */
  async listByChronicle(
    chronicleId: string,
    viewerUserId: string,
    isViewerNarrator: boolean,
    limit = 50,
    before?: Date,
  ) {
    return this.prisma.diceRoll.findMany({
      where: {
        chronicleId,
        ...(before ? { createdAt: { lt: before } } : {}),
        OR: [
          // 1) Tiradas públicas de PCs (o sin personaje) — visibles a todos.
          {
            isPublic: true,
            OR: [{ character: null }, { character: { kind: 'PC' } }],
          },
          // 2) Las del propio viewer (cualquier visibilidad).
          { userId: viewerUserId },
          // 3) Si el viewer es narrador: también ve las de NPC/Antag,
          //    pero NO las secretas (isPublic=false) de otros jugadores.
          ...(isViewerNarrator
            ? [
                {
                  isPublic: true,
                  character: { kind: { in: ['NPC', 'ANTAGONIST'] } },
                } as Prisma.DiceRollWhereInput,
              ]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(200, Math.max(1, limit)),
      include: {
        user: { select: { id: true, email: true, nickname: true, avatar: true } },
        character: { select: { id: true, name: true, kind: true } },
      },
    });
  }

  /**
   * Borra TODAS las tiradas de una crónica. Solo el narrador puede hacerlo
   * (la validación de permiso vive en el controller / gateway que llama).
   */
  async clearForChronicle(chronicleId: string): Promise<{ deleted: number }> {
    const res = await this.prisma.diceRoll.deleteMany({
      where: { chronicleId },
    });
    return { deleted: res.count };
  }
}

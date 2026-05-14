import { Injectable } from '@nestjs/common';
import { WillpowerEffect } from '@prisma/client';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface RollVtmInput {
  /** Pool base = atributo + habilidad + bonificadores. Sin restar heridas todavía. */
  pool: number;
  difficulty?: number;
  specialty?: boolean;
  /** +1 éxito automático no removible por 1s. */
  willpowerForSuccess?: boolean;
  /** Anula el penalizador por heridas (lo deja en 0 efectivo). */
  willpowerForWound?: boolean;
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
}

export interface RollVtmResult {
  rolls: number[];
  successes: number;
  isBotch: boolean;
  difficulty: number;
  specialty: boolean;
  willpowerEffect: WillpowerEffect;
  willpowerSpent: boolean;
  woundPenalty: number;
  /** Pool efectivo tras aplicar heridas (o ignorarlas si willpowerForWound). */
  pool: number;
}

@Injectable()
export class DiceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tira d10s y aplica reglas VtM V20:
   *   - El penalizador por heridas se resta del pool, salvo que el personaje
   *     gaste 1 punto de Voluntad para anularlo (willpowerForWound = true).
   *   - dado >= difficulty cuenta como éxito.
   *   - dado == 10 con specialty cuenta como 2 éxitos.
   *   - 1s restan éxitos (cada 1 -1 éxito).
   *   - Si se gasta 1 punto de Voluntad para éxito (willpowerForSuccess),
   *     se suma 1 éxito automático al final, no removible por 1s.
   *   - Botch: 0 éxitos finales con al menos un 1, ANTES de aplicar el éxito
   *     de Voluntad. La Voluntad no rescata de un botch.
   */
  rollVtm(input: {
    pool: number;
    difficulty?: number;
    specialty?: boolean;
    willpowerForSuccess?: boolean;
    willpowerForWound?: boolean;
    woundPenalty?: number;
  }): RollVtmResult {
    const basePool = Math.max(1, Math.min(30, Math.floor(input.pool)));
    const safeDiff = Math.max(2, Math.min(10, Math.floor(input.difficulty ?? 6)));
    const specialty = !!input.specialty;
    const wpSuccess = !!input.willpowerForSuccess;
    const wpWound = !!input.willpowerForWound;

    // Penalizador por heridas (negativo o 0). Si gastamos voluntad para anular,
    // queda 0 efectivo (igual lo conservamos para mostrar el desglose).
    const rawPenalty = Math.min(0, input.woundPenalty ?? 0);
    const effectivePenalty = wpWound ? 0 : rawPenalty;

    // Pool efectivo: nunca por debajo de 1 si la suma base con habilidad/attr era > 0.
    // Como `basePool` ya está clampeado a >= 1, hacemos lo mismo después de aplicar penalty.
    const effectivePool = Math.max(1, basePool + effectivePenalty);

    const rolls: number[] = [];
    let rawSuccesses = 0;
    let ones = 0;

    for (let i = 0; i < effectivePool; i++) {
      const d = randomInt(1, 11);
      rolls.push(d);
      if (d === 1) ones += 1;
      if (d >= safeDiff) {
        rawSuccesses += specialty && d === 10 ? 2 : 1;
      }
    }

    const net = rawSuccesses - ones;
    // Botch: cero o menos éxitos pre-WP y al menos un 1. La WP no rescata.
    const isBotch = ones > 0 && net <= 0 && rawSuccesses === 0;

    let finalSuccesses: number;
    if (isBotch) {
      // No clampeamos a 0 para reflejar que la voluntad no rescata.
      finalSuccesses = Math.min(net, 0);
      // Aun en botch, si gastó voluntad para éxito, el éxito automático sigue
      // existiendo: pero por canon el éxito de WP solo se suma al final si no
      // hay botch. Lo dejamos sin sumar para reflejar regla común.
    } else {
      finalSuccesses = Math.max(0, net + (wpSuccess ? 1 : 0));
    }

    // Calcular el enum según los flags.
    const willpowerEffect: WillpowerEffect = wpSuccess && wpWound
      ? WillpowerEffect.BOTH
      : wpSuccess
        ? WillpowerEffect.SUCCESS
        : wpWound
          ? WillpowerEffect.WOUND
          : WillpowerEffect.NONE;

    return {
      rolls,
      successes: finalSuccesses,
      isBotch,
      difficulty: safeDiff,
      specialty,
      willpowerEffect,
      willpowerSpent: willpowerEffect !== WillpowerEffect.NONE,
      woundPenalty: rawPenalty,
      pool: effectivePool,
    };
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
      willpowerForSuccess: input.willpowerForSuccess,
      willpowerForWound: input.willpowerForWound,
      woundPenalty: input.woundPenalty,
    });

    // Cálculo del costo en Voluntad según los flags efectivos.
    const wpCost =
      (input.willpowerForSuccess ? 1 : 0) +
      (input.willpowerForWound ? 1 : 0);

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
          willpowerSpent: result.willpowerSpent,
          willpowerEffect: result.willpowerEffect,
          woundPenalty: result.woundPenalty,
          rolls: result.rolls,
          successes: result.successes,
          isBotch: result.isBotch,
          isPublic: input.isPublic ?? true,
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

  async listByChronicle(chronicleId: string, limit = 50, before?: Date) {
    return this.prisma.diceRoll.findMany({
      where: {
        chronicleId,
        ...(before ? { createdAt: { lt: before } } : {}),
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

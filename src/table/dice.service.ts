import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface RollVtmInput {
  pool: number;
  difficulty?: number;
  specialty?: boolean;
  willpowerSpent?: boolean;
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
  willpowerSpent: boolean;
  pool: number;
}

@Injectable()
export class DiceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tira d10s y aplica reglas VtM V20:
   *   - dado >= difficulty cuenta como éxito.
   *   - dado == 10 con specialty cuenta como 2 éxitos.
   *   - 1s restan éxitos (cada 1 -1 éxito).
   *   - Willpower agrega +1 éxito *no removible* por 1s
   *     (regla canon: el éxito de Willpower es automático y se aplica al final).
   *   - Botch: 0 éxitos finales con al menos un 1.
   */
  rollVtm(
    pool: number,
    difficulty = 6,
    specialty = false,
    willpowerSpent = false,
  ): RollVtmResult {
    const safePool = Math.max(1, Math.min(30, Math.floor(pool)));
    const safeDiff = Math.max(2, Math.min(10, Math.floor(difficulty)));

    const rolls: number[] = [];
    let rawSuccesses = 0;
    let ones = 0;

    for (let i = 0; i < safePool; i++) {
      // randomInt(1, 11) → 1..10 inclusivo.
      const d = randomInt(1, 11);
      rolls.push(d);
      if (d === 1) ones += 1;
      if (d >= safeDiff) {
        rawSuccesses += specialty && d === 10 ? 2 : 1;
      }
    }

    let net = rawSuccesses - ones;
    const wpBonus = willpowerSpent ? 1 : 0;
    // El éxito de WP es automático y se suma al final.
    let finalSuccesses = net + wpBonus;

    // Botch: cero o menos éxitos (sin contar WP) Y al menos un 1.
    // Reglas comunes V20: si después de aplicar 1s el resultado neto pre-WP
    // es <= 0 y hubo al menos un 1, es botch. La WP no rescata de un botch.
    const isBotch = ones > 0 && net <= 0 && rawSuccesses === 0;
    if (isBotch) {
      finalSuccesses = Math.min(finalSuccesses, 0);
    } else {
      finalSuccesses = Math.max(0, finalSuccesses);
    }

    return {
      rolls,
      successes: finalSuccesses,
      isBotch,
      difficulty: safeDiff,
      specialty,
      willpowerSpent,
      pool: safePool,
    };
  }

  /**
   * Ejecuta la tirada y la persiste. Devuelve el registro completo
   * con datos de autor para que el gateway lo emita por WS.
   */
  async rollAndPersist(input: RollVtmInput) {
    const result = this.rollVtm(
      input.pool,
      input.difficulty,
      input.specialty,
      input.willpowerSpent,
    );

    const created = await this.prisma.diceRoll.create({
      data: {
        chronicleId: input.chronicleId,
        userId: input.userId,
        characterId: input.characterId ?? null,
        label: input.label ?? null,
        pool: result.pool,
        difficulty: result.difficulty,
        specialty: result.specialty,
        willpowerSpent: result.willpowerSpent,
        rolls: result.rolls,
        successes: result.successes,
        isBotch: result.isBotch,
        isPublic: input.isPublic ?? true,
      },
      include: {
        user: { select: { id: true, email: true, nickname: true, avatar: true } },
        character: { select: { id: true, name: true } },
      },
    });

    return created;
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
        character: { select: { id: true, name: true } },
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

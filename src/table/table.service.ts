import { Injectable } from '@nestjs/common';
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
        avatar: true,
      },
    });
  }
}

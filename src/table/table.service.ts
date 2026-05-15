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

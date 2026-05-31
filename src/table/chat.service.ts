import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PersistedChatMessage {
  id: string;
  userId: string;
  characterId: string | null;
  speakerKind: string;
  speakerName: string;
  speakerAvatar: string | null;
  text: string;
  recipientKind: string;
  recipientUserId: string | null;
  createdAt: Date;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async persist(input: {
    id: string;
    chronicleId: string;
    userId: string;
    characterId: string | null;
    speakerKind: string;
    speakerName: string;
    speakerAvatar: string | null;
    text: string;
    recipientKind: string;
    recipientUserId: string | null;
  }): Promise<void> {
    await this.prisma.tableMessage.create({
      data: {
        id: input.id,
        chronicleId: input.chronicleId,
        userId: input.userId,
        characterId: input.characterId,
        speakerKind: input.speakerKind,
        speakerName: input.speakerName,
        speakerAvatar: input.speakerAvatar,
        text: input.text,
        recipientKind: input.recipientKind,
        recipientUserId: input.recipientUserId,
      },
    });
  }

  /**
   * Historial de mensajes filtrado por visibilidad:
   *   - "all": todos los miembros los ven.
   *   - "narrator": solo el narrador y el autor.
   *   - "user": solo el destinatario y el autor.
   * Excluye mensajes borrados (deletedAt != null).
   */
  async listByChronicle(
    chronicleId: string,
    viewerUserId: string,
    isViewerNarrator: boolean,
    limit = 100,
  ): Promise<PersistedChatMessage[]> {
    const rows = await this.prisma.tableMessage.findMany({
      where: {
        chronicleId,
        deletedAt: null,
        OR: [
          { recipientKind: 'all' },
          { userId: viewerUserId },
          ...(isViewerNarrator
            ? [{ recipientKind: 'narrator' }]
            : []),
          { recipientKind: 'user', recipientUserId: viewerUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: Math.min(300, Math.max(1, limit)),
      select: {
        id: true,
        userId: true,
        characterId: true,
        speakerKind: true,
        speakerName: true,
        speakerAvatar: true,
        text: true,
        recipientKind: true,
        recipientUserId: true,
        createdAt: true,
      },
    });
    return rows;
  }

  /**
   * Soft-delete de un mensaje. Solo el autor o el narrador pueden borrar.
   * Devuelve el id del mensaje borrado para el broadcast WS.
   */
  async deleteMessage(
    messageId: string,
    callerId: string,
    narratorId: string | null,
  ): Promise<string> {
    const msg = await this.prisma.tableMessage.findUnique({
      where: { id: messageId },
      select: { id: true, userId: true, deletedAt: true },
    });
    if (!msg) throw new NotFoundException('Mensaje no encontrado');
    if (msg.deletedAt) throw new NotFoundException('Mensaje ya borrado');

    const isAuthor = msg.userId === callerId;
    const isNarrator = !!narratorId && callerId === narratorId;
    if (!isAuthor && !isNarrator) {
      throw new ForbiddenException(
        'Solo el autor o el narrador pueden borrar este mensaje',
      );
    }

    await this.prisma.tableMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), deletedBy: callerId },
    });
    return messageId;
  }
}

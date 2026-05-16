import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { enrichUserWithAvatarUrl } from '../common/utils/avatar.utils';

const userSummarySelect = {
  id: true,
  email: true,
  nickname: true,
  avatar: true,
} satisfies Prisma.UsersSelect;

const messageInclude = {
  sender: { select: userSummarySelect },
  recipient: { select: userSummarySelect },
} satisfies Prisma.DirectMessageInclude;

type RawMessage = Prisma.DirectMessageGetPayload<{ include: typeof messageInclude }>;

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lanza si los dos usuarios no son amigos (ACCEPTED). Mensajes directos
   * solo entre la manada. Si el peer ya no existe o está inactivo también
   * bloquea: el usuario debería sentir que la conversación se "rompió".
   */
  private async assertFriendship(a: string, b: string) {
    if (a === b) {
      throw new BadRequestException('Cannot message yourself');
    }
    const other = await this.prisma.users.findUnique({
      where: { id: b },
      select: { id: true, isActive: true },
    });
    if (!other || other.isActive === false) {
      throw new NotFoundException('User not found');
    }
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { requesterId: a, addresseeId: b },
          { requesterId: b, addresseeId: a },
        ],
      },
      select: { id: true },
    });
    if (!friendship) {
      throw new ForbiddenException('You can only message confirmed friends');
    }
  }

  /**
   * Lista de conversaciones del usuario. Por cada amigo con el que tiene al
   * menos un mensaje, devuelve: peer, último mensaje, y unreadCount (mensajes
   * dirigidos al usuario sin readAt).
   *
   * Implementación: traemos todos los amigos ACCEPTED + a quienes el usuario
   * envió/recibió mensajes (cubre el caso donde la amistad se rompió pero
   * quedó historial). Luego para cada uno consultamos último mensaje y unread.
   */
  async listConversations(currentUserId: string) {
    const friends = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      },
      include: {
        requester: { select: userSummarySelect },
        addressee: { select: userSummarySelect },
      },
      orderBy: { acceptedAt: 'desc' },
    });

    const peers = new Map<
      string,
      { id: string; email: string; nickname: string; avatar: string | null }
    >();
    for (const f of friends) {
      const peer =
        f.requesterId === currentUserId ? f.addressee : f.requester;
      peers.set(peer.id, peer);
    }

    if (peers.size === 0) return [];

    // Último mensaje por par.
    const peerIds = Array.from(peers.keys());
    const lastMessages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: { in: peerIds } },
          { recipientId: currentUserId, senderId: { in: peerIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupamos: nos quedamos con el primer mensaje (más reciente) por peer.
    const lastByPeer = new Map<string, (typeof lastMessages)[number]>();
    for (const m of lastMessages) {
      const peerId = m.senderId === currentUserId ? m.recipientId : m.senderId;
      if (!lastByPeer.has(peerId)) lastByPeer.set(peerId, m);
    }

    // Unread por peer.
    const unread = await this.prisma.directMessage.groupBy({
      by: ['senderId'],
      where: {
        recipientId: currentUserId,
        senderId: { in: peerIds },
        readAt: null,
        deletedAt: null,
      },
      _count: { _all: true },
    });
    const unreadByPeer = new Map<string, number>();
    for (const u of unread) {
      unreadByPeer.set(u.senderId, u._count._all);
    }

    return Array.from(peers.values())
      .map((peer) => {
        const last = lastByPeer.get(peer.id) ?? null;
        return {
          peer: enrichUserWithAvatarUrl(peer),
          lastMessage: last
            ? {
                id: last.id,
                body: last.deletedAt ? '' : last.body,
                deleted: !!last.deletedAt,
                fromMe: last.senderId === currentUserId,
                createdAt: last.createdAt,
              }
            : null,
          unreadCount: unreadByPeer.get(peer.id) ?? 0,
        };
      })
      .sort((a, b) => {
        const ta = a.lastMessage?.createdAt.getTime() ?? 0;
        const tb = b.lastMessage?.createdAt.getTime() ?? 0;
        return tb - ta;
      });
  }

  /**
   * Lista paginada de mensajes entre el usuario actual y un peer. Devuelve
   * en orden ASC (cronológico). Pagina con `before` (cursor por createdAt).
   */
  async listMessages(
    currentUserId: string,
    peerId: string,
    take = 50,
    before?: Date,
  ) {
    await this.assertFriendship(currentUserId, peerId);
    const safeTake = Math.max(1, Math.min(200, take));
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: currentUserId, recipientId: peerId },
          { senderId: peerId, recipientId: currentUserId },
        ],
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: safeTake,
      include: messageInclude,
    });
    // Devolvemos en orden cronológico (ASC) para que el cliente solo apenda.
    return messages.reverse().map((m) => this.serialize(m));
  }

  async send(senderId: string, recipientId: string, rawBody: string) {
    await this.assertFriendship(senderId, recipientId);
    const body = rawBody.trim();
    if (!body) {
      throw new BadRequestException('Message body required');
    }
    if (body.length > 8000) {
      throw new BadRequestException('Message too long (max 8000 chars)');
    }
    const created = await this.prisma.directMessage.create({
      data: { senderId, recipientId, body },
      include: messageInclude,
    });
    return this.serialize(created);
  }

  async softDelete(currentUserId: string, messageId: string) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== currentUserId) {
      throw new ForbiddenException('Only the author can delete the message');
    }
    if (message.deletedAt) {
      return this.serialize(
        await this.prisma.directMessage.findUniqueOrThrow({
          where: { id: messageId },
          include: messageInclude,
        }),
      );
    }
    const updated = await this.prisma.directMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), body: '' },
      include: messageInclude,
    });
    return this.serialize(updated);
  }

  /**
   * Marca como leídos todos los mensajes dirigidos al usuario actual desde
   * `peerId`. Devuelve la lista de ids actualizados (el WS los re-emite al
   * autor para que pueda actualizar el "doble check").
   */
  async markRead(currentUserId: string, peerId: string) {
    await this.assertFriendship(currentUserId, peerId);
    const now = new Date();
    const unread = await this.prisma.directMessage.findMany({
      where: {
        senderId: peerId,
        recipientId: currentUserId,
        readAt: null,
      },
      select: { id: true },
    });
    if (unread.length === 0) return { readIds: [] as string[], at: now };
    await this.prisma.directMessage.updateMany({
      where: { id: { in: unread.map((m) => m.id) } },
      data: { readAt: now },
    });
    return { readIds: unread.map((m) => m.id), at: now };
  }

  async getUnreadCount(currentUserId: string) {
    return this.prisma.directMessage.count({
      where: {
        recipientId: currentUserId,
        readAt: null,
        deletedAt: null,
      },
    });
  }

  private serialize(m: RawMessage) {
    return {
      id: m.id,
      senderId: m.senderId,
      recipientId: m.recipientId,
      body: m.deletedAt ? '' : m.body,
      deleted: !!m.deletedAt,
      readAt: m.readAt,
      createdAt: m.createdAt,
      sender: enrichUserWithAvatarUrl(m.sender),
      recipient: enrichUserWithAvatarUrl(m.recipient),
    };
  }
}

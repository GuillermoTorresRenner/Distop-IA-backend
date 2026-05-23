import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { parse as parseCookie } from 'cookie';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { envs } from '../config/envs';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from './messages.service';

interface DmSocketData {
  userId?: string;
  email?: string;
}

interface SendBody {
  recipientId: string;
  body: string;
}

interface ReadBody {
  peerId: string;
}

interface DeleteBody {
  messageId: string;
}

/**
 * Mensajería directa 1-a-1 entre amigos.
 *
 * Namespace: /messages
 * Auth: misma cookie `accessToken` que el resto de gateways.
 *
 * Rooms: cada usuario se une a `user:<id>` al conectar. Para emitir un mensaje
 * disparamos a las salas del sender y del recipient — ambos lados se enteran
 * en tiempo real sin importar desde qué pestaña/socket estén conectados.
 *
 * Eventos cliente → servidor:
 *   - dm:send      { recipientId, body }    ack { ok, message }
 *   - dm:delete    { messageId }            ack { ok, message }
 *   - dm:read      { peerId }               ack { ok, readIds, at }
 *
 * Eventos servidor → cliente:
 *   - dm:message   { ...message }            mensaje nuevo (para ambos lados)
 *   - dm:deleted   { ...message }            mensaje soft-deleted (body vacío, deleted=true)
 *   - dm:read      { peerId, readIds, at }   el peer leyó tus mensajes
 *   - dm:unread    { count }                 conteo global de no leídos para el viewer
 */
@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: true, credentials: true },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagesGateway.name);

  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly messages: MessagesService,
  ) {}

  afterInit() {
    this.logger.log('MessagesGateway initialized on namespace /messages');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        client.emit('error', { message: 'Unauthenticated' });
        client.disconnect(true);
        return;
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: envs.jwtSecret,
      });
      const user = await this.prisma.users.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, isActive: true },
      });
      if (!user || user.isActive === false) {
        client.emit('error', { message: 'User not found' });
        client.disconnect(true);
        return;
      }
      (client.data as DmSocketData).userId = user.id;
      (client.data as DmSocketData).email = user.email;
      void client.join(this.userRoom(user.id));
      // Empuje inicial de unread para que el cliente actualice el badge sin
      // pedirlo: útil si el navbar se abrió antes de hablar con REST.
      const count = await this.messages.getUnreadCount(user.id);
      client.emit('dm:unread', { count });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Auth failed';
      this.logger.warn(`DM auth failure on ${client.id}: ${msg}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // Sin trabajo extra: socket.io limpia las salas al desconectar.
    const uid = (client.data as DmSocketData)?.userId;
    if (uid) this.logger.debug(`DM disconnect ${client.id} user=${uid}`);
  }

  @SubscribeMessage('dm:send')
  async onSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SendBody,
  ) {
    const senderId = (client.data as DmSocketData).userId;
    if (!senderId) throw new WsException('Unauthenticated');
    if (!body?.recipientId || typeof body.body !== 'string') {
      throw new WsException('Invalid payload');
    }
    const message = await this.messages.send(
      senderId,
      body.recipientId,
      body.body,
    );
    // Emitimos a las dos salas (sender y recipient). El receptor además
    // recibe un push del nuevo conteo global de unread.
    this.server.to(this.userRoom(message.senderId)).emit('dm:message', message);
    this.server
      .to(this.userRoom(message.recipientId))
      .emit('dm:message', message);
    const recipientCount = await this.messages.getUnreadCount(
      message.recipientId,
    );
    this.server.to(this.userRoom(message.recipientId)).emit('dm:unread', {
      count: recipientCount,
    });
    return { ok: true, message };
  }

  @SubscribeMessage('dm:delete')
  async onDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: DeleteBody,
  ) {
    const senderId = (client.data as DmSocketData).userId;
    if (!senderId) throw new WsException('Unauthenticated');
    if (!body?.messageId) throw new WsException('Invalid payload');
    const message = await this.messages.softDelete(senderId, body.messageId);
    this.server.to(this.userRoom(message.senderId)).emit('dm:deleted', message);
    this.server
      .to(this.userRoom(message.recipientId))
      .emit('dm:deleted', message);
    // El conteo del recipient puede haber cambiado (si el mensaje borrado
    // todavía estaba sin leer).
    const recipientCount = await this.messages.getUnreadCount(
      message.recipientId,
    );
    this.server.to(this.userRoom(message.recipientId)).emit('dm:unread', {
      count: recipientCount,
    });
    return { ok: true, message };
  }

  @SubscribeMessage('dm:read')
  async onRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ReadBody,
  ) {
    const userId = (client.data as DmSocketData).userId;
    if (!userId) throw new WsException('Unauthenticated');
    if (!body?.peerId) throw new WsException('Invalid payload');
    const { readIds, at } = await this.messages.markRead(userId, body.peerId);
    if (readIds.length > 0) {
      // El autor original (peer) ve que sus mensajes fueron leídos.
      this.server.to(this.userRoom(body.peerId)).emit('dm:read', {
        peerId: userId,
        readIds,
        at,
      });
    }
    // Actualizamos el unread global del propio viewer (le quita el badge).
    const count = await this.messages.getUnreadCount(userId);
    this.server.to(this.userRoom(userId)).emit('dm:unread', { count });
    return { ok: true, readIds, at };
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string | null {
    const raw = client.handshake.headers.cookie;
    if (raw) {
      const cookies = parseCookie(raw);
      if (cookies.accessToken) return cookies.accessToken;
    }
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length) return fromAuth;
    return null;
  }
}

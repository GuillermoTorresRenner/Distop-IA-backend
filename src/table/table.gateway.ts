import { Logger, UseFilters } from '@nestjs/common';
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
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { parse as parseCookie } from 'cookie';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { envs } from '../config/envs';
import { TableService } from './table.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { AuthenticatedSocketData } from './types/socket-with-user';

// `Socket` se usa como anotación en decoradores: debe ser un valor en tiempo
// de emit metadata. Por eso `AuthenticatedSocket` no se usa como anotación
// directa de parámetros; se lee `client.data as AuthenticatedSocketData`.

/**
 * Mesa de juego en tiempo real.
 *
 * Namespace: /table
 * Auth: cookie HTTP-only `accessToken` (JWT) en el handshake.
 * Rooms: `chronicle:<chronicleId>` (uno por crónica).
 *
 * Eventos cliente → servidor:
 *   - `table:join`     { chronicleId } → ack { ok, members }
 *   - `table:leave`    {} → ack { ok }
 *   - `chat:message`   { text } → broadcast `chat:message`
 *
 * Eventos servidor → cliente:
 *   - `presence:list`  { members[] }   — snapshot al unirse
 *   - `presence:join`  { member }      — alguien entra
 *   - `presence:leave` { userId }      — alguien sale
 *   - `chat:message`   { id, userId, email, text, at }
 *   - `error`          { message }
 */
@WebSocketGateway({
  namespace: '/table',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class TableGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TableGateway.name);

  @WebSocketServer() server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly tableService: TableService,
  ) {}

  afterInit() {
    this.logger.log('TableGateway initialized on namespace /table');
  }

  // ──────────────────────────────────────────────
  // Conexión
  // ──────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`Connection rejected (no token): ${client.id}`);
        client.emit('error', { message: 'Unauthenticated' });
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: envs.jwtSecret,
      });

      const user = await this.tableService.getUserPublic(payload.sub);
      if (!user) {
        client.emit('error', { message: 'User not found' });
        client.disconnect(true);
        return;
      }

      client.data.userId = user.id;
      client.data.email = user.email;
      this.logger.log(`Client connected: ${client.id} user=${user.email}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed';
      this.logger.warn(`Auth failure on ${client.id}: ${message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId, chronicleId } = (client.data ?? {}) as AuthenticatedSocketData;
    if (userId && chronicleId) {
      const room = this.roomName(chronicleId);
      // Notifica a la sala que el usuario se fue solo si era su última conexión.
      const stillConnected = await this.userHasOtherSockets(
        userId,
        chronicleId,
        client.id,
      );
      if (!stillConnected) {
        this.server.to(room).emit('presence:leave', { userId });
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ──────────────────────────────────────────────
  // Eventos
  // ──────────────────────────────────────────────

  @SubscribeMessage('table:join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { chronicleId?: string },
  ) {
    const userId = client.data?.userId;
    if (!userId) throw new WsException('Unauthenticated');

    const chronicleId = body?.chronicleId;
    if (!chronicleId) throw new WsException('chronicleId required');

    const role = await this.tableService.getMembership(userId, chronicleId);
    if (!role) throw new WsException('Forbidden: not a member of this chronicle');

    // Si el socket estaba en otra mesa, sacarlo primero.
    if (client.data.chronicleId && client.data.chronicleId !== chronicleId) {
      await client.leave(this.roomName(client.data.chronicleId));
    }

    const room = this.roomName(chronicleId);
    await client.join(room);
    client.data.chronicleId = chronicleId;

    // Notifica al resto que entró (solo si es el primer socket de este usuario en la sala).
    const wasAlreadyHere = await this.userHasOtherSockets(
      userId,
      chronicleId,
      client.id,
    );
    if (!wasAlreadyHere) {
      const user = await this.tableService.getUserPublic(userId);
      this.server.to(room).emit('presence:join', {
        member: { ...user, role },
      });
    }

    // Snapshot de presencia para el que recién entró.
    const members = await this.collectPresence(chronicleId);
    return { ok: true, members, role };
  }

  @SubscribeMessage('table:leave')
  async onLeave(@ConnectedSocket() client: Socket) {
    const { chronicleId, userId } = client.data ?? {};
    if (!chronicleId || !userId) return { ok: true };

    const room = this.roomName(chronicleId);
    await client.leave(room);
    client.data.chronicleId = undefined;

    const stillConnected = await this.userHasOtherSockets(
      userId,
      chronicleId,
      client.id,
    );
    if (!stillConnected) {
      this.server.to(room).emit('presence:leave', { userId });
    }
    return { ok: true };
  }

  @SubscribeMessage('chat:message')
  async onChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: ChatMessageDto,
  ) {
    const { userId, email, chronicleId } = client.data ?? {};
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    const text = (body?.text ?? '').toString().trim();
    if (!text) throw new WsException('Empty message');
    if (text.length > 2000) throw new WsException('Message too long');

    const room = this.roomName(chronicleId);
    const message = {
      id: `${Date.now()}-${client.id}`,
      userId,
      email,
      text,
      at: new Date().toISOString(),
    };
    this.server.to(room).emit('chat:message', message);
    return { ok: true, id: message.id };
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private roomName(chronicleId: string) {
    return `chronicle:${chronicleId}`;
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // 1) Cookie (caso normal: browser con withCredentials).
    const rawCookie = client.handshake.headers.cookie;
    if (rawCookie) {
      const cookies = parseCookie(rawCookie);
      if (cookies.accessToken) return cookies.accessToken;
    }
    // 2) auth payload (fallback para clientes server-to-server).
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.length) return fromAuth;
    return null;
  }

  /**
   * ¿El usuario tiene OTRO socket conectado a la misma sala (distinto del actual)?
   * Sirve para emitir presence:join/leave una sola vez por usuario.
   */
  private async userHasOtherSockets(
    userId: string,
    chronicleId: string,
    excludeSocketId: string,
  ): Promise<boolean> {
    const sockets = await this.server.in(this.roomName(chronicleId)).fetchSockets();
    return sockets.some(
      (s) => s.id !== excludeSocketId && s.data?.userId === userId,
    );
  }

  /**
   * Lista única de miembros presentes en la sala (un usuario = una entrada,
   * aunque tenga varias pestañas abiertas).
   */
  private async collectPresence(chronicleId: string): Promise<
    Array<{
      id: string;
      email: string;
      avatar: string | null;
      role: string | null;
    }>
  > {
    const sockets = await this.server.in(this.roomName(chronicleId)).fetchSockets();
    const seen = new Map<string, { id: string; email: string }>();
    for (const s of sockets) {
      const uid = (s.data as AuthenticatedSocketData)?.userId;
      const email = (s.data as AuthenticatedSocketData)?.email;
      if (uid && !seen.has(uid)) {
        seen.set(uid, { id: uid, email });
      }
    }
    const result: Array<{
      id: string;
      email: string;
      avatar: string | null;
      role: string | null;
    }> = [];
    for (const m of seen.values()) {
      const user = await this.tableService.getUserPublic(m.id);
      const role = await this.tableService.getMembership(m.id, chronicleId);
      if (user) result.push({ ...user, role });
    }
    return result;
  }
}

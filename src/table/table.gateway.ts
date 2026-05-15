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
import { DiceService } from './dice.service';
import { BoardShareDto, BoardUpdateDto } from './dto/board-update.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { RollVtmDto } from './dto/roll-vtm.dto';
import { SheetUpdateAnnounceDto } from './dto/sheet-update-announce.dto';
import { BoardService } from './board.service';
import { CombatService, type CombatStateView } from './combat.service';
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
    private readonly diceService: DiceService,
    private readonly boardService: BoardService,
    private readonly combatService: CombatService,
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
    const kind = body?.recipient?.kind ?? 'all';
    const targetUserId =
      kind === 'user' ? body?.recipient?.userId ?? null : null;

    if (kind === 'user' && !targetUserId) {
      throw new WsException('recipient.userId required when kind === "user"');
    }

    const narratorId = await this.tableService.getNarratorId(chronicleId);

    // Identidad del hablante. Por defecto: nickname del usuario. Si pidió
    // hablar como un PJ, validamos que sea suyo y esté asociado a la crónica.
    let speaker: { kind: 'self' | 'character'; name: string; characterId: string | null };
    const asReq = body?.as;
    if (asReq?.kind === 'character' && asReq.characterId) {
      const ctx = await this.tableService.getCharacterContext(
        chronicleId,
        asReq.characterId,
      );
      if (!ctx) {
        throw new WsException('Personaje no asociado a esta crónica');
      }
      if (ctx.ownerId !== userId) {
        throw new WsException('Solo puedes hablar como personajes propios');
      }
      speaker = {
        kind: 'character',
        name: ctx.name,
        characterId: ctx.id,
      };
    } else {
      const nick = await this.tableService.getUserDisplayName(userId);
      speaker = { kind: 'self', name: nick, characterId: null };
    }

    const message = {
      id: `${Date.now()}-${client.id}`,
      userId,
      email,
      speaker,
      text,
      at: new Date().toISOString(),
      recipient: {
        kind,
        userId: targetUserId,
      } as { kind: 'all' | 'narrator' | 'user'; userId: string | null },
    };

    if (kind === 'all') {
      this.server.to(room).emit('chat:message', message);
      return { ok: true, id: message.id };
    }

    // Privado (narrador o usuario específico): emitimos sólo a autor + target.
    // El autor siempre recibe copia para que el mensaje se vea en su feed.
    const allowedIds = new Set<string>([userId]);
    if (kind === 'narrator' && narratorId) allowedIds.add(narratorId);
    if (kind === 'user' && targetUserId) allowedIds.add(targetUserId);

    const sockets = await this.server.in(room).fetchSockets();
    for (const s of sockets) {
      const sUid = (s.data as AuthenticatedSocketData)?.userId;
      if (sUid && allowedIds.has(sUid)) {
        s.emit('chat:message', message);
      }
    }
    return { ok: true, id: message.id };
  }

  @SubscribeMessage('roll:vtm')
  async onRollVtm(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RollVtmDto,
  ) {
    const { userId, chronicleId } = (client.data ?? {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    // Persiste y obtiene la tirada con autor + personaje + decremento de WP.
    const { roll, willpower } = await this.diceService.rollAndPersist({
      chronicleId,
      userId,
      characterId: body.characterId ?? null,
      label: body.label ?? null,
      pool: body.pool,
      difficulty: body.difficulty,
      specialty: body.specialty,
      willpowerForSuccess: body.willpowerForSuccess,
      willpowerForWound: body.willpowerForWound,
      woundPenalty: body.woundPenalty,
      isPublic: body.isPublic ?? true,
    });

    const room = this.roomName(chronicleId);

    // ── Reglas de visibilidad de la tirada ──────────────────
    //
    // 1) Si la tirada está asociada a un personaje NPC/ANTAGONIST, es secreta
    //    por construcción: solo el autor y el narrador la ven, sin importar
    //    el toggle "Privada".
    // 2) Si el toggle "Privada" está activo: solo autor + narrador.
    // 3) Caso normal (PC público): broadcast a toda la sala.
    const characterKind = roll.character?.kind ?? null;
    const isSecretByKind =
      characterKind === 'NPC' || characterKind === 'ANTAGONIST';
    const goesPublic = roll.isPublic && !isSecretByKind;

    const narratorId = await this.tableService.getNarratorId(chronicleId);

    if (goesPublic) {
      this.server.to(room).emit('roll:result', roll);
    } else {
      const sockets = await this.server.in(room).fetchSockets();
      for (const s of sockets) {
        const sUid = (s.data as AuthenticatedSocketData)?.userId;
        if (sUid === userId || (narratorId && sUid === narratorId)) {
          s.emit('roll:result', roll);
        }
      }
    }

    // ── Anuncio del consumo de Voluntad en el chat ──────────
    //
    // Si se gastó al menos 1 punto y la tirada está asociada a un personaje,
    // emitimos un sheet:announce con el delta. La visibilidad sigue las mismas
    // reglas que la tirada: si la tirada es secreta (kind no-PC) o privada
    // (isPublic=false), el anuncio también lo es. Si la tirada va a la sala,
    // el anuncio también va a la sala.
    if (
      roll.character &&
      willpower.spent > 0 &&
      willpower.before !== null &&
      willpower.after !== null
    ) {
      const announce = {
        id: `wp-${Date.now()}-${client.id}`,
        characterId: roll.character.id,
        characterName: roll.character.name,
        kind: characterKind ?? 'PC',
        authorId: userId,
        deltas: [
          {
            label: 'Voluntad actual',
            before: String(willpower.before),
            after: String(willpower.after),
          },
        ],
        at: new Date().toISOString(),
      };
      if (goesPublic) {
        this.server.to(room).emit('sheet:announce', announce);
      } else {
        const sockets = await this.server.in(room).fetchSockets();
        for (const s of sockets) {
          const sUid = (s.data as AuthenticatedSocketData)?.userId;
          if (sUid === userId || (narratorId && sUid === narratorId)) {
            s.emit('sheet:announce', announce);
          }
        }
      }
    }

    return { ok: true, id: roll.id };
  }

  /**
   * Anuncia un cambio en la hoja del personaje a la sala.
   * Si el personaje es PC, lo ve toda la mesa.
   * Si es NPC/ANTAGONIST, solo el narrador.
   *
   * El cliente ya hizo la persistencia vía REST (PATCH). Este evento
   * solo difunde el "qué cambió" en formato legible para el chat.
   */
  @SubscribeMessage('sheet:announce')
  async onSheetAnnounce(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: SheetUpdateAnnounceDto,
  ) {
    const { userId, chronicleId } = (client.data ?? {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');
    if (!body?.characterId || !Array.isArray(body.deltas) || body.deltas.length === 0) {
      return { ok: true };
    }

    const ctx = await this.tableService.getCharacterContext(
      chronicleId,
      body.characterId,
    );
    if (!ctx) throw new WsException('Character not in this chronicle');

    // Solo el dueño o el narrador pueden anunciar cambios.
    const narratorId = await this.tableService.getNarratorId(chronicleId);
    const isOwner = ctx.ownerId === userId;
    const isNarrator = narratorId === userId;
    if (!isOwner && !isNarrator) {
      throw new WsException(
        'Forbidden: only owner or narrator can announce sheet changes',
      );
    }

    const payload = {
      id: `sheet-${Date.now()}-${client.id}`,
      characterId: ctx.id,
      characterName: ctx.name,
      kind: ctx.kind,
      authorId: userId,
      deltas: body.deltas,
      at: new Date().toISOString(),
    };

    const room = this.roomName(chronicleId);

    if (ctx.kind === 'PC') {
      this.server.to(room).emit('sheet:announce', payload);
      return { ok: true };
    }

    // NPC / ANTAGONIST: solo el narrador (puede haber varios sockets del narrador).
    if (!narratorId) return { ok: true };
    const sockets = await this.server.in(room).fetchSockets();
    for (const s of sockets) {
      const sUid = (s.data as AuthenticatedSocketData)?.userId;
      if (sUid === narratorId) {
        s.emit('sheet:announce', payload);
      }
    }
    return { ok: true };
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private async getNarratorIdInRoom(chronicleId: string): Promise<string | null> {
    const sockets = await this.server.in(this.roomName(chronicleId)).fetchSockets();
    for (const s of sockets) {
      const uid = (s.data as AuthenticatedSocketData)?.userId;
      if (!uid) continue;
      const role = await this.tableService.getMembership(uid, chronicleId);
      if (role === 'NARRATOR') return uid;
    }
    return null;
  }

  // ──────────────────────────────────────────────
  // Pizarra colaborativa
  // ──────────────────────────────────────────────

  /**
   * El narrador activa/desactiva el modo "compartido" de la pizarra.
   * Al activar, se broadcastea el snapshot actual a la sala así los jugadores
   * pueden hidratar el lienzo. Al desactivar se les notifica para que vuelvan
   * a su pizarra local.
   */
  @SubscribeMessage('board:share')
  async onBoardShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: BoardShareDto,
  ) {
    const { userId, chronicleId } = (client.data ?? {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    const board = await this.boardService.setShared(
      chronicleId,
      userId,
      !!body?.isShared,
    );
    const room = this.roomName(chronicleId);
    this.server.to(room).emit('board:shared', {
      chronicleId,
      isShared: board.isShared,
      elements: board.elements as unknown[],
      appState: board.appState as Record<string, unknown> | null,
      fileRefs: (board.fileRefs ?? {}) as Record<
        string,
        { url: string; mimeType: string }
      >,
      at: new Date().toISOString(),
    });
    return { ok: true, isShared: board.isShared };
  }

  /**
   * El narrador empuja un snapshot vivo de su lienzo (debounced en cliente).
   * Solo se broadcastea si la pizarra está actualmente compartida: si no, es
   * solo edición privada y no toca a los jugadores.
   *
   * No persistimos aquí (lo hace el PUT REST cuando el narrador guarda
   * explícitamente o al cambiar el flag de share). Esto evita pegarle a la DB
   * en cada movimiento de lápiz.
   */
  @SubscribeMessage('board:update')
  async onBoardUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: BoardUpdateDto,
  ) {
    const { userId, chronicleId } = (client.data ?? {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    // Solo el narrador puede empujar updates.
    const narratorId = await this.tableService.getNarratorId(chronicleId);
    if (narratorId !== userId) {
      throw new WsException('Only the narrator can update the board');
    }

    // Si la pizarra no está compartida, ignoramos el broadcast.
    const board = await this.boardService.getBoardForMember(chronicleId, userId);
    if (!board.isShared) return { ok: true, broadcasted: false };

    const room = this.roomName(chronicleId);
    this.server.to(room).except(client.id).emit('board:updated', {
      chronicleId,
      elements: body.elements,
      appState: body.appState ?? null,
      at: new Date().toISOString(),
    });
    return { ok: true, broadcasted: true };
  }

  /**
   * Notifica a toda la sala que el historial de tiradas fue limpiado.
   * Lo invoca el controller después de un DELETE exitoso.
   */
  broadcastRollsCleared(chronicleId: string, by: { userId: string }) {
    this.server.to(this.roomName(chronicleId)).emit('rolls:cleared', {
      chronicleId,
      by,
      at: new Date().toISOString(),
    });
  }

  /**
   * Emite el estado del combate. La vista del MASTER se envía al narrador;
   * la vista del jugador (filtrada — solo PCs, sin iniciativas) al resto.
   * El narrador siempre se identifica por `chronicle.narratorId`.
   */
  async broadcastCombat(chronicleId: string, masterView: CombatStateView) {
    const room = this.roomName(chronicleId);
    const narratorId = await this.tableService.getNarratorId(chronicleId);
    const playerView = this.combatService.buildPlayerView(masterView);
    const sockets = await this.server.in(room).fetchSockets();
    for (const s of sockets) {
      const uid = (s.data as AuthenticatedSocketData)?.userId;
      if (uid && uid === narratorId) {
        s.emit('combat:state', masterView);
      } else {
        s.emit('combat:state', playerView);
      }
    }
  }

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
      nickname: string | null;
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
      nickname: string | null;
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

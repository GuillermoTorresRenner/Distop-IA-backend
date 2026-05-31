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
import { buildCharacterAvatarUrl } from '../common/utils/character.utils';
import { buildUserAvatarUrl } from '../common/utils/avatar.utils';
import { envs } from '../config/envs';
import { PresenceService } from '../presence/presence.service';
import { TableService } from './table.service';
import { DiceService } from './dice.service';
import { BoardShareDto, BoardUpdateDto } from './dto/board-update.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { RollInitiativeDto } from './dto/roll-initiative.dto';
import { RollPowerDto } from './dto/roll-power.dto';
import { RollVtmDto } from './dto/roll-vtm.dto';
import { SheetUpdateAnnounceDto } from './dto/sheet-update-announce.dto';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
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
    private readonly chatService: ChatService,
    private readonly boardService: BoardService,
    private readonly combatService: CombatService,
    private readonly presenceService: PresenceService,
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
      this.presenceService.add(user.id, client.id);
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
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (userId) {
      this.presenceService.remove(userId, client.id);
    }
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
    if (!role)
      throw new WsException('Forbidden: not a member of this chronicle');

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
      kind === 'user' ? (body?.recipient?.userId ?? null) : null;

    if (kind === 'user' && !targetUserId) {
      throw new WsException('recipient.userId required when kind === "user"');
    }

    const narratorId = await this.tableService.getNarratorId(chronicleId);

    // Identidad del hablante. Por defecto: nickname + avatar del usuario.
    // Si pidió hablar como un PJ, validamos que sea suyo y esté asociado a
    // la crónica, y usamos el retrato del personaje.
    //
    // El campo `avatar` que viaja al cliente es una URL pública relativa
    // (`/images/...`). El front la resuelve via NPM en QA/prod o via el
    // proxy de vite en dev.
    let speaker: {
      kind: 'self' | 'character';
      name: string;
      characterId: string | null;
      avatar: string | null;
    };
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
        avatar: ctx.avatar ? buildCharacterAvatarUrl(ctx.avatar) : null,
      };
    } else {
      const info = await this.tableService.getUserSpeakerInfo(userId);
      speaker = {
        kind: 'self',
        name: info.name,
        characterId: null,
        avatar: info.avatar ? buildUserAvatarUrl(info.avatar) : null,
      };
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

    // Persistir antes de emitir (fire-and-forget, no bloqueamos el broadcast).
    void this.chatService.persist({
      id: message.id,
      chronicleId,
      userId,
      characterId: speaker.characterId,
      speakerKind: speaker.kind,
      speakerName: speaker.name,
      speakerAvatar: speaker.avatar,
      text,
      recipientKind: kind,
      recipientUserId: targetUserId,
    });

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
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
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
      skillRating: body.skillRating,
      specialtyText: body.specialtyText,
      sourceKind: body.sourceKind,
      sourceName: body.sourceName,
      willpowerForSuccess: body.willpowerForSuccess,
      willpowerForWound: body.willpowerForWound,
      willpowerForReroll: body.willpowerForReroll,
      woundPenalty: body.woundPenalty,
      isPublic: body.isPublic ?? true,
    });

    const room = this.roomName(chronicleId);

    // ── Reglas de visibilidad de la tirada ──────────────────
    //
    // 1) Si la tirada está asociada a un personaje NPC/ANTAGONIST, va al autor
    //    y al narrador (herramienta del narrador, jugadores no la ven).
    // 2) Si el jugador marcó "Secreta" (isPublic=false): SOLO el autor. Nadie
    //    más la ve, ni siquiera el narrador.
    // 3) Caso normal (PC público): broadcast a toda la sala.
    const characterKind = roll.character?.kind ?? null;
    const isSecretByKind =
      characterKind === 'NPC' || characterKind === 'ANTAGONIST';
    const isSecret = !roll.isPublic;
    const goesPublic = roll.isPublic && !isSecretByKind;

    const narratorId = await this.tableService.getNarratorId(chronicleId);

    if (goesPublic) {
      this.server.to(room).emit('roll:result', this.withCharacterAvatarUrl(roll));
    } else {
      const sockets = await this.server.in(room).fetchSockets();
      for (const s of sockets) {
        const sUid = (s.data as AuthenticatedSocketData)?.userId;
        // Secreta del jugador: sólo el autor.
        // Secreta por kind (NPC/Antag): autor + narrador.
        const isAuthor = sUid === userId;
        const isNarrator = !!narratorId && sUid === narratorId;
        const allowed = isSecret ? isAuthor : isAuthor || isNarrator;
        if (allowed) {
          s.emit('roll:result', this.withCharacterAvatarUrl(roll));
        }
      }
    }

    // ── Anuncio del consumo de Voluntad en el chat ──────────
    //
    // Si se gastó al menos 1 punto y la tirada está asociada a un personaje,
    // emitimos un sheet:announce con el delta — pero SÓLO para PCs. Las
    // hojas de NPCs/Antagonistas son herramientas internas del narrador:
    // no anunciamos sus cambios en el chat para evitar spam (ni siquiera
    // al narrador, que ya ve el estado en el panel embebido).
    //
    // Si la tirada es secreta (isPublic=false), el anuncio del PC sigue
    // siendo privado (sólo el autor). Si es pública, va a toda la sala.
    if (
      roll.character &&
      roll.character.kind === 'PC' &&
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
          const isAuthor = sUid === userId;
          const isNarrator = !!narratorId && sUid === narratorId;
          // Misma regla que la tirada que dispara este anuncio.
          const allowed = isSecret ? isAuthor : isAuthor || isNarrator;
          if (allowed) {
            s.emit('sheet:announce', announce);
          }
        }
      }
    }

    return { ok: true, id: roll.id };
  }

  /**
   * Tirada de iniciativa (V20): 1d10 + Destreza + Astucia del personaje.
   *
   * Reglas:
   *  - El personaje debe estar asociado a la crónica.
   *  - Si es PC: solo el dueño o el narrador pueden tirar.
   *  - Si es NPC/ANTAGONIST: solo el narrador puede tirar.
   *
   * Efectos:
   *  - Persiste la tirada con sourceKind='INITIATIVE' y metadata desglosada.
   *  - Emite `roll:result` siguiendo las mismas reglas de visibilidad que
   *    las tiradas V20 (PC públicas: a toda la sala; NPC/Antag o secretas:
   *    autor + narrador; secretas-jugador: solo autor).
   *  - Inscribe o actualiza al personaje en el tracker de turnos con el
   *    total como iniciativa y emite `combat:state` a toda la sala.
   */
  @SubscribeMessage('roll:initiative')
  async onRollInitiative(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RollInitiativeDto,
  ) {
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    const ctx = await this.tableService.getInitiativeStats(
      chronicleId,
      body.characterId,
    );
    if (!ctx) throw new WsException('Personaje no asociado a esta crónica');

    const narratorId = await this.tableService.getNarratorId(chronicleId);
    const isNarrator = narratorId === userId;
    const isOwner = ctx.ownerId === userId;

    if (ctx.kind === 'PC') {
      if (!isOwner && !isNarrator) {
        throw new WsException(
          'Solo el dueño del personaje o el narrador pueden tirar su iniciativa',
        );
      }
    } else {
      if (!isNarrator) {
        throw new WsException(
          'Solo el narrador puede tirar la iniciativa de PNJs o antagonistas',
        );
      }
    }

    const { roll } = await this.diceService.rollInitiative({
      chronicleId,
      userId,
      characterId: ctx.id,
      label: body.label ?? null,
      isPublic: body.isPublic ?? true,
      dexterity: ctx.dexterity,
      wits: ctx.wits,
      characterName: ctx.name,
      modifier: body.modifier,
    });

    const room = this.roomName(chronicleId);
    const isSecretByKind = ctx.kind === 'NPC' || ctx.kind === 'ANTAGONIST';
    const isSecret = !roll.isPublic;
    const goesPublic = roll.isPublic && !isSecretByKind;

    if (goesPublic) {
      this.server.to(room).emit('roll:result', this.withCharacterAvatarUrl(roll));
    } else {
      const sockets = await this.server.in(room).fetchSockets();
      for (const s of sockets) {
        const sUid = (s.data as AuthenticatedSocketData)?.userId;
        const isAuthor = sUid === userId;
        const isViewerNarrator = !!narratorId && sUid === narratorId;
        const allowed = isSecret ? isAuthor : isAuthor || isViewerNarrator;
        if (allowed) s.emit('roll:result', this.withCharacterAvatarUrl(roll));
      }
    }

    // Inscribe/actualiza al personaje en el tracker con el total.
    const metadata = roll.metadata as { total: number } | null;
    const total = metadata?.total ?? ctx.dexterity + ctx.wits;
    const combatState = await this.combatService.addOrUpdateForInitiative(
      chronicleId,
      ctx.id,
      total,
    );
    await this.broadcastCombat(chronicleId, combatState);

    return { ok: true, id: roll.id };
  }

  /**
   * Tirada activa de un poder o ritual. El servidor:
   *  - Resuelve el poder/ritual desde el catálogo.
   *  - Valida que el personaje lo conoce al nivel necesario (o que tiene
   *    el ritual aprendido si es un ritual).
   *  - Construye el pool = atributo + habilidad + modificador.
   *  - Tira con la dificultad declarada en el catálogo (V20: éxitos,
   *    pifia, etc.) y persiste con `sourceKind='POWER'`.
   *  - Emite `roll:result` con visibilidad según el tipo de personaje.
   *
   * Si el poder no tiene tirada activa (rollAttribute null) se rechaza
   * el evento — la UI debería bloquear el botón en ese caso, esto es
   * defensa de servidor.
   */
  @SubscribeMessage('roll:power')
  async onRollPower(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: RollPowerDto,
  ) {
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    const prepared = await this.tableService.prepareRollPower({
      chronicleId,
      characterId: body.characterId,
      callerId: userId,
      powerId: body.powerId,
      ritualId: body.ritualId,
      modifier: body.modifier,
    });
    if (!prepared) {
      throw new WsException(
        'Este poder o ritual no tiene tirada activa configurada',
      );
    }

    const narratorId = await this.tableService.getNarratorId(chronicleId);
    const isNarrator = narratorId === userId;
    const isOwner = prepared.character.ownerId === userId;
    if (prepared.character.kind === 'PC') {
      if (!isOwner && !isNarrator) {
        throw new WsException(
          'Solo el dueño del personaje o el narrador pueden tirar sus poderes',
        );
      }
    } else if (!isNarrator) {
      throw new WsException(
        'Solo el narrador puede tirar poderes de PNJs o antagonistas',
      );
    }

    const { roll } = await this.diceService.rollPower({
      chronicleId,
      userId,
      characterId: prepared.character.id,
      label: body.label ?? null,
      isPublic: body.isPublic ?? true,
      pool: prepared.pool,
      difficulty: prepared.difficulty,
      sourceName: prepared.sourceName,
      metadata: prepared.metadata,
    });

    const room = this.roomName(chronicleId);
    const isSecretByKind =
      prepared.character.kind === 'NPC' ||
      prepared.character.kind === 'ANTAGONIST';
    const isSecret = !roll.isPublic;
    const goesPublic = roll.isPublic && !isSecretByKind;

    if (goesPublic) {
      this.server.to(room).emit('roll:result', this.withCharacterAvatarUrl(roll));
    } else {
      const sockets = await this.server.in(room).fetchSockets();
      for (const s of sockets) {
        const sUid = (s.data as AuthenticatedSocketData)?.userId;
        const isAuthor = sUid === userId;
        const isViewerNarrator = !!narratorId && sUid === narratorId;
        const allowed = isSecret ? isAuthor : isAuthor || isViewerNarrator;
        if (allowed) s.emit('roll:result', this.withCharacterAvatarUrl(roll));
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
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');
    if (
      !body?.characterId ||
      !Array.isArray(body.deltas) ||
      body.deltas.length === 0
    ) {
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

    // NPC / ANTAGONIST: no se emite el cambio a nadie. La hoja es interna
    // del narrador y los demás participantes no necesitan ver sus ediciones
    // en el chat. El narrador ya tiene el panel embebido para auditar.
    return { ok: true };
  }

  /**
   * Activación de un poder de disciplina por parte del jugador.
   *
   * Body: { characterId, powerId }
   *
   * Flujo:
   *   1. Valida pertenencia / nivel aprendido / sangre disponible.
   *   2. Descuenta sangre atómicamente si bloodCost > 0.
   *   3. Emite `chat:message` a la sala (mensaje del sistema con el nombre
   *      del personaje y la activación del poder).
   *   4. Si hubo gasto de sangre, emite `sheet:announce` con el delta de
   *      Reserva de sangre (la hoja embebida lo aplica en vivo).
   *
   * Devuelve metadata del poder para que el cliente decida si quiere
   * preparar el roller (si rollAttribute está definido). La tirada en sí
   * se dispara con `roll:vtm`, no se encadena desde aquí.
   */
  @SubscribeMessage('discipline:activate')
  async onActivateDiscipline(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { characterId: string; powerId: string },
  ) {
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');
    if (!body?.characterId || !body?.powerId) {
      throw new WsException('characterId y powerId requeridos');
    }

    // Validamos que el personaje esté asociado a esta crónica (no permitir
    // usar un personaje de otra mesa por accidente).
    const ctx = await this.tableService.getCharacterContext(
      chronicleId,
      body.characterId,
    );
    if (!ctx) throw new WsException('Personaje no asociado a esta crónica');

    const result = await this.tableService.activateDisciplinePower(
      userId,
      body.characterId,
      body.powerId,
    );

    const room = this.roomName(chronicleId);

    // Anuncio en el chat (mensaje del sistema).
    const chatLine =
      result.power.bloodCost > 0
        ? `${result.character.name} activa ${result.discipline.name} ${result.power.level} — ${result.power.name} (gasta ${result.power.bloodCost} de sangre).`
        : `${result.character.name} activa ${result.discipline.name} ${result.power.level} — ${result.power.name}.`;

    const chatMessage = {
      id: `disc-${Date.now()}-${client.id}`,
      userId,
      email: (client.data as AuthenticatedSocketData)?.email ?? '',
      speaker: {
        kind: 'system' as const,
        name: 'Sistema',
        characterId: null,
        avatar: null,
      },
      text: chatLine,
      at: new Date().toISOString(),
      recipient: { kind: 'all' as const, userId: null },
    };
    // Línea narrativa en el chat: SOLO si es PC. Las activaciones del
    // narrador con sus NPCs/Antagonistas no se transmiten — el descuento
    // de sangre se hizo en BD y el panel embebido del narrador refleja el
    // nuevo saldo, pero el chat queda limpio.
    if (ctx.kind === 'PC') {
      void this.chatService.persist({
        id: chatMessage.id,
        chronicleId,
        userId,
        characterId: null,
        speakerKind: 'system',
        speakerName: 'Sistema',
        speakerAvatar: null,
        text: chatLine,
        recipientKind: 'all',
        recipientUserId: null,
      });
      this.server.to(room).emit('chat:message', chatMessage);

      // Anuncio del delta de sangre, también solo para PCs.
      if (result.blood.spent > 0) {
        const announce = {
          id: `disc-blood-${Date.now()}-${client.id}`,
          characterId: ctx.id,
          characterName: ctx.name,
          kind: ctx.kind,
          authorId: userId,
          deltas: [
            {
              label: 'Reserva de sangre',
              before: String(result.blood.before),
              after: String(result.blood.after),
            },
          ],
          at: new Date().toISOString(),
        };
        this.server.to(room).emit('sheet:announce', announce);
      }
    }

    return {
      ok: true,
      power: result.power,
      discipline: result.discipline,
      blood: result.blood,
    };
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private async getNarratorIdInRoom(
    chronicleId: string,
  ): Promise<string | null> {
    const sockets = await this.server
      .in(this.roomName(chronicleId))
      .fetchSockets();
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
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
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
    const { userId, chronicleId } = (client.data ??
      {}) as AuthenticatedSocketData;
    if (!userId || !chronicleId) throw new WsException('Not in a table');

    // Solo el narrador puede empujar updates.
    const narratorId = await this.tableService.getNarratorId(chronicleId);
    if (narratorId !== userId) {
      throw new WsException('Only the narrator can update the board');
    }

    // Si la pizarra no está compartida, ignoramos el broadcast.
    const board = await this.boardService.getBoardForMember(
      chronicleId,
      userId,
    );
    if (!board.isShared) return { ok: true, broadcasted: false };

    const room = this.roomName(chronicleId);
    this.server
      .to(room)
      .except(client.id)
      .emit('board:updated', {
        chronicleId,
        elements: body.elements,
        appState: body.appState ?? null,
        at: new Date().toISOString(),
      });
    return { ok: true, broadcasted: true };
  }

  /** Notifica a la sala que un mensaje de chat fue borrado. */
  broadcastChatDeleted(chronicleId: string, messageId: string) {
    this.server
      .to(this.roomName(chronicleId))
      .emit('chat:deleted', { messageId });
  }

  /** Notifica a la sala que una tirada fue borrada. */
  broadcastRollDeleted(chronicleId: string, rollId: string) {
    this.server
      .to(this.roomName(chronicleId))
      .emit('roll:deleted', { rollId });
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

  /**
   * Emite el estado del reproductor de música a toda la sala.
   * Lo invoca MusicService después de cualquier cambio de estado.
   */
  broadcastMusicState(
    chronicleId: string,
    state: {
      chronicleId: string;
      status: 'idle' | 'playing' | 'paused';
      currentTrack: {
        videoId: string;
        title: string;
        url: string;
        duration: number | null;
        thumbnail: string | null;
        requestedBy: string;
      } | null;
      queue: Array<{
        videoId: string;
        title: string;
        url: string;
        duration: number | null;
        thumbnail: string | null;
        requestedBy: string;
      }>;
      startedAt: number | null;
      pausedAt: number | null;
    },
  ) {
    this.server.to(this.roomName(chronicleId)).emit('music:state', state);
  }

  private roomName(chronicleId: string) {
    return `chronicle:${chronicleId}`;
  }

  /**
   * Reemplaza el `avatar` (filename guardado en BD) del personaje embebido en
   * el roll por su URL pública relativa (`/images/characters/avatars/...`),
   * lista para consumirse por el front. Idempotente: si no hay character o
   * no hay avatar, devuelve el roll tal cual.
   *
   * Importante: clonamos en vez de mutar para no contaminar el cache del
   * service ni el dato que vuelve a Prisma.
   */
  private withCharacterAvatarUrl<
    T extends { character?: { avatar?: string | null } | null },
  >(roll: T): T {
    if (!roll?.character) return roll;
    return {
      ...roll,
      character: {
        ...roll.character,
        avatar: roll.character.avatar
          ? buildCharacterAvatarUrl(roll.character.avatar)
          : null,
      },
    };
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
    const sockets = await this.server
      .in(this.roomName(chronicleId))
      .fetchSockets();
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
    const sockets = await this.server
      .in(this.roomName(chronicleId))
      .fetchSockets();
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

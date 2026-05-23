import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { buildCharacterAvatarUrl } from '../common/utils/character.utils';
import { UploaderService } from '../uploader/uploader.service';
import { BoardService } from './board.service';
import { CombatService } from './combat.service';
import { DiceService } from './dice.service';
import {
  AddCombatParticipantDto,
  ReorderCombatDto,
  UpdateCombatParticipantDto,
} from './dto/combat.dto';
import { SaveBoardDto } from './dto/save-board.dto';
import { UploadBoardFileDto } from './dto/upload-board-file.dto';
import { TableGateway } from './table.gateway';
import { TableService } from './table.service';

@ApiTags('Table')
@Controller('chronicles')
export class TableController {
  constructor(
    private readonly diceService: DiceService,
    private readonly tableService: TableService,
    private readonly boardService: BoardService,
    private readonly combatService: CombatService,
    private readonly uploaderService: UploaderService,
    private readonly gateway: TableGateway,
  ) {}

  @Get(':id/rolls')
  @Auth()
  @ApiOperation({ summary: 'Historial de tiradas de una crónica' })
  async getRolls(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    if (!role) {
      throw new ForbiddenException('Not a member of this chronicle');
    }
    const rolls = await this.diceService.listByChronicle(
      chronicleId,
      userId,
      role === 'NARRATOR',
      limit ?? 50,
    );
    // Enriquecemos el avatar del personaje a URL pública (mismo formato que
    // el WS al emitir `roll:result`). Sin esto el front recibiría el
    // filename crudo de BD.
    return rolls.map((r) =>
      r.character
        ? {
            ...r,
            character: {
              ...r.character,
              avatar: r.character.avatar
                ? buildCharacterAvatarUrl(r.character.avatar)
                : null,
            },
          }
        : r,
    );
  }

  @Delete(':id/rolls')
  @Auth()
  @ApiOperation({
    summary: 'Vacía el historial de tiradas de la crónica (solo narrador).',
  })
  async clearRolls(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    if (role !== 'NARRATOR') {
      throw new ForbiddenException('Only the narrator can clear rolls');
    }
    const result = await this.diceService.clearForChronicle(chronicleId);
    this.gateway.broadcastRollsCleared(chronicleId, { userId });
    return { ok: true, ...result };
  }

  // ── Pizarra ──────────────────────────────────────────────

  @Get(':id/board')
  @Auth()
  @ApiOperation({
    summary:
      'Devuelve la pizarra de la crónica. Si no existe la crea vacía. Miembros only.',
  })
  async getBoard(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.boardService.getBoardForMember(chronicleId, userId);
  }

  @Put(':id/board')
  @Auth()
  @ApiOperation({
    summary: 'Guarda el snapshot de la pizarra. Solo narrador.',
  })
  async saveBoard(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: SaveBoardDto,
  ) {
    return this.boardService.saveBoardAsNarrator(
      chronicleId,
      userId,
      dto.elements,
      dto.appState ?? null,
    );
  }

  @Post(':id/board/files')
  @Auth()
  @ApiOperation({
    summary:
      'Sube un binario (imagen) usado por la pizarra. dataURL base64. Solo narrador.',
  })
  async uploadBoardFile(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: UploadBoardFileDto,
  ) {
    // El BoardService valida que el caller sea narrador antes de registrar.
    const uploaded = await this.uploaderService.uploadBoardImage(
      dto.dataURL,
      chronicleId,
    );
    const url = `/images/boards/${chronicleId}/${uploaded.filename}`;
    return this.boardService.addFileRef(
      chronicleId,
      userId,
      dto.fileId,
      url,
      uploaded.mimetype,
    );
  }

  // ── Combate / Turnos ────────────────────────────────────

  @Get(':id/combat')
  @Auth()
  @ApiOperation({
    summary:
      'Devuelve el tracker de turnos de la crónica. Filtra según rol: jugador ve solo PCs sin iniciativas; narrador ve todo.',
  })
  async getCombat(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    if (!role) {
      throw new ForbiddenException('Not a member of this chronicle');
    }
    return this.combatService.getStateForRole(chronicleId, role);
  }

  @Post(':id/combat/participants')
  @Auth()
  @ApiOperation({
    summary:
      'Agrega un participante al tracker. Solo narrador. Si no hay characterId, displayName es requerido (entrada libre).',
  })
  async addCombatParticipant(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: AddCombatParticipantDto,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.addParticipant(chronicleId, dto);
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Patch(':id/combat/participants/:pid')
  @Auth()
  @ApiOperation({
    summary:
      'Actualiza un participante (iniciativa o displayName). Solo narrador.',
  })
  async updateCombatParticipant(
    @Param('id') chronicleId: string,
    @Param('pid') participantId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateCombatParticipantDto,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.updateParticipant(
      chronicleId,
      participantId,
      dto,
    );
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Delete(':id/combat/participants/:pid')
  @Auth()
  @ApiOperation({
    summary: 'Quita un participante del tracker. Solo narrador.',
  })
  async removeCombatParticipant(
    @Param('id') chronicleId: string,
    @Param('pid') participantId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.removeParticipant(
      chronicleId,
      participantId,
    );
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Post(':id/combat/reorder')
  @Auth()
  @ApiOperation({
    summary:
      'Reordena los participantes (drag & drop). El cursor queda apuntando al mismo participante. Solo narrador.',
  })
  async reorderCombat(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: ReorderCombatDto,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.reorder(chronicleId, dto.orderedIds);
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Post(':id/combat/advance')
  @Auth()
  @ApiOperation({
    summary:
      'Avanza el cursor al siguiente turno. Cicla y suma asalto al pasar el último. Solo narrador.',
  })
  async advanceCombat(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.advance(chronicleId);
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Post(':id/combat/reset')
  @Auth()
  @ApiOperation({
    summary:
      'Reinicia el combate: cursor=0, round=1. Mantiene los participantes. Solo narrador.',
  })
  async resetCombat(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.reset(chronicleId);
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }

  @Delete(':id/combat')
  @Auth()
  @ApiOperation({
    summary:
      'Limpia el tracker: borra todos los participantes y reinicia cursor/round. Solo narrador.',
  })
  async clearCombat(
    @Param('id') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const role = await this.tableService.getMembership(userId, chronicleId);
    this.combatService.assertNarrator(role);
    const state = await this.combatService.clear(chronicleId);
    this.gateway.broadcastCombat(chronicleId, state);
    return state;
  }
}

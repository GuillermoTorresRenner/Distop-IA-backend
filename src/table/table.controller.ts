import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { BoardService } from './board.service';
import { DiceService } from './dice.service';
import { SaveBoardDto } from './dto/save-board.dto';
import { TableGateway } from './table.gateway';
import { TableService } from './table.service';

@ApiTags('Table')
@Controller('chronicles')
export class TableController {
  constructor(
    private readonly diceService: DiceService,
    private readonly tableService: TableService,
    private readonly boardService: BoardService,
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
    return this.diceService.listByChronicle(chronicleId, limit ?? 50);
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
}

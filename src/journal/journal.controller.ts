import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { PrismaService } from '../prisma/prisma.service';
import { UploaderService } from '../uploader/uploader.service';
import {
  CreateCharacterJournalEntryDto,
  CreateChronicleJournalEntryDto,
  ShareCharacterEntryDto,
  UpdateCharacterJournalEntryDto,
  UpdateChronicleJournalEntryDto,
} from './dto';
import { JournalService } from './journal.service';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

@ApiTags('Journal')
@Controller()
export class JournalController {
  constructor(
    private readonly journal: JournalService,
    private readonly uploader: UploaderService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('journal/me')
  @Auth()
  @ApiOperation({
    summary:
      'Feed of journal entries the current user can read (own character entries + chronicle entries of their chronicles).',
  })
  myFeed(@GetUser('id') userId: string) {
    return this.journal.listMyJournal(userId);
  }

  @Get('chronicles/:chronicleId/journal')
  @Auth()
  @ApiOperation({ summary: 'Chronicle journal entries (members only)' })
  listChronicle(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.journal.listChronicleEntries(chronicleId, userId);
  }

  @Post('chronicles/:chronicleId/journal')
  @Auth()
  @ApiOperation({ summary: 'Create a chronicle journal entry (narrator only)' })
  createChronicle(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateChronicleJournalEntryDto,
  ) {
    return this.journal.createChronicleEntry(chronicleId, userId, dto);
  }

  @Patch('chronicles/:chronicleId/journal/:entryId')
  @Auth()
  @ApiOperation({ summary: 'Update a chronicle journal entry (narrator only)' })
  updateChronicle(
    @Param('chronicleId') chronicleId: string,
    @Param('entryId') entryId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateChronicleJournalEntryDto,
  ) {
    return this.journal.updateChronicleEntry(chronicleId, entryId, userId, dto);
  }

  @Delete('chronicles/:chronicleId/journal/:entryId')
  @Auth()
  @ApiOperation({ summary: 'Delete a chronicle journal entry (narrator only)' })
  removeChronicle(
    @Param('chronicleId') chronicleId: string,
    @Param('entryId') entryId: string,
    @GetUser('id') userId: string,
  ) {
    return this.journal.removeChronicleEntry(chronicleId, entryId, userId);
  }

  @Get('chronicles/:chronicleId/character-journal')
  @Auth()
  @ApiOperation({ summary: 'My character entries for this chronicle' })
  listCharacter(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.journal.listCharacterEntries(chronicleId, userId);
  }

  @Post('chronicles/:chronicleId/character-journal')
  @Auth()
  @ApiOperation({
    summary: 'Create a character journal entry (only visible to the author)',
  })
  createCharacter(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateCharacterJournalEntryDto,
  ) {
    return this.journal.createCharacterEntry(chronicleId, userId, dto);
  }

  @Patch('chronicles/:chronicleId/character-journal/:entryId')
  @Auth()
  @ApiOperation({ summary: 'Update a character journal entry (author only)' })
  updateCharacter(
    @Param('chronicleId') chronicleId: string,
    @Param('entryId') entryId: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateCharacterJournalEntryDto,
  ) {
    return this.journal.updateCharacterEntry(chronicleId, entryId, userId, dto);
  }

  @Patch('chronicles/:chronicleId/character-journal/:entryId/share')
  @Auth()
  @ApiOperation({
    summary:
      'Activa o desactiva la visibilidad pública de una nota de personaje. ' +
      'Cuando isShared=true aparece en la bitácora de la crónica para todos los miembros.',
  })
  shareCharacter(
    @Param('chronicleId') chronicleId: string,
    @Param('entryId') entryId: string,
    @GetUser('id') userId: string,
    @Body() dto: ShareCharacterEntryDto,
  ) {
    return this.journal.shareCharacterEntry(
      chronicleId,
      entryId,
      userId,
      dto.isShared,
    );
  }

  @Delete('chronicles/:chronicleId/character-journal/:entryId')
  @Auth()
  @ApiOperation({ summary: 'Delete a character journal entry (author only)' })
  removeCharacter(
    @Param('chronicleId') chronicleId: string,
    @Param('entryId') entryId: string,
    @GetUser('id') userId: string,
  ) {
    return this.journal.removeCharacterEntry(chronicleId, entryId, userId);
  }

  // ── Upload de imágenes para markdown en notas ─────────────
  @Post('chronicles/:chronicleId/journal/files')
  @Auth()
  @ApiOperation({
    summary:
      'Sube una imagen para insertar en una nota de bitácora. Devuelve la URL relativa.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadJournalFile(
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Falta el archivo (campo "file").');
    }
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo no permitido: ${file.mimetype}. Solo JPG, PNG, WEBP, GIF.`,
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException('Imagen demasiado grande (máx 5MB).');
    }
    // Validar membresía a la crónica.
    const member = await this.prisma.chronicleMember.findUnique({
      where: { chronicleId_userId: { chronicleId, userId } },
      select: { id: true },
    });
    if (!member) {
      throw new ForbiddenException('No eres miembro de esta crónica.');
    }
    const uploaded = await this.uploader.uploadJournalImage(file, chronicleId);
    return {
      url: `/images/journal/${chronicleId}/${uploaded.filename}`,
      mimeType: uploaded.mimetype,
    };
  }
}

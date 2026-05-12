import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import {
  CreateCharacterJournalEntryDto,
  CreateChronicleJournalEntryDto,
  UpdateCharacterJournalEntryDto,
  UpdateChronicleJournalEntryDto,
} from './dto';
import { JournalService } from './journal.service';

@ApiTags('Journal')
@Controller()
export class JournalController {
  constructor(private readonly journal: JournalService) {}

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
}

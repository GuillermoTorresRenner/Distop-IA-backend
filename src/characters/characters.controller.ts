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
import { CharactersService } from './characters.service';
import { CreateCharacterDto, UpdateCharacterDto, AssociateChronicleDto } from './dto';

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly characters: CharactersService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List characters of the current user' })
  list(@GetUser('id') userId: string) {
    return this.characters.findAllForUser(userId);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new character for the current user' })
  create(@GetUser('id') userId: string, @Body() dto: CreateCharacterDto) {
    return this.characters.create(userId, dto);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get one of my characters (full sheet)' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.characters.findOneOwned(id, userId);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a character (owner only)' })
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    return this.characters.update(id, userId, dto);
  }

  @Post(':id/clone')
  @Auth()
  @ApiOperation({
    summary:
      'Clone one of my characters (full sheet copy, no chronicle links; new name "Copia de ...")',
  })
  clone(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.characters.clone(id, userId);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a character (owner only)' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.characters.remove(id, userId);
  }

  @Post(':id/chronicles')
  @Auth()
  @ApiOperation({ summary: 'Associate this character with a chronicle (must be a member)' })
  associate(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: AssociateChronicleDto,
  ) {
    return this.characters.associateChronicle(id, userId, dto.chronicleId);
  }

  @Delete(':id/chronicles/:chronicleId')
  @Auth()
  @ApiOperation({ summary: 'Dissociate this character from a chronicle' })
  dissociate(
    @Param('id') id: string,
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    return this.characters.dissociateChronicle(id, userId, chronicleId);
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import {
  enrichCharacterWithAvatarUrl,
  enrichCharactersWithAvatarUrls,
} from '../common/utils/character.utils';
import { UploaderService } from '../uploader/uploader.service';
import { CharactersService } from './characters.service';
import {
  AssociateChronicleDto,
  CreateCharacterDto,
  UpdateCharacterDto,
} from './dto';

const ALLOWED_AVATAR_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@ApiTags('Characters')
@Controller('characters')
export class CharactersController {
  constructor(
    private readonly characters: CharactersService,
    private readonly uploader: UploaderService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List characters of the current user' })
  async list(@GetUser('id') userId: string) {
    const data = await this.characters.findAllForUser(userId);
    return enrichCharactersWithAvatarUrls(data);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new character for the current user' })
  async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateCharacterDto,
  ) {
    const data = await this.characters.create(userId, dto);
    return enrichCharacterWithAvatarUrl(data);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get one of my characters (full sheet)' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    const data = await this.characters.findOneOwned(id, userId);
    return enrichCharacterWithAvatarUrl(data);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a character (owner only)' })
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateCharacterDto,
  ) {
    const data = await this.characters.update(id, userId, dto);
    return data ? enrichCharacterWithAvatarUrl(data) : data;
  }

  @Post(':id/clone')
  @Auth()
  @ApiOperation({
    summary:
      'Clone one of my characters (full sheet copy, no chronicle links; new name "Copia de ...")',
  })
  async clone(@Param('id') id: string, @GetUser('id') userId: string) {
    const data = await this.characters.clone(id, userId);
    return enrichCharacterWithAvatarUrl(data);
  }

  @Post(':id/avatar')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'Upload character portrait. Owner OR narrator of a linked chronicle.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image (jpg/png/webp/gif, max 5 MB)',
        },
      },
    },
  })
  async uploadAvatar(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_AVATAR_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed',
      );
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Validar permisos antes de tocar disco.
    await this.characters.assertEditable(id, userId);

    const upload = await this.uploader.uploadCharacterAvatar(file, id);
    const { character, previousFilename } = await this.characters.setAvatar(
      id,
      userId,
      upload.filename,
    );

    // Limpia el portrait anterior si lo había (no bloqueante).
    if (previousFilename && previousFilename !== upload.filename) {
      this.uploader.deleteCharacterAvatar(previousFilename).catch(() => {
        // tolerate
      });
    }

    return enrichCharacterWithAvatarUrl(character!);
  }

  @Delete(':id/avatar')
  @Auth()
  @ApiOperation({
    summary:
      'Remove character portrait (also deletes the stored file). Owner or narrator of linked chronicle.',
  })
  async removeAvatar(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    const { character, previousFilename } = await this.characters.clearAvatar(
      id,
      userId,
    );
    if (previousFilename) {
      this.uploader.deleteCharacterAvatar(previousFilename).catch(() => {
        // tolerate
      });
    }
    return enrichCharacterWithAvatarUrl(character!);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete a character (owner only)' })
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    // Recoge el filename del avatar (si lo hay) ANTES de borrar el row,
    // para limpiar el archivo en disco después.
    const current = await this.characters.findOneOwned(id, userId);
    const result = await this.characters.remove(id, userId);
    if (current.avatar) {
      this.uploader.deleteCharacterAvatar(current.avatar).catch(() => {
        // tolerate
      });
    }
    return result;
  }

  @Post(':id/chronicles')
  @Auth()
  @ApiOperation({
    summary: 'Associate this character with a chronicle (must be a member)',
  })
  async associate(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: AssociateChronicleDto,
  ) {
    const data = await this.characters.associateChronicle(
      id,
      userId,
      dto.chronicleId,
    );
    return enrichCharacterWithAvatarUrl(data);
  }

  @Delete(':id/chronicles/:chronicleId')
  @Auth()
  @ApiOperation({ summary: 'Dissociate this character from a chronicle' })
  async dissociate(
    @Param('id') id: string,
    @Param('chronicleId') chronicleId: string,
    @GetUser('id') userId: string,
  ) {
    const data = await this.characters.dissociateChronicle(
      id,
      userId,
      chronicleId,
    );
    return enrichCharacterWithAvatarUrl(data);
  }
}

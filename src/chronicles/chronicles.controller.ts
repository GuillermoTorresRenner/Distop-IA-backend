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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CharactersService } from '../characters/characters.service';
import { Auth, GetUser } from '../common/decorators';
import {
  enrichChronicleWithImageUrl,
  enrichChroniclesWithImageUrls,
} from '../common/utils/chronicle.utils';
import { UploaderService } from '../uploader/uploader.service';
import { ChroniclesService } from './chronicles.service';
import { InvitationsService } from './invitations.service';
import {
  CreateChronicleCharacterDto,
  CreateChronicleDto,
  InviteUserDto,
  UpdateChronicleDto,
} from './dto';

const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

@ApiTags('Chronicles')
@Controller('chronicles')
export class ChroniclesController {
  constructor(
    private readonly chronicles: ChroniclesService,
    private readonly invitations: InvitationsService,
    private readonly uploader: UploaderService,
    private readonly characters: CharactersService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create a new chronicle (current user becomes narrator)' })
  @ApiResponse({ status: 201, description: 'Chronicle created' })
  async create(
    @GetUser('id') userId: string,
    @Body() dto: CreateChronicleDto,
  ) {
    const chronicle = await this.chronicles.create(userId, dto);
    return enrichChronicleWithImageUrl(chronicle);
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List chronicles where the current user is a member' })
  async findMine(@GetUser('id') userId: string) {
    const chronicles = await this.chronicles.findAllForUser(userId);
    return enrichChroniclesWithImageUrls(chronicles);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get chronicle detail (members + pending invitations)' })
  @ApiResponse({ status: 403, description: 'Not a member' })
  @ApiResponse({ status: 404, description: 'Chronicle not found' })
  async findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    const chronicle = await this.chronicles.findOneAsMember(id, userId);
    return enrichChronicleWithImageUrl(chronicle);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update chronicle (narrator only)' })
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateChronicleDto,
  ) {
    const chronicle = await this.chronicles.update(id, userId, dto);
    return enrichChronicleWithImageUrl(chronicle);
  }

  @Post(':id/image')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload chronicle cover image (narrator only, converted to WebP)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, webp, gif) — max 8MB',
        },
      },
    },
  })
  async uploadImage(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      );
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('File size exceeds 8MB limit');
    }

    await this.chronicles.assertNarrator(id, userId);
    const upload = await this.uploader.uploadChronicleImage(file, id);
    const chronicle = await this.chronicles.setImage(id, userId, upload.filename);
    return enrichChronicleWithImageUrl(chronicle);
  }

  @Delete(':id/image')
  @Auth()
  @ApiOperation({ summary: 'Remove chronicle cover image (narrator only)' })
  async removeImage(@Param('id') id: string, @GetUser('id') userId: string) {
    const chronicle = await this.chronicles.clearImage(id, userId);
    return enrichChronicleWithImageUrl(chronicle);
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Delete chronicle (narrator only)' })
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.chronicles.remove(id, userId);
  }

  @Post(':id/invitations')
  @Auth()
  @ApiOperation({
    summary: 'Invite a user by email (sends email; works for registered or new users)',
  })
  invite(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.invitations.invite(id, userId, dto.email);
  }

  @Delete(':id/invitations/:invitationId')
  @Auth()
  @ApiOperation({ summary: 'Cancel a pending invitation (narrator only)' })
  cancelInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.invitations.cancel(id, userId, invitationId);
  }

  @Get(':id/characters')
  @Auth()
  @ApiOperation({
    summary: 'List characters associated with this chronicle (members only)',
  })
  listCharacters(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.characters.findAllForChronicle(id, userId);
  }

  @Get(':id/associable-characters')
  @Auth()
  @ApiOperation({
    summary:
      'List characters that can still be associated to this chronicle. Narrator sees every member\'s characters; players see only their own.',
  })
  listAssociableCharacters(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ) {
    return this.characters.findAssociableForChronicle(id, userId);
  }

  @Post(':id/characters')
  @Auth()
  @ApiOperation({
    summary:
      'Create a character inside this chronicle. Narrator may create for any member via targetUserId; otherwise the caller owns the character.',
  })
  createCharacter(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: CreateChronicleCharacterDto,
  ) {
    const { targetUserId, ...characterDto } = dto;
    return this.characters.createForChronicle(
      userId,
      id,
      characterDto,
      targetUserId,
    );
  }

  @Post(':id/characters/:characterId')
  @Auth()
  @ApiOperation({
    summary:
      'Associate an existing character with this chronicle. Allowed for the narrator or the character owner; the owner must be a chronicle member.',
  })
  linkCharacter(
    @Param('id') id: string,
    @Param('characterId') characterId: string,
    @GetUser('id') userId: string,
  ) {
    return this.characters.linkExistingToChronicle(id, characterId, userId);
  }

  @Delete(':id/characters/:characterId')
  @Auth()
  @ApiOperation({
    summary:
      'Remove a character from this chronicle. Allowed for the narrator or the character owner.',
  })
  unlinkCharacter(
    @Param('id') id: string,
    @Param('characterId') characterId: string,
    @GetUser('id') userId: string,
  ) {
    return this.characters.unlinkFromChronicle(id, characterId, userId);
  }

  @Delete(':id/members/:userId')
  @Auth()
  @ApiOperation({ summary: 'Remove a member from the chronicle (narrator only)' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') memberUserId: string,
    @GetUser('id') requesterId: string,
  ) {
    return this.chronicles.removeMember(id, requesterId, memberUserId);
  }
}

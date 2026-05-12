import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { Auth } from '../common/decorators/index';
import { UploaderService } from '../uploader/uploader.service';
import { enrichUserWithAvatarUrl } from '../common/utils/avatar.utils';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploaderService: UploaderService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'Get all users with pagination and filters',
  })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (starting from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'email',
    type: String,
    required: false,
    description: 'Filter by email (case-insensitive partial match)',
    example: 'john@example.com',
  })
  @ApiQuery({
    name: 'isActive',
    type: Boolean,
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query() filters: FilterUsersDto,
  ) {
    const result = await this.usersService.findAll(page, pageSize, filters);
    return {
      ...result,
      data: result.data.map((user) => enrichUserWithAvatarUrl(user)),
    };
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return enrichUserWithAvatarUrl(user);
  }

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/avatar')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (jpg, png, etc.)',
        },
      },
    },
  })
  async uploadAvatar(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const uploadResult = await this.uploaderService.uploadUserAvatar(
      file,
      userId,
    );

    const updatedUser = await this.usersService.updateAvatar(
      userId,
      uploadResult.filename,
    );

    return {
      ...updatedUser,
      avatar: enrichUserWithAvatarUrl(updatedUser).avatar,
    };
  }

  @Delete(':id/avatar')
  @Auth()
  @ApiOperation({ summary: 'Remove user avatar (also deletes the stored file)' })
  @ApiResponse({ status: 200, description: 'Avatar removed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async removeAvatar(@Param('id') userId: string) {
    const updatedUser = await this.usersService.clearAvatar(userId);
    return {
      ...updatedUser,
      avatar: enrichUserWithAvatarUrl(updatedUser).avatar,
    };
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

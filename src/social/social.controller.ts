import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { CreateFriendshipDto, SearchUsersDto } from './dto';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @Get('users')
  @Auth()
  @ApiOperation({
    summary:
      'Search users (excludes current user). Returns relation flag for each.',
  })
  searchUsers(@GetUser('id') userId: string, @Query() dto: SearchUsersDto) {
    return this.social.searchUsers(userId, dto);
  }

  @Get('friends')
  @Auth()
  @ApiOperation({ summary: 'List accepted friendships for the current user' })
  listFriends(@GetUser('id') userId: string) {
    return this.social.listFriends(userId);
  }

  @Get('friend-requests/incoming')
  @Auth()
  @ApiOperation({
    summary: 'Pending friend requests where the user is the addressee',
  })
  incoming(@GetUser('id') userId: string) {
    return this.social.listIncoming(userId);
  }

  @Get('friend-requests/outgoing')
  @Auth()
  @ApiOperation({ summary: 'Pending friend requests the user sent' })
  outgoing(@GetUser('id') userId: string) {
    return this.social.listOutgoing(userId);
  }

  @Post('friend-requests')
  @Auth()
  @ApiOperation({
    summary:
      'Send a friend request. If the addressee already sent one, it auto-accepts.',
  })
  request(@GetUser('id') userId: string, @Body() dto: CreateFriendshipDto) {
    return this.social.request(userId, dto.addresseeId);
  }

  @Patch('friend-requests/:id/accept')
  @Auth()
  @ApiOperation({ summary: 'Accept a pending friend request (addressee only)' })
  accept(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.social.accept(userId, id);
  }

  @Patch('friend-requests/:id/decline')
  @Auth()
  @ApiOperation({
    summary: 'Decline a pending friend request (addressee only)',
  })
  decline(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.social.decline(userId, id);
  }

  @Delete('friendships/:id')
  @Auth()
  @ApiOperation({
    summary: 'Remove a friendship (either party can delete it at any state)',
  })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.social.remove(userId, id);
  }
}

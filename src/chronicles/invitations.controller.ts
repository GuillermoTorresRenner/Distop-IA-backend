import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { InvitationsService } from './invitations.service';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get('token/:token')
  @ApiOperation({
    summary:
      'Public lookup of an invitation by token (preview for accept/register pages)',
  })
  preview(@Param('token') token: string) {
    return this.invitations.findByToken(token);
  }

  @Get()
  @Auth()
  @ApiOperation({
    summary: 'List pending invitations addressed to the current user',
  })
  mine(@GetUser('id') userId: string, @GetUser('email') userEmail: string) {
    return this.invitations.findForUser(userId, userEmail);
  }

  @Post(':token/accept')
  @Auth()
  @ApiOperation({
    summary: 'Accept an invitation (logged-in user, email must match)',
  })
  accept(
    @Param('token') token: string,
    @GetUser('id') userId: string,
    @GetUser('email') userEmail: string,
  ) {
    return this.invitations.accept(token, userId, userEmail);
  }
}

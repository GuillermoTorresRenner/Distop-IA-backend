import { Module } from '@nestjs/common';
import { CharactersModule } from '../characters/characters.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { UploaderModule } from '../uploader/uploader.module';
import { ChroniclesController } from './chronicles.controller';
import { InvitationsController } from './invitations.controller';
import { ChroniclesService } from './chronicles.service';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [PrismaModule, MailModule, UploaderModule, CharactersModule],
  controllers: [ChroniclesController, InvitationsController],
  providers: [ChroniclesService, InvitationsService],
  exports: [ChroniclesService, InvitationsService],
})
export class ChroniclesModule {}

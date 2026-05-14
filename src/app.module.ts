import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UploaderModule } from './uploader/uploader.module';
import { MailModule } from './mail/mail.module';
import { ChroniclesModule } from './chronicles/chronicles.module';
import { SocialModule } from './social/social.module';
import { JournalModule } from './journal/journal.module';
import { CatalogModule } from './catalog/catalog.module';
import { CharactersModule } from './characters/characters.module';
import { TableModule } from './table/table.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    UploaderModule,
    MailModule,
    ChroniclesModule,
    SocialModule,
    JournalModule,
    CatalogModule,
    CharactersModule,
    TableModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

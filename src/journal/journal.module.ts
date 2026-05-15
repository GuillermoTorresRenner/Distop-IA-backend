import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploaderModule } from '../uploader/uploader.module';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  imports: [PrismaModule, UploaderModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}

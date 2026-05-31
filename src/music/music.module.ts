import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TableModule } from '../table/table.module';

@Module({
  imports: [PrismaModule, TableModule],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}

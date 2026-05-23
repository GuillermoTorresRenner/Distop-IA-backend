import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UploaderModule } from '../uploader/uploader.module';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [PrismaModule, UploaderModule],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}

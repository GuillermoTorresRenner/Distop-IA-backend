import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../config/envs';
import { UploaderModule } from '../uploader/uploader.module';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { CombatService } from './combat.service';
import { TableGateway } from './table.gateway';
import { TableService } from './table.service';
import { DiceService } from './dice.service';
import { TableController } from './table.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: envs.jwtSecret,
    }),
    UploaderModule,
  ],
  controllers: [TableController],
  providers: [
    TableGateway,
    TableService,
    DiceService,
    ChatService,
    BoardService,
    CombatService,
  ],
})
export class TableModule {}

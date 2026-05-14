import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../config/envs';
import { TableGateway } from './table.gateway';
import { TableService } from './table.service';
import { DiceService } from './dice.service';
import { TableController } from './table.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: envs.jwtSecret,
    }),
  ],
  controllers: [TableController],
  providers: [TableGateway, TableService, DiceService],
})
export class TableModule {}

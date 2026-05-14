import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../config/envs';
import { TableGateway } from './table.gateway';
import { TableService } from './table.service';

@Module({
  imports: [
    JwtModule.register({
      secret: envs.jwtSecret,
    }),
  ],
  providers: [TableGateway, TableService],
})
export class TableModule {}

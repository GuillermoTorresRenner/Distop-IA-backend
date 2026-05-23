import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminOnly } from './decorators/admin-only.decorator';

@ApiTags('admin')
@Controller('admin')
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** KPIs globales: usuarios, crónicas, personajes, invitaciones, mensajes, tiradas. */
  @Get('stats')
  getOverview() {
    return this.adminService.getOverview();
  }

  /** Serie diaria de registros de usuarios (default últimos 30 días, máx 90). */
  @Get('stats/registrations')
  getRegistrations(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const clamped = Math.min(Math.max(days, 7), 90);
    return this.adminService.getRegistrationsSeries(clamped);
  }

  /** Serie diaria de tiradas de dados (default 30 días, máx 90). */
  @Get('stats/dice-rolls')
  getDiceRolls(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
  ) {
    const clamped = Math.min(Math.max(days, 7), 90);
    return this.adminService.getDiceRollsSeries(clamped);
  }

  /** Usuarios actualmente conectados (snapshot in-memory). */
  @Get('stats/online')
  getOnline() {
    return this.adminService.getOnlineSnapshot();
  }
}

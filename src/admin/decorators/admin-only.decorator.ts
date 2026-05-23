import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

/** Exige sesión válida (JWT cookie) Y que el usuario sea admin. */
export function AdminOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, AdminGuard), ApiBearerAuth());
}

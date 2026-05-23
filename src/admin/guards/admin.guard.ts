import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

interface RequestUser {
  id?: string;
  sub?: string;
  isAdmin?: boolean;
}

/**
 * Permite el paso solo a usuarios con `isAdmin === true`.
 *
 * Debe usarse **después** de `JwtAuthGuard` (encadenado por `@Auth()`
 * en el decorator combinado `@AdminOnly()`), porque depende de `req.user`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as RequestUser | undefined;
    if (!user || user.isAdmin !== true) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtUserPayload } from './jwt-user-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user');
    }

    if (user.isAdmin === true) {
      return true;
    }

    if (typeof user.role === 'string' && user.role.toLowerCase() === 'admin') {
      return true;
    }

    if (Array.isArray(user.roles)) {
      const normalized = user.roles.map((role) => role.toLowerCase());
      if (normalized.includes('admin')) {
        return true;
      }
    }

    throw new ForbiddenException('Admin access required');
  }
}

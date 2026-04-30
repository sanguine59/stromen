import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { JwtUserPayload } from './jwt-user-payload.interface';

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const secret = this.configService.getOrThrow<string>('auth.jwtSecret');

    try {
      const payload = await this.jwtService.verifyAsync<JwtUserPayload>(token, {
        secret,
      });

      if (!payload?.userId || typeof payload.userId !== 'string') {
        throw new UnauthorizedException('JWT payload must include userId claim');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;

    if (!header) {
      return null;
    }

    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}

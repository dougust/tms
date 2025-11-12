import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PublicGuard } from './public.guard';
import { JwtUser } from '../types';

@Injectable()
export class AuthGuard extends PublicGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, reflector: Reflector) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.isPublic(context)) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtUser }>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwt.verifyAsync<JwtUser>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PublicGuard } from './public.guard';
import { JwtUser } from '../types';

// TODO: Tenant guard should check if the tenant is valid based on headers and user from request context
@Injectable()
export class TenantGuard extends PublicGuard implements CanActivate {
  constructor(reflector: Reflector) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (await super.isPublic(context)) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { tenantId?: string; user?: JwtUser }>();

    const tenantId = request.tenantId;
    console.log(request.user, tenantId, 'request.user, tenantId');

    if (!tenantId) {
      throw new BadRequestException('Missing tenant identifier');
    }

    return true;
  }
}

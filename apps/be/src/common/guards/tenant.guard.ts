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

    const { tenantId, user } = request;

    if (!tenantId || !user) {
      throw new BadRequestException('Missing tenant identifier');
    }

    const userHasAccessToTenant = user.tenants.some(
      (t) => t.tenantId === tenantId
    );

    if (!userHasAccessToTenant) {
      throw new BadRequestException('No access to tenant');
    }

    return true;
  }
}

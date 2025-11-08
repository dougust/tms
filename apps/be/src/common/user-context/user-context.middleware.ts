import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserContextService } from './user-context.service';
import { Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { tenant, tenantMemberships, users as usersTable } from '@dougust/database';
import { and, eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(
    private readonly context: UserContextService,
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    private readonly jwt: JwtService
  ) {}

  private resolveTenantId(req: Request): string | undefined {
    const mode = (process.env.TENANT_DOMAIN_MODE || 'header').toLowerCase();
    if (mode === 'domain') {
      const host = (req.headers['x-forwarded-host'] || req.headers['host']) as
        | string
        | undefined;
      if (!host) return undefined;
      // Expect subdomain.ignored.tld - not implemented without a tenant slug/domain column
      // For now, domain mode unsupported: return undefined -> will trigger 400
      return undefined;
    }
    const headerName = process.env.TENANT_HEADER_NAME || 'X-Tenant-Id';
    const value = (req.get ? req.get(headerName) : req.headers[headerName.toLowerCase()]) as
      | string
      | undefined;
    return value?.trim() || process.env.TENANT_ID || undefined;
  }

  private isPublicPath(req: Request): boolean {
    const path = req.path || '';
    return path.startsWith('/auth') || path.startsWith('/health');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.resolveTenantId(req);

    // Validate tenant for all but public paths; for public paths we don't require it
    if (!tenantId && !this.isPublicPath(req)) {
      throw new BadRequestException('Missing tenant identifier');
    }

    if (tenantId) {
      const [t] = await this.db
        .select()
        .from(tenant)
        .where(eq(tenant.id, tenantId))
        .limit(1);
      if (!t) throw new NotFoundException('Tenant not found');
      if (t.isActive === false) throw new NotFoundException('Tenant inactive');
      (req as any).tenantId = tenantId;
    }

    // Tenant-scoped paths must be authenticated and authorized
    if (!this.isPublicPath(req)) {
      const auth = (req.get ? req.get('authorization') : req.headers['authorization']) as
        | string
        | undefined;
      if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
        throw new UnauthorizedException('Missing access token');
      }
      const token = auth.slice(7).trim();
      let payload: any;
      try {
        payload = await this.jwt.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'dev-secret',
        });
      } catch {
        throw new UnauthorizedException('Invalid access token');
      }

      const userId = payload?.sub as string | undefined;
      if (!userId) throw new UnauthorizedException('Invalid access token');

      const [user] = await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId))
        .limit(1);
      if (!user || user.isActive === false)
        throw new UnauthorizedException('User inactive');

      if (!tenantId) {
        // Should not happen here as we checked earlier, but guard anyway
        throw new BadRequestException('Missing tenant identifier');
      }

      const [membership] = await this.db
        .select()
        .from(tenantMemberships)
        .where(
          and(
            eq(tenantMemberships.tenantId, tenantId),
            eq(tenantMemberships.userId, userId)
          )
        )
        .limit(1);
      if (!membership)
        throw new ForbiddenException('No membership for this tenant');

      // Attach user info and role to request for downstream usage
      (req as any).user = {
        id: user.id,
        email: user.email,
        currentRole: membership.role,
      };
    }

    this.context.run({ businessId: tenantId }, next);
  }
}

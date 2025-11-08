import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Inject } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { tenant, tenantMemberships } from '@dougust/database';
import { and, eq } from 'drizzle-orm';

function isPublicPath(req: Request): boolean {
  const path = (req.path || req.url || '').toLowerCase();
  return path.startsWith('/auth') || path.startsWith('/health');
}

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { tenantId?: string; user?: any }>();

    if (isPublicPath(req)) return true;

    const tenantId = (req as any).tenantId as string | undefined;
    if (!tenantId) {
      throw new BadRequestException('Missing tenant identifier');
    }

    const [t] = await this.db
      .select()
      .from(tenant)
      .where(eq(tenant.id, tenantId))
      .limit(1);
    if (!t) throw new NotFoundException('Tenant not found');
    if (t.isActive === false) throw new NotFoundException('Tenant inactive');

    const userId = (req.user?.id as string | undefined) || undefined;
    if (!userId) {
      // JwtAccessGuard should have set req.user for protected routes
      throw new ForbiddenException('Unauthorized');
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

    if (!membership) {
      throw new ForbiddenException('No membership for this tenant');
    }

    // Attach role
    (req as any).user = { ...(req as any).user, currentRole: membership.role };

    return true;
  }
}

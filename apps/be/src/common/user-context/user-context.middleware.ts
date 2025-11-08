import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserContextService } from './user-context.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private readonly context: UserContextService) {}

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
    const value = (
      req.get ? req.get(headerName) : req.headers[headerName.toLowerCase()]
    ) as string | undefined;
    return value?.trim() || process.env.TENANT_ID || undefined;
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.resolveTenantId(req);

    if (tenantId) {
      req['tenantId'] = tenantId;
    }

    this.context.run({ businessId: tenantId }, next);
  }
}

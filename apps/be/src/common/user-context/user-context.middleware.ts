import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserContextService } from './user-context.service';

@Injectable()
export class UserContextMiddleware implements NestMiddleware {
  constructor(private readonly context: UserContextService) {}

  private resolveTenantId(req: Request): string | undefined {
    const headerName = process.env.TENANT_HEADER_NAME || 'X-Tenant-Id';
    const value = (
      req.get ? req.get(headerName) : req.headers[headerName.toLowerCase()]
    ) as string | undefined;
    return value?.trim() || process.env.TENANT_ID || undefined;
  }

  async use(request: Request, res: Response, next: NextFunction) {
    const tenantId = this.resolveTenantId(request);

    if (tenantId) {
      request['tenantId'] = tenantId;
    }

    this.context.run({ businessId: tenantId }, next);
  }
}

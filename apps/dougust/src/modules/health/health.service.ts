import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '@dougust/database';
import { UserContextService } from '../../common/user-context/user-context.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>,
    @Inject() private readonly userContext: UserContextService
  ) {}

  async getCurrentlyRunningBusinessId(): Promise<string | undefined> {
    return this.userContext.businessId;
  }

  async checkDatabase(): Promise<{
    status: 'up' | 'down';
    latencyMs?: number;
    error?: string;
  }> {
    const started = Date.now();
    try {
      await this.db.execute(sql`select 1`);
      const latencyMs = Date.now() - started;
      return { status: 'up', latencyMs };
    } catch (err: any) {
      return { status: 'down', error: err?.message ?? 'unknown error' };
    }
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { authSessions as authSessionsTable } from '@dougust/database';
import { and, eq } from 'drizzle-orm';
import { randomBytes, createHmac } from 'crypto';

type SessionMeta = { ipAddress?: string; userAgent?: string };

function parseDurationToMs(input: string): number {
  // supports number (seconds) or strings like 15m, 7d, 1h
  if (!input) return 0;
  const num = Number(input);
  if (!Number.isNaN(num)) return num * 1000; // assume seconds
  const match = /^([0-9]+)\s*([smhd])$/.exec(input.trim());
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * multipliers[unit];
}

@Injectable()
export class SessionsService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  private get refreshSecret() {
    return (
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev-secret'
    );
  }

  private get refreshTtlMs() {
    const raw = process.env.JWT_REFRESH_TOKEN_TTL || '30d';
    const ms = parseDurationToMs(raw);
    return ms > 0 ? ms : 30 * 24 * 60 * 60 * 1000; // 30d default
  }

  generateRefreshToken(): string {
    try {
      // Prefer url-safe string
      return randomBytes(48).toString('base64url');
    } catch {
      return randomBytes(48).toString('hex');
    }
  }

  hashRefreshToken(token: string): string {
    return createHmac('sha256', this.refreshSecret).update(token).digest('hex');
  }

  async create(userId: string, token: string, meta?: SessionMeta) {
    const tokenHash = this.hashRefreshToken(token);
    const expiresAt = new Date(Date.now() + this.refreshTtlMs);
    const [row] = await this.db
      .insert(authSessionsTable)
      .values({
        userId,
        tokenHash,
        expiresAt,
        ipAddress: meta?.ipAddress ?? null,
        userAgent: meta?.userAgent ?? null,
      })
      .returning();
    return row;
  }

  async deleteByToken(token: string) {
    const tokenHash = this.hashRefreshToken(token);
    await this.db
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.tokenHash, tokenHash));
  }

  async findValidByToken(token: string) {
    const tokenHash = this.hashRefreshToken(token);
    const rows = await this.db
      .select()
      .from(authSessionsTable)
      .where(eq(authSessionsTable.tokenHash, tokenHash))
      .limit(1);
    const session = rows[0];
    if (!session) return null;
    if (
      !session.expiresAt ||
      new Date(session.expiresAt).getTime() <= Date.now()
    )
      return null;
    return session;
  }

  async rotate(
    sessionId: string,
    userId: string,
    oldToken: string,
    meta?: SessionMeta
  ) {
    // delete old session and create a new one
    const newToken = this.generateRefreshToken();
    const tokenHash = this.hashRefreshToken(oldToken);
    await this.db
      .delete(authSessionsTable)
      .where(
        and(
          eq(authSessionsTable.id, sessionId),
          eq(authSessionsTable.tokenHash, tokenHash)
        )
      );

    const newSession = await this.create(userId, newToken, meta);
    return { newToken, newSession };
  }

  async revokeAllForUser(userId: string) {
    await this.db
      .delete(authSessionsTable)
      .where(eq(authSessionsTable.userId, userId));
  }
}

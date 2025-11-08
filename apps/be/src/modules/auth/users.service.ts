import { Inject, Injectable } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@dougust/database';
import { users as usersTable } from '@dougust/database';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DRIZZLE_ORM') private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async findByEmail(email: string) {
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async verifyPassword(passwordHash: string, plaintext: string) {
    try {
      return await argon2.verify(passwordHash, plaintext);
    } catch {
      return false;
    }
  }

  async updateLastLogin(userId: string, when: Date) {
    await this.db
      .update(usersTable)
      .set({ lastLoginAt: when, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }
}

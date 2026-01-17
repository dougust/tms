import { pgEnum } from 'drizzle-orm/pg-core';

// User role enum
export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'admin',
  'agent',
  'viewer',
]);

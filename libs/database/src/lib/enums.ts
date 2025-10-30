import { pgEnum } from 'drizzle-orm/pg-core';

// User role enum
export const userRoleEnum = pgEnum('user_role', [
  'owner',
  'admin',
  'agent',
  'viewer',
]);

// Subscription tier enum
export const subscriptionTierEnum = pgEnum('subscription_tier', [
  'trial',
  'starter',
  'professional',
  'enterprise',
]);

# Plan — Refactor Tenant Enforcement: Middleware -> Guards

Goal: Ensure UserContext only resolves and exposes tenantId. Move all authentication and tenant membership enforcement to NestJS guards.

Scope: Backend only (apps/be). No DB changes required.

## Steps
1. UserContextMiddleware
   - Responsibility: Resolve tenantId from header/domain and attach it to `req.tenantId`.
   - Start AsyncLocalStorage context with `{ businessId: tenantId }`.
   - No DB lookups, no JWT verification, no membership checks, no exceptions other than internal failures.

2. JwtAccessGuard (global)
   - Skip public routes: `/auth/**`, `/health/**`.
   - Validate `Authorization: Bearer <token>` using `JwtService`.
   - Load active user from base `users` table; attach `{ id, email }` to `req.user`.
   - Throw 401 for missing/invalid token or inactive user.

3. TenantGuard (global)
   - Skip public routes.
   - Require `req.tenantId` (set by middleware). Validate tenant exists and is active.
   - Verify membership in `tenant_memberships` for `(tenantId, userId)`; attach `currentRole` to `req.user`.
   - Throw 400 if missing tenantId, 404 if not found/inactive, 403 if no membership.

4. Wiring
   - Register guards globally using `APP_GUARD` in `AppModule` in order: `JwtAccessGuard` then `TenantGuard`.
   - Keep `UserContextMiddleware` applied to all routes.

## Acceptance Criteria
- UserContext has no authorization logic; only tenantId resolution and context.
- Protected routes require valid JWT and tenant membership enforced by guards.
- Public routes `/auth` and `/health` remain accessible without tenant or JWT.
- Existing tenant-scoped services keep using `UserContextService.businessId` to reach per-tenant tables.

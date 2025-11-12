# Plan 3 — Authorization (RBAC)

Goal: Define and enforce role-based access control for tenant-scoped operations. Keep initial permissions simple and code-based. No UI.

Scope: Backend only, grounded on a user already authenticated and tenant already resolved (from Plan 2).

## Roles
- owner — full control over tenant, including member management and billing
- admin — manage all tenant data and settings, except deleting the tenant
- member — CRUD on business data; cannot manage members or billing
- viewer — read-only access to business data

Note: user_role enum already exists in libs/database/src/lib/enums.ts; if adjustments are needed (e.g., rename agent->member), provide a migration and code mapping. For now, implement an in-code mapping independent from DB enum naming.

## Permissions model (code-based)
- Define an Action union type (e.g., 'empresa:create', 'empresa:read', 'projeto:*', 'funcionario:read', etc.)
- Maintain a Role -> Set<Action> map (or pattern with wildcards) in a single policy file
- Provide helper `can(role, action)` and `require(action)` that throws ForbiddenException when not allowed

## NestJS integration
1. @RequireActions(...actions) decorator
   - Stores required actions as metadata on route handlers
2. RolesGuard
   - Reads actions from metadata
   - Obtains `req.user.currentRole` (populated by TenantGuard)
   - Checks each required action via policy.can(role, action)
   - Throws 403 if any action is not permitted
3. Composition
   - Use JwtAuthGuard + TenantGuard + RolesGuard in that order on tenant-scoped controllers

## Default policy examples
- owner: grants all '*' actions
- admin: '*' on business entities; limited settings; no 'tenant:delete'
- member: CRUD on empresas, projetos, funcionarios, diarias, tiposDiaria; no member management
- viewer: read-only on business entities

## Extensibility
- Later migration to CASL or a DB-driven permission table
- Route-level overrides possible by listing specific actions

## Acceptance criteria
- Controllers can declare required actions and be enforced at runtime
- A user with insufficient role receives 403 responses
- Unit tests validate policy mapping and guard behavior

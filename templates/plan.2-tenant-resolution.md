# Plan 2 — Multi-tenant Request Resolution and Enforcement

Goal: Resolve the current tenant for each request and enforce tenant membership on protected, tenant-scoped endpoints. This plan does not include signup/invite/provisioning logic.

Scope: Backend only. Uses existing base tenants table. No UI changes.

## Resolution strategies
- Subdomain resolution (production): acme.api.example.com -> tenant slug (or map to tenantId)
- Header-based resolution (dev/local/preview): X-Tenant-Id: <tenantId>
- Fallback: Environment variable TENANT_ID for single-tenant/dev tooling only (already used by libs/database/src/lib/schema.dev.ts)

## Components (NestJS)

1. TenantResolverMiddleware
   - Parses incoming request for tenant identifier:
     - If TENANT_DOMAIN_MODE=domain, extract subdomain and resolve to tenantId via base.tenants table (slug or domain column to be added later if needed)
     - If TENANT_DOMAIN_MODE=header, read X-Tenant-Id header as tenantId
   - Validates tenant is active; attaches tenantId to request (req.tenantId)

2. TenantContext (request-scoped provider)
   - Exposes getTenantId(): string and assertTenant(): void
   - Reads from request (set by middleware) and throws a 400/404 if missing

3. TenantGuard (auth + membership enforcement)
   - Requires a valid JWT (via JwtAuthGuard composition)
   - Loads membership from base.tenant_memberships by (userId, tenantId)
   - If none found or user inactive, throw 403
   - Attaches membership.role to request.user.currentRole

4. DatabaseTenantFactory
   - Given a tenantId, returns the Drizzle table objects in that schema using existing factories in libs/database/src/lib/tenant
   - Example: const { empresas, projetos } = dbTenantFactory.for(tenantId)
   - Services use TenantContext.getTenantId() to obtain tenantId and pass into factories

## Request lifecycle
- Middleware: resolve tenantId -> set req.tenantId
- Auth guard: validate access token -> set req.user
- Tenant guard: check membership for req.user.id + req.tenantId, attach role
- Controller/service: use TenantContext + DatabaseTenantFactory to operate within that schema

## Configuration
- TENANT_DOMAIN_MODE=domain|header
- TENANT_HEADER_NAME=X-Tenant-Id

## Error handling
- 400 Bad Request: Missing or malformed tenant identifier
- 404 Not Found: Tenant not found or inactive
- 403 Forbidden: No membership for user on the resolved tenant

## Acceptance criteria
- All tenant-scoped endpoints fail fast when tenantId is missing/invalid
- Authorized users with valid membership can access data; others receive 403
- Services operate strictly within the resolved tenant schema using the factory

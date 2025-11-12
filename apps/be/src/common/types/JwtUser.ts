export type JwtUser = {
  sub: string;
  email: string;
  tenants: { tenantId: string; role: string; isDefault: boolean }[];
};

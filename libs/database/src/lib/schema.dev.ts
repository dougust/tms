import { pessoasJuridicas, users } from './tenant';
import { pgSchema } from 'drizzle-orm/pg-core';

export * from './enums';
export { tenant } from './core-tables';

export const schema = pgSchema(process.env.TENANT_ID);
export const usersTpl = users(process.env.TENANT_ID);
export const pessoasJuridicasTpl = pessoasJuridicas(process.env.TENANT_ID);

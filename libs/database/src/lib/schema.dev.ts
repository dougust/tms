import {
  funcionarios,
  pessoasJuridicas,
  projetos,
  projetosRelations,
  users,
} from './tenant';
import { pgSchema } from 'drizzle-orm/pg-core';

export * from './enums';
export { tenant } from './core-tables';

export const schema = pgSchema(process.env.TENANT_ID);
export const usersTpl = users(process.env.TENANT_ID);
export const pessoasJuridicasTpl = pessoasJuridicas(process.env.TENANT_ID);
export const functionariosTpl = funcionarios(process.env.TENANT_ID);
export const projetosTpl = projetos(process.env.TENANT_ID);
export const projetosRelationsTpl = projetosRelations(process.env.TENANT_ID);

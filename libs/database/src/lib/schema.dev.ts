import {
  atividadesObras,
  cadastros,
  frequencia,
  funcionarios,
  projetos,
  projetosRelations,
  users,
} from './tenant';
import { pgSchema } from 'drizzle-orm/pg-core';

export * from './enums';
export { tenant } from './core-tables';

export const schema = pgSchema(process.env.TENANT_ID);
export const usersTpl = users(process.env.TENANT_ID);
export const cadastrosTpl = cadastros(process.env.TENANT_ID);
export const projetosTpl = projetos(process.env.TENANT_ID);
export const funcionariosTpl = funcionarios(process.env.TENANT_ID);
export const atividadesObrasTpl = atividadesObras(process.env.TENANT_ID);
export const frequenciaTpl = frequencia(process.env.TENANT_ID);
export const projetosRelationsTpl = projetosRelations(process.env.TENANT_ID);

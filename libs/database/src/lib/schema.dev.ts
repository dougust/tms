import {
  diarias,
  empresas,
  diariasToFuncionarios,
  funcionarios,
  projetos,
  projetosRelations,
  empresasRelations,
  users,
  diariasRelations,
  funcionariosRelations,
} from './tenant';
import { pgSchema } from 'drizzle-orm/pg-core';

export * from './enums';
export * from './tenant/enums';
export { tenant } from './core-tables';

export const schema = pgSchema(process.env.TENANT_ID);
export const usersTpl = users(process.env.TENANT_ID);

export const empresasTpl = empresas(process.env.TENANT_ID);
export const empresasRelationsTpl = empresasRelations(process.env.TENANT_ID);

export const projetosTpl = projetos(process.env.TENANT_ID);
export const projetosRelationsTpl = projetosRelations(process.env.TENANT_ID);

export const funcionariosTpl = funcionarios(process.env.TENANT_ID);
export const funcionariosRelTp = funcionariosRelations(process.env.TENANT_ID);

export const diariasTpl = diarias(process.env.TENANT_ID);
export const diariasRelationsTpl = diariasRelations(process.env.TENANT_ID);

export const diariasToFuncionariosTpl = diariasToFuncionarios(
  process.env.TENANT_ID
);

import {
  diarias,
  empresas,
  empresasRelations,
  funcionarios,
  funcionariosRelations,
  projetos,
  projetosRelations,
  tiposDiaria,
} from './tenant';
import { pgSchema } from 'drizzle-orm/pg-core';

export * from './enums';
export * from './core-tables';

export const schema = pgSchema(process.env.TENANT_ID);

export const empresasTpl = empresas(process.env.TENANT_ID);
export const empresasRelationsTpl = empresasRelations(process.env.TENANT_ID);

export const projetosTpl = projetos(process.env.TENANT_ID);
export const projetosRelationsTpl = projetosRelations(process.env.TENANT_ID);

export const funcionariosTpl = funcionarios(process.env.TENANT_ID);
export const funcionariosRelTp = funcionariosRelations(process.env.TENANT_ID);

export const diariasTpl = diarias(process.env.TENANT_ID);

export const tipoDeDiariasTpl = tiposDiaria(process.env.TENANT_ID);

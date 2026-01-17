import {
  empresas,
  empresasRelations,
  funcionarios,
  funcionariosRelations,
  projetos,
  projetosRelations,
  beneficios,
  lookup,
  diarias,
  beneficiosRelations,
} from './tenant';

export * from './enums';
export * from './core-tables';

export const empresasTpl = empresas;
export const empresasRelationsTpl = empresasRelations;

export const projetosTpl = projetos;
export const projetosRelationsTpl = projetosRelations;

export const funcionariosTpl = funcionarios;
export const funcionariosRelTpl = funcionariosRelations;

export const diariasTpl = diarias;

export const beneficiosTpl = beneficios;
export const beneficiosRelTpl = beneficiosRelations;

export const lookupTpl = lookup;

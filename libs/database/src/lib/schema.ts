import { cadastros, projetos, funcionarios, diariaObras, frequencia, projetosRelations, users } from './tenant';

export * from './enums';
export { tenant } from './core-tables';

export const usersTpl = users('__tenant');
export const cadastrosTpl = cadastros('__tenant');
export const projetosTpl = projetos('__tenant');
export const funcionariosTpl = funcionarios('__tenant');
export const atividadesObrasTpl = diariaObras('__tenant');
export const frequenciaTpl = frequencia('__tenant');
export const projetosRelationsTpl = projetosRelations('__tenant');

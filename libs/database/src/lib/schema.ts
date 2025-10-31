import { pessoasJuridicas, users } from './tenant';

export * from './enums';
export { tenant } from './core-tables';

export const usersTpl = users('__tenant');
export const pessoasJuridicasTpl = pessoasJuridicas('__tenant');

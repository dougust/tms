import {  users } from './tenant';

export * from './enums';
export { tenant } from './core-tables';


//TODO: we will get this sorted later, the idea is to have migrations with __tenant where we replace this placeholder with an actual schema
export const usersTpl = users('__tenant');

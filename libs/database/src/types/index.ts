import { InferSelectModel } from 'drizzle-orm';
import {
  empresas,
  funcionarios,
  projetos,
  lookup,
  diarias,
  beneficios,
} from '../lib/tenant';

export type IEmpresa = InferSelectModel<ReturnType<typeof empresas>>;
export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;
export type IProjeto = InferSelectModel<ReturnType<typeof projetos>>;
export type IDiaria = InferSelectModel<ReturnType<typeof diarias>>;
export type ILookup = InferSelectModel<ReturnType<typeof lookup>>;
export type Ibeneficios = InferSelectModel<ReturnType<typeof beneficios>>;

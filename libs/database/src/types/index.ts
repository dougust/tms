import { InferSelectModel } from 'drizzle-orm';
import {
  diarias,
  empresas,
  funcionarios,
  projetos,
  tiposDiaria,
} from '../lib/tenant';

export type IEmpresa = InferSelectModel<ReturnType<typeof empresas>>;
export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;
export type IProjeto = InferSelectModel<ReturnType<typeof projetos>>;
export type IDiaria = InferSelectModel<ReturnType<typeof diarias>>;
export type ITipoDiaria = InferSelectModel<ReturnType<typeof tiposDiaria>>;

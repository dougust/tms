import { InferSelectModel } from 'drizzle-orm';
import {
  diarias,
  diariasToFuncionarios,
  empresas,
  funcionarios,
  projetos,
} from '../lib/tenant';
import { diariaLabel } from '../lib/tenant/enums';

export type IEmpresa = InferSelectModel<ReturnType<typeof empresas>>;
export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;
export type IProjeto = InferSelectModel<ReturnType<typeof projetos>>;
export type IDiaria = InferSelectModel<ReturnType<typeof diarias>>;
export type IDiariaFuncionarioRel = InferSelectModel<
  ReturnType<typeof diariasToFuncionarios>
>;

export type IDiariaLabel = (typeof diariaLabel)[number];

import { InferSelectModel } from 'drizzle-orm';
import {
  empresas,
  funcionarios,
  projetos,
  lookup,
  diarias,
  beneficios,
} from '../lib/tenant';

export type IEmpresaTable = typeof empresas;
export type IFuncionarioTable = typeof funcionarios;
export type IProjetoTable = typeof projetos;
export type IDiariaTable = typeof diarias;
export type ILookupTable = typeof lookup;
export type IBeneficiosTable = typeof beneficios;

export type IEmpresa = InferSelectModel<IEmpresaTable>;
export type IFuncionario = InferSelectModel<IFuncionarioTable>;
export type IProjeto = InferSelectModel<IProjetoTable>;
export type IDiaria = InferSelectModel<IDiariaTable>;
export type ILookup = InferSelectModel<ILookupTable>;
export type IBeneficios = InferSelectModel<IBeneficiosTable>;

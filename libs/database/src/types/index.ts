import { InferSelectModel } from 'drizzle-orm';
import {
  empresas,
  funcionarios,
  projetos,
  lookup,
  diarias,
  beneficios,
} from '../lib/tenant';

export type IEmpresaTable = ReturnType<typeof funcionarios>;
export type IFuncionarioTable = ReturnType<typeof funcionarios>;
export type IProjetoTable = ReturnType<typeof funcionarios>;
export type IDiariaTable = ReturnType<typeof funcionarios>;
export type ILookupTable = ReturnType<typeof funcionarios>;
export type IBeneficiosTable = ReturnType<typeof funcionarios>;

export type IEmpresa = InferSelectModel<IEmpresaTable>;
export type IFuncionario = InferSelectModel<IFuncionarioTable>;
export type IProjeto = InferSelectModel<IProjetoTable>;
export type IDiaria = InferSelectModel<IDiariaTable>;
export type ILookup = InferSelectModel<ILookupTable>;
export type IBeneficios = InferSelectModel<IBeneficiosTable>;

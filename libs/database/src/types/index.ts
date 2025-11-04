import { InferSelectModel } from 'drizzle-orm';
import { empresas, funcionarios, projetos } from '../lib/tenant';

export type IEmpresa = InferSelectModel<ReturnType<typeof empresas>>;
export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;
export type IProjeto = InferSelectModel<ReturnType<typeof projetos>>;

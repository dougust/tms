import { InferSelectModel } from 'drizzle-orm';
import { empresas, funcionarios } from '../lib/tenant';

export type IEmpresa = InferSelectModel<ReturnType<typeof empresas>>;
export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;

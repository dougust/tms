import { InferSelectModel } from 'drizzle-orm';
import { funcionarios } from '../lib/tenant';

export type IFuncionario = InferSelectModel<ReturnType<typeof funcionarios>>;

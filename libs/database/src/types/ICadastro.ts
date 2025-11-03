import { InferSelectModel } from 'drizzle-orm';
import { cadastros } from '../lib/tenant';

export type ICadastro = InferSelectModel<ReturnType<typeof cadastros>>;

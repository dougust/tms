import { pgEnum } from 'drizzle-orm/pg-core';

export const tipoDeDiariaEnum = pgEnum('tipo_diaria', [
  'presente',
  'faltou',
  'doente',
]);

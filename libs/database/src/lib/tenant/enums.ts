import { pgEnum } from 'drizzle-orm/pg-core';


export const diariaLabel = [
  'presente',
  'faltou',
  'doente',
] as const;

export const diariaLabelPg = pgEnum('tipo_diaria', diariaLabel);

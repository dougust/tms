import {
  date,
  foreignKey,
  integer,
  numeric,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const empresas = pgTable(
  'cad_empresas',
  {
    id: uuid('empresa_id').defaultRandom(),
    razao: varchar('razao', { length: 100 }),
    fantasia: varchar('fantasia', { length: 100 }),
    cnpj: varchar('cnpj', { length: 15 }).unique().notNull(),
    registro: date('registro'),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id],
      name: 'pk_empresa',
    }),
  ]
);

export const empresasRelations = relations(empresas, ({ many }) => ({
  projetos: many(projetos),
}));

export const projetos = pgTable(
  'cad_projetos',
  {
    id: uuid('projeto_id').defaultRandom(),
    empresaId: uuid('empresa_id'),
    nome: varchar('nome', { length: 100 }).unique(),
    inicio: date('inicio').notNull(),
    fim: date('fim').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id],
      name: 'pk_projetos',
    }),
    foreignKey({
      name: 'fk_projeto_empresa',
      columns: [t.empresaId],
      foreignColumns: [empresas.id],
    }),
  ]
);

export const projetosRelations = relations(projetos, ({ many }) => ({
  funcionarios: many(funcionarios),
  diarias: many(diarias),
}));

export const funcionarios = pgTable(
  'cad_funcionarios',
  {
    id: uuid('funcionario_id').defaultRandom(),
    nome: varchar('nome', { length: 100 }),
    social: varchar('social', { length: 100 }),
    cpf: varchar('cpf', { length: 15 }).unique().notNull(),
    nascimento: date('nascimento'),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    rg: varchar('rg', { length: 11 }),
    funcao: uuid('funcao'),
    salario: numeric('salario', { precision: 15, scale: 2, mode: 'number' }),
    dependetes: integer('dependentes'),
    projetoId: uuid('projeto_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id],
      name: 'pk_funcionrio',
    }),
    foreignKey({
      name: 'fk_funcionarios_projetos',
      columns: [t.projetoId],
      foreignColumns: [projetos.id],
    }),
    foreignKey({
      name: 'fk_funcionarios_funcao',
      columns: [t.funcao],
      foreignColumns: [lookup.id],
    }),
  ]
);

export const funcionariosRelations = relations(funcionarios, ({ many }) => ({
  diarias: many(diarias),
}));

export const beneficios = pgTable(
  'cad_beneficios',
  {
    id: uuid('beneficio_id').defaultRandom(),
    lookupId: uuid('lookup_id'),
    funcionarioId: uuid('funcionario_id'),
    valor: numeric('valor', { precision: 15, scale: 2, mode: 'number' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id],
      name: 'pk_beneficios',
    }),
    foreignKey({
      name: 'fk_funcionario_beneficios',
      columns: [t.funcionarioId],
      foreignColumns: [funcionarios.id],
    }),
    foreignKey({
      name: 'fk_beneficios',
      columns: [t.lookupId],
      foreignColumns: [lookup.id],
    }),
  ]
);

export const beneficiosRelations = relations(beneficios, ({ many }) => ({
  funcionarios: many(funcionarios),
  beneficios: many(lookup),
}));

export const diarias = pgTable(
  'cad_diarias',
  {
    id: uuid('diarias_id').notNull().defaultRandom(),
    dia: date('dia').notNull(),
    funcionarioId: uuid('funcionario_id').notNull(),
    projetoId: uuid('projeto_id'),
    tipoDiaria: uuid('tipo_diaria'),
    observacoes: varchar('observacoes', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.id],
      name: 'pk_diarias',
    }),
    foreignKey({
      name: 'fk_diarias_projetos',
      columns: [t.projetoId],
      foreignColumns: [projetos.id],
    }),
    foreignKey({
      name: 'fk_diarias_funcionarios',
      columns: [t.funcionarioId],
      foreignColumns: [funcionarios.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_diaria_lookup',
      columns: [t.tipoDiaria],
      foreignColumns: [lookup.id],
    }),
  ]
);

export const lookup = pgTable(
  'cad_lookup',
  {
    id: uuid('lookup_id').unique().defaultRandom(),
    grupo: varchar('grupo', { length: 100 }),
    nome: varchar('nome', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      columns: [t.grupo, t.nome],
      name: 'pk_lookup',
    }),
  ]
);

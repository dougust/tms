'use client';

import { ColumnDef } from '@tanstack/react-table';

export type DadosFuncionarioRow = {
  id: string;
  nome?: string;
  funcao?: string;
  faltas: number;
  valor_diaria?: string;
  valor_almoco?: string;
  valor_cafe?: string;
  valor_saude_ocupacional?: string;
  valor_saude_plano?: string;
  valor_janta?: string;
  valor_desconto_casa?: string;
  salario?: string;
  dependetes?: number | string;
};

function formatCurrencyBRL(value?: string) {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  } catch {
    return '-';
  }
}

function formatInteger(value?: number | string) {
  if (value === undefined || value === null) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return Math.trunc(num).toString();
}

export const columns: ColumnDef<DadosFuncionarioRow>[] = [
  { accessorKey: 'nome', header: 'Nome' },
  { accessorKey: 'funcao', header: 'Função' },
  {
    accessorKey: 'faltas',
    header: 'Faltas',
    cell: ({ row }) => String(row.original.faltas ?? 0),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_diaria',
    header: 'Valor diária',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_diaria),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_almoco',
    header: 'Vale almoço',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_almoco),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_cafe',
    header: 'Vale café da tarde',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_cafe),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_saude_ocupacional',
    header: 'Plano de Ocupacional',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_saude_ocupacional),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_saude_plano',
    header: 'Plano Saúde',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_saude_plano),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_janta',
    header: 'Vale janta',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_janta),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'valor_desconto_casa',
    header: 'Desconto Casa',
    cell: ({ row }) => formatCurrencyBRL(row.original.valor_desconto_casa),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'salario',
    header: 'Salário',
    cell: ({ row }) => formatCurrencyBRL(row.original.salario),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'dependetes',
    header: 'Dependentes',
    cell: ({ row }) => formatInteger(row.original.dependetes),
    meta: { className: 'text-right' },
  },
];

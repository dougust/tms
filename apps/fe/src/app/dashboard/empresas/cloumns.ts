'use client';

import { ColumnDef } from '@tanstack/react-table';
import { EmpresaDto } from '@dougust/clients';

export const columns: ColumnDef<EmpresaDto>[] = [
  {
    accessorKey: 'razao',
    header: 'Razão Social',
  },
  {
    accessorKey: 'fantasia',
    header: 'Nome Fantasia',
  },
  {
    accessorKey: 'cnpj',
    header: 'CNPJ',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
  },
  {
    accessorKey: 'registro',
    header: 'Registro',
  },
];

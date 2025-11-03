'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FuncionarioDto } from '@dougust/clients';

export const columns: ColumnDef<FuncionarioDto>[] = [
  {
    accessorKey: 'nome',
    header: 'Nome',
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
  },
];

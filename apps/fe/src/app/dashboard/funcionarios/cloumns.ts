'use client';

import { ColumnDef } from '@tanstack/react-table';
import { GetFuncionarioResponseDto } from '@dougust/clients';

export const columns: ColumnDef<GetFuncionarioResponseDto>[] = [
  {
    accessorKey: 'cadastro.nomeRazao',
    header: 'Nome',
  },
  {
    accessorKey: 'cadastro.cpfCnpj',
    header: 'CPF',
  },
  {
    accessorKey: 'cadastro.email',
    header: 'Email',
  },
  {
    accessorKey: 'cadastro.phone',
    header: 'Telefone',
  },
];

import { ColumnDef } from '@tanstack/react-table';
import { IProjetoListDto } from '@dougust/types';

export const columns: ColumnDef<IProjetoListDto>[] = [
  {
    header: 'Nome',
    accessorKey: 'projeto.nome',
  },
  {
    header: 'empresa',
    accessorKey: 'empresa.razao',
  },
];

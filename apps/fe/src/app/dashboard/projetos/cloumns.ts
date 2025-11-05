import { ColumnDef } from '@tanstack/react-table';
import { ProjetoDto } from '@dougust/clients';

export const columns: ColumnDef<ProjetoDto>[] = [
  {
    header: 'Nome',
    accessorKey: 'nome',
  },
  {
    header: 'empresa',
    accessorKey: 'razao',
  },
];

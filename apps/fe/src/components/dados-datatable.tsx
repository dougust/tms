import { DataTable } from '@dougust/ui';
import { ColumnDef } from '@tanstack/react-table';
import { FuncionarioDto } from '@dougust/clients';
import { formatCurrencyBRL, formatInteger } from '../lib';

export const columns: ColumnDef<FuncionarioDto>[] = [
  { accessorKey: 'nome', header: 'Nome' },
  { accessorKey: 'social', header: 'Apelido', cell: ({ row }) => row.original.social || '' },
  { accessorKey: 'cpf', header: 'CPF' },
  {
    accessorKey: 'nascimento',
    header: 'Nascimento',
    cell: ({ row }) => {
      const v = row.original.nascimento as unknown as string | null | undefined;
      if (!v) return '';
      // Expecting ISO date string (YYYY-MM-DD or date-time)
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d.toLocaleDateString();
    },
  },
  { accessorKey: 'phone', header: 'Telefone', cell: ({ row }) => row.original.phone || '' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'rg', header: 'RG', cell: ({ row }) => row.original.rg || '' },
  { accessorKey: 'projetoId', header: 'Projeto' },
  { accessorKey: 'funcao', header: 'Função' },
  // {
  //   accessorKey: 'faltas',
  //   header: 'Faltas',
  //   cell: ({ row }) => String(row.original.faltas ?? 0),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_diaria',
  //   header: 'Valor diária',
  //   cell: ({ row }) => formatCurrencyBRL(row.original),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_almoco',
  //   header: 'Vale almoço',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_almoco),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_cafe',
  //   header: 'Vale café da tarde',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_cafe),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_saude_ocupacional',
  //   header: 'Plano de Ocupacional',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_saude_ocupacional),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_saude_plano',
  //   header: 'Plano Saúde',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_saude_plano),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_janta',
  //   header: 'Vale janta',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_janta),
  //   meta: { className: 'text-right' },
  // },
  // {
  //   accessorKey: 'valor_desconto_casa',
  //   header: 'Desconto Casa',
  //   cell: ({ row }) => formatCurrencyBRL(row.original.valor_desconto_casa),
  //   meta: { className: 'text-right' },
  // },
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
  {
    accessorKey: 'decimoTerceiro',
    header: '13º (calc.)',
    cell: ({ row }) => formatCurrencyBRL(row.original.decimoTerceiro),
    meta: { className: 'text-right' },
  },
  {
    accessorKey: 'ferias',
    header: 'Férias (calc.)',
    cell: ({ row }) => formatCurrencyBRL(row.original.ferias),
    meta: { className: 'text-right' },
  },
];

export type DadosDatatableProps = {
  funcionarios: FuncionarioDto[];
  filters: React.ReactNode;
};

export const DadosDatatable = (props: DadosDatatableProps) => {
  const { funcionarios, filters } = props;

  return (
    <DataTable
      filteringSection={filters}
      columns={columns}
      data={funcionarios}
      showColumnsSelector
    />
  );
};

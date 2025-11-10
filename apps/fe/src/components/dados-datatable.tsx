import { DataTable } from '@dougust/ui';
import { ColumnDef } from '@tanstack/react-table';
import { FuncionarioDto } from '@dougust/clients';
import { formatCurrencyBRL, formatInteger } from '../lib';

export const columns: ColumnDef<FuncionarioDto>[] = [
  { accessorKey: 'nome', header: 'Nome' },
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
];

export type DadosDatatableProps = {
  funcionarios: FuncionarioDto[];
};

export const DadosDatatable = (props: DadosDatatableProps) => {
  const { funcionarios } = props;

  return <DataTable columns={columns} data={funcionarios} />;
};



// <div className="rounded-lg border bg-card shadow-sm">
//   <div className="border-b bg-muted/50 p-4 space-y-4">
//     {/* Month selector */}
//     <div className="flex items-center gap-3">
//       <label className="text-sm font-medium" htmlFor="mes">
//         Mês
//       </label>
//       <input
//         id="mes"
//         type="month"
//         className="border rounded-md px-3 py-2 bg-background"
//         value={selectedMonth}
//         onChange={(e) => setSelectedMonth(e.target.value)}
//       />
//     </div>
//
//     {anyError ? (
//     ) : anyLoading || !funcionarios ? (
//       ) : (
//       )}
//   </div>
// </div>

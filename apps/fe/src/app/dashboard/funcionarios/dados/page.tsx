'use client';

import {
  DiariaDto,
  FuncionarioDto,
  LookupDto,
  useDiariasControllerFindInRange,
  useFuncionariosControllerFindAll,
  useLookupsControllerFindByGroup,
} from '@dougust/clients';
import {
  DadosDatatable,
  ErrorPanel,
  ListPageLayout,
} from '../../../../components';
import { useMemo, useState } from 'react';

function getMonthBoundaries(monthStr: string) {
  // monthStr in format YYYY-MM
  const [y, m] = monthStr.split('-').map(Number);
  const fromDate = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  const toDate = new Date(Date.UTC(y, m ?? 1, 0)); // last day of month
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);
  return { from, to };
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function DadosFuncionariosPage() {
  // Default to current month in user's local time
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  const {
    data: funcionarios,
    isPending: isFuncionariosPending,
    isError: isFuncionariosError,
    refetch,
  } = useFuncionariosControllerFindAll<FuncionarioDto[]>();

  const {
    data: tipos = [],
    isPending: isLookupPending,
    isError: isLookupError,
  } = useLookupsControllerFindByGroup<LookupDto[]>('TipoDiaria');

  // Fetch diárias in the selected month
  const { from, to } = useMemo(
    () => getMonthBoundaries(selectedMonth),
    [selectedMonth]
  );
  const {
    data: diarias = [],
    isPending: isDiariasPending,
    isError: isDiariasError,
    refetch: refetchDiarias,
  } = useDiariasControllerFindInRange<DiariaDto[]>({ from, to });

  const isPending =
    isFuncionariosPending || isDiariasPending || isLookupPending;
  const isError = isFuncionariosError || isDiariasError || isLookupError;

  return (
    <ListPageLayout
      title="Dados Funcionários"
      description="Visualize os dados financeiros e benefícios dos funcionários."
      onRefreshClick={async () => {
        await refetch();
        await refetchDiarias();
      }}
    >
      {isError ? (
        <ErrorPanel message="erro ao carregar dados" />
      ) : isPending ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DadosDatatable
          filters={
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium" htmlFor="mes">
                Mês
              </label>
              <input
                id="mes"
                type="month"
                className="border rounded-md px-3 py-2 bg-background"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          }
          funcionarios={funcionarios}
        />
      )}
    </ListPageLayout>
  );
}

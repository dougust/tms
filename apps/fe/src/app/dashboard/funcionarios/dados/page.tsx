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
  ErrorPanel,
  ListPageLayout,
  DadosDatatable,
} from '../../../../components';
import { Users } from 'lucide-react';
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

export default function DadosFuncionariosPage() {
  // Default to current month in user's local time
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

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

  const faltaTipoId = useMemo(() => {
    const falta = tipos.find((t) => t.nome?.toLowerCase?.() === 'falta');
    return falta?.id ?? null;
  }, [tipos]);

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

  const faltasByFuncionario = useMemo(() => {
    if (!faltaTipoId) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const d of diarias) {
      if (d.tipoDiaria && d.tipoDiaria === faltaTipoId) {
        map.set(d.funcionarioId, (map.get(d.funcionarioId) || 0) + 1);
      }
    }
    return map;
  }, [diarias, faltaTipoId]);

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
      stats={[
        {
          title: 'Total funcionários',
          value: isPending ? '...' : funcionarios?.length?.toString() || '0',
          icon: <Users className="h-5 w-5 text-primary" />,
        },
      ]}
    >
      {isError ? (
        <ErrorPanel message="erro ao carregar dados" />
      ) : isPending ? (
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DadosDatatable funcionarios={funcionarios} />
      )}
    </ListPageLayout>
  );
}

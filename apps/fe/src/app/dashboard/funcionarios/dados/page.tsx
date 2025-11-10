'use client';

import {
  useFuncionariosControllerFindAll,
  FuncionarioDto,
  useDiariasControllerFindInRange,
  useLookupsControllerFindAll,
  LookupDto,
  DiariaDto,
} from '@dougust/clients';
import { DataTable } from '@dougust/ui';
import { ListPageLayout, ErrorPanel } from '../../../../components';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { columns, type DadosFuncionarioRow } from './columns';

function getMonthBoundaries(monthStr: string) {
  // monthStr in format YYYY-MM
  const [y, m] = monthStr.split('-').map(Number);
  const fromDate = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  const toDate = new Date(Date.UTC(y, (m ?? 1), 0)); // last day of month
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);
  return { from, to };
}

export default function DadosFuncionariosPage() {
  // Default to current month in user's local time
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  const { data: funcionarios, isLoading, error, refetch } =
    useFuncionariosControllerFindAll<FuncionarioDto[]>();

  // Load lookups and filter by grupo 'TipoDiaria' to find the id for 'falta'
  const { data: lookups = [], isLoading: lookupsLoading } =
    useLookupsControllerFindAll<LookupDto[]>();

  const tipos = useMemo(() => (lookups || []).filter((l) => l.grupo === 'TipoDiaria'), [lookups]);
  const faltaTipoId = useMemo(() => {
    const falta = tipos.find((t) => t.nome?.toLowerCase?.() === 'falta');
    return falta?.id ?? null;
  }, [tipos]);

  // Fetch diárias in the selected month
  const { from, to } = useMemo(() => getMonthBoundaries(selectedMonth), [selectedMonth]);
  const {
    data: diarias = [],
    isLoading: diariasLoading,
    error: diariasError,
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

  const rows: DadosFuncionarioRow[] = useMemo(() => {
    if (!funcionarios) return [];
    return funcionarios.map((f) => ({
      id: f.id,
      nome: f.nome,
      funcao: (f as any).funcao,
      faltas: faltasByFuncionario.get(f.id) ?? 0,
      valor_diaria: (f as any).valor_diaria,
      valor_almoco: (f as any).valor_almoco,
      valor_cafe: (f as any).valor_cafe,
      valor_saude_ocupacional: (f as any).valor_saude_ocupacional,
      valor_saude_plano: (f as any).valor_saude_plano,
      valor_janta: (f as any).valor_janta,
      valor_desconto_casa: (f as any).valor_desconto_casa,
      salario: (f as any).salario,
      dependetes: (f as any).dependetes,
    }));
  }, [funcionarios, faltasByFuncionario]);

  const anyLoading = isLoading || lookupsLoading || diariasLoading;
  const anyError = error || diariasError;

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
          value: anyLoading ? '...' : funcionarios?.length?.toString() || '0',
          icon: <Users className="h-5 w-5 text-primary" />,
        },
      ]}
    >
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/50 p-4 space-y-4">
          {/* Month selector */}
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

          {anyError ? (
            <ErrorPanel message={`Erro ao carregar dados: ${(anyError as Error).message}`} />
          ) : anyLoading || !funcionarios ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nenhum funcionário encontrado.</div>
          ) : (
            <DataTable columns={columns} data={rows} />
          )}
        </div>
      </div>
    </ListPageLayout>
  );
}

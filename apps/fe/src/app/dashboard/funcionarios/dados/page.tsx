'use client';

import {
  useFuncionariosControllerFindAll,
  FuncionarioDto,
  useDiariasControllerFindInRange,
  useLookupsControllerFindAll,
  LookupDto,
  DiariaDto,
} from '@dougust/clients';
import { ListPageLayout, ErrorPanel } from '../../../../components';
import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';

function formatCurrencyBRL(value?: string) {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  } catch {
    return '-';
  }
}

function formatInteger(value?: string) {
  if (!value) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return Math.trunc(num).toString();
}

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

  // Load lookups and filter by grupo 'TipoDiaria' to find the key for 'falta'
  const { data: lookups = [], isLoading: lookupsLoading } =
    useLookupsControllerFindAll<LookupDto[]>();

  const tipos = useMemo(() => (lookups || []).filter((l) => l.grupo === 'TipoDiaria'), [lookups]);
  const faltaTipoKey = useMemo(() => {
    const falta = tipos.find((t) => t.nome?.toLowerCase?.() === 'falta');
    return falta?.key ?? null;
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
    if (!faltaTipoKey) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const d of diarias) {
      if (typeof d.tipoDiaria === 'number' && d.tipoDiaria === faltaTipoKey) {
        map.set(d.funcionarioId, (map.get(d.funcionarioId) || 0) + 1);
      }
    }
    return map;
  }, [diarias, faltaTipoKey]);

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
          ) : funcionarios.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nenhum funcionário encontrado.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_th]:h-10">
                  <tr className="border-b">
                    <th className="px-4 text-left">Nome</th>
                    <th className="px-4 text-left">Função</th>
                    <th className="px-4 text-right">Faltas</th>
                    <th className="px-4 text-right">Valor diária</th>
                    <th className="px-4 text-right">Vale almoço</th>
                    <th className="px-4 text-right">Vale café da tarde</th>
                    <th className="px-4 text-right">Plano de Ocupacional</th>
                    <th className="px-4 text-right">Plano Saúde</th>
                    <th className="px-4 text-right">Vale janta</th>
                    <th className="px-4 text-right">Desconto Casa</th>
                    <th className="px-4 text-right">Salário</th>
                    <th className="px-4 text-right">Dependentes</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:h-12">
                  {funcionarios.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="px-4 text-left whitespace-nowrap">{f.nome || '-'}</td>
                      <td className="px-4 text-left whitespace-nowrap">{f.funcao || '-'}</td>
                      <td className="px-4 text-right">{faltasByFuncionario.get(f.id) ?? 0}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_diaria)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_almoco)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_cafe)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_saude_ocupacional)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_saude_plano)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_janta)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.valor_desconto_casa)}</td>
                      <td className="px-4 text-right">{formatCurrencyBRL(f.salario)}</td>
                      <td className="px-4 text-right">{formatInteger(f.dependetes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ListPageLayout>
  );
}

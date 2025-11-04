'use client';

import { useAppQuery } from '@dougust/clients';
import { ListPageLayout, CalendarDiarias } from '../../../components';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { IDiariaFuncionarioResultDto } from '@dougust/types';
import React from 'react';
import { Button } from '@dougust/ui';
import { DataTableDemo } from '@dougust/fe/components/example-data-table';

function toISODate(d: Date) {
  const dd = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return dd.toISOString().slice(0, 10);
}

function startOfWeekMonday(d: Date) {
  const day = d.getDay(); // 0=Sun,1=Mon,...
  const diff = day === 0 ? -6 : 1 - day; // move back to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}

export default function DiariasPage() {
  // Initialize to current week's Monday
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
  const weekEnd = React.useMemo(() => addDays(weekStart, 6), [weekStart]);

  const start = toISODate(weekStart);
  const end = toISODate(weekEnd);

  const { data, isLoading, error, refetch } =
    useAppQuery<IDiariaFuncionarioResultDto>({
      queryKey: [`diarias?from=${start}&to=${end}`],
    });

  const funcionarios = data?.funcionarios || [];

  // Adapt API data to UI-agnostic calendar rows
  const rows = React.useMemo(() => {
    return funcionarios.map((f) => {
      const cells: Record<string, React.ReactNode | undefined> = {};
      for (const d of f.diarias || []) {
        const key =
          typeof d.dia === 'string'
            ? d.dia
            : new Date(d.dia as any).toISOString().slice(0, 10);
        // show tipo in the cell
        cells[key] = (d as any).tipo;
      }
      const label = f.nome || f.social || f.email;
      return { id: f.id, label, cells };
    });
  }, [funcionarios]);

  const daysCount = 7;

  const weekLabel = React.useMemo(() => {
    const fmt = (iso: string) => {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}`;
    };
    return `${fmt(start)} - ${fmt(end)}`;
  }, [start, end]);

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goThisWeek = () => setWeekStart(startOfWeekMonday(new Date()));

  return (
    <ListPageLayout
      title="Diárias"
      description={`Visão de calendário semanal (${weekLabel}).`}
      onRefreshClick={refetch}
      stats={[
        {
          title: 'Funcionários',
          value: isLoading ? '...' : funcionarios.length.toString(),
          icon: <Briefcase className="h-5 w-5 text-primary" />,
        },
        {
          title: 'Dias no período',
          value: isLoading ? '...' : daysCount.toString(),
          icon: <Briefcase className="h-5 w-5 text-primary" />,
        },
      ]}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPrevWeek}>
            <ChevronLeft className="h-4 w-4" /> Semana anterior
          </Button>
          <Button variant="outline" size="sm" onClick={goThisWeek}>
            Esta semana
          </Button>
          <Button variant="outline" size="sm" onClick={goNextWeek}>
            Próxima semana <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">{weekLabel}</div>
      </div>
      <DataTableDemo />
    </ListPageLayout>
  );
}

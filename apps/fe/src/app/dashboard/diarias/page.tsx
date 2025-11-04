'use client';

import { useAppQuery, useDiariasControllerUpdateDiaria } from '@dougust/clients';
import { DiariasCalendar, ListPageLayout } from '../../../components';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { IDiariaFuncionarioResultDto } from '@dougust/types';
import React from 'react';
import { Button } from '@dougust/ui';
import { addDays, startOfWeekMonday, toISODate } from '../../../lib';

export default function DiariasPage() {

  // Initialize to current week's Monday
  const [fromDate, setFromDate] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
  const [daysCount, setDaysCount] = React.useState(7);
  const toDate = React.useMemo(() => addDays(fromDate, daysCount), [fromDate]);

  const { data, isLoading, error, refetch } =
    useAppQuery<IDiariaFuncionarioResultDto>({
      queryKey: [`diarias?from=${toISODate(fromDate)}&to=${toISODate(toDate)}`],
    });

  const funcionarios = data?.funcionarios || [];

  const weekLabel = React.useMemo(() => {
    const fmt = (iso: string) => {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}`;
    };
    return `${fmt(toISODate(fromDate))} - ${fmt(toISODate(toDate))}`;
  }, [fromDate, toDate]);

  const goPrevWeek = () => setFromDate((d) => addDays(d, -7));
  const goNextWeek = () => setFromDate((d) => addDays(d, 7));
  const goThisWeek = () => setFromDate(startOfWeekMonday(new Date()));

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

      <DiariasCalendar
        funcionarios={funcionarios}
        fromDate={fromDate}
        range={daysCount}
      />
    </ListPageLayout>
  );
}

'use client';

import { DiariasCalendar, ListPageLayout } from '../../../components';
import { Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '@dougust/ui';
import { addDays, startOfWeekMonday, toISODate } from '../../../lib';
import { useDiariasQuery } from './useDiariasQuery';
import { DiariaDto, useFuncionariosControllerFindAll } from '@dougust/clients';

export default function DiariasPage() {
  const [fromDate, setFromDate] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
  const [daysCount, setDaysCount] = React.useState(7);
  const toDate = React.useMemo(() => addDays(fromDate, daysCount), [fromDate]);

  const { data, isLoading } = useFuncionariosControllerFindAll();

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
        funcionarios={data || []}
        fromDate={fromDate}
        range={daysCount}
      />
    </ListPageLayout>
  );
}

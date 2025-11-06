import React from 'react';
import { addDays, startOfWeekMonday } from '../lib';
import { Button } from '@dougust/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type DateSelectorProps = {
  fromDate: Date;
  toDate: Date;
  onDateChange: (date: Date) => void;
};

export function DiariasDateSelector(props: DateSelectorProps) {
  const { fromDate, onDateChange } = props;

  const goPrevWeek = () => onDateChange(addDays(fromDate, -7));
  const goNextWeek = () => onDateChange(addDays(fromDate, 7));
  const goThisWeek = () => onDateChange(startOfWeekMonday(new Date()));

  return (
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
    </div>
  );
}

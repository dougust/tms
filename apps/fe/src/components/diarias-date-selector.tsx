import React from 'react';
import { addDays, startOfWeekMonday } from '../lib';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@dougust/ui';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useAppSettings } from './providers';
import { dateFormatOptions } from '../lib';

export type DateSelectorProps = {
  fromDate: Date;
  toDate: Date;
  onDateChange: (date: Date) => void;
};

export function DiariasDateSelector(props: DateSelectorProps) {
  const { fromDate, onDateChange } = props;
  const { dateHeaderFormat, setDateHeaderFormat } = useAppSettings();

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
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              title="Configurar formato da data"
            >
              <Settings className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">
                Formato: {dateHeaderFormat}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="flex flex-col gap-1">
              {dateFormatOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={dateHeaderFormat === opt.value ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start"
                  onClick={() => setDateHeaderFormat(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

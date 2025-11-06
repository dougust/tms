'use client';

import {
  DiariasCalendar,
  DiariasDateSelector,
  ListPageLayout,
} from '../../../components';
import React from 'react';
import { addDays, startOfWeekMonday, toISODate } from '../../../lib';
import {
  type DiariasControllerFindInRangeQueryParams,
  useDiariasControllerFindInRange,
  useFuncionariosControllerFindAll,
  useProjetosControllerFindAll,
  useTiposDiariaControllerFindAll,
} from '@dougust/clients';
import type { DateHeaderFormat } from '../../../components/diarias-date-selector';

const daysCount = 7;

export default function DiariasPage() {
  const [fromDate, setFromDate] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
  const [dateFormat, setDateFormat] = React.useState<DateHeaderFormat>('locale');
  const toDate = React.useMemo(() => addDays(fromDate, daysCount), [fromDate]);

  const range: DiariasControllerFindInRangeQueryParams = React.useMemo(
    () => ({
      from: toISODate(fromDate),
      to: toISODate(toDate),
    }),
    [fromDate, toDate]
  );

  const {
    data: funcionarios,
    isPending: isFuncionariosPending,
    isError: isFuncionariosError,
  } = useFuncionariosControllerFindAll();

  const {
    data: projetos,
    isPending: isProjetosPending,
    isError: isProjetosError,
  } = useProjetosControllerFindAll();

  const {
    data: diarias,
    isPending: isDiariasPending,
    isError: isDiariasError,
  } = useDiariasControllerFindInRange(range);

  const {
    data: tiposDiaria,
    isPending: isTiposPending,
    isError: isTiposError,
  } = useTiposDiariaControllerFindAll();

  const isError = isFuncionariosError || isProjetosError || isDiariasError || isTiposError;
  const isPending =
    isFuncionariosPending || isProjetosPending || isDiariasPending || isTiposPending;

  return (
    <ListPageLayout
      title="Diárias"
      description={`Visão de calendário semanal.`}
    >
      <DiariasDateSelector
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={setFromDate}
        dateFormat={dateFormat}
        onDateFormatChange={setDateFormat}
      />

      {isPending ? (
        <></>
      ) : isError ? (
        <></>
      ) : (
        <DiariasCalendar
          tiposDiarias={tiposDiaria}
          diarias={diarias}
          projetos={projetos}
          funcionarios={funcionarios}
          range={range}
          dateFormat={dateFormat}
        />
      )}
    </ListPageLayout>
  );
}

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
  useLookupsControllerFindByGroup
} from '@dougust/clients';

const daysCount = 7;

export default function DiariasPage() {
  const [fromDate, setFromDate] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
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
    data: tiposLookup = [],
    isPending: isTiposDiariaPending,
    isError: isTiposDiariaError,
  } = useLookupsControllerFindByGroup('TipoDiaria');

  const tiposDiaria = React.useMemo(
    () => tiposLookup || [],
    [tiposLookup]
  );

  const isError =
    isFuncionariosError || isProjetosError || isDiariasError || isTiposDiariaError;
  const isPending =
    isFuncionariosPending || isProjetosPending || isDiariasPending || isTiposDiariaPending;


  return (
    <ListPageLayout
      title="Diárias"
      description={`Visão de calendário semanal.`}
    >
      <DiariasDateSelector
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={setFromDate}
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
        />
      )}
    </ListPageLayout>
  );
}

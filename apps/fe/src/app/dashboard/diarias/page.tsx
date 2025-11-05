'use client';

import {
  DiariasCalendar,
  DiariasDateSelector,
  ListPageLayout,
} from '../../../components';
import React from 'react';
import { addDays, startOfWeekMonday, toISODate } from '../../../lib';
import {
  useDiariasControllerFindInRange,
  useFuncionariosControllerFindAll,
  useProjetosControllerFindAll,
} from '@dougust/clients';

const daysCount = 7;

export default function DiariasPage() {
  const [fromDate, setFromDate] = React.useState(() =>
    startOfWeekMonday(new Date())
  );
  const toDate = React.useMemo(() => addDays(fromDate, daysCount), [fromDate]);

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
  } = useDiariasControllerFindInRange({
    from: toISODate(fromDate),
    to: toISODate(toDate),
  });

  const isError = isFuncionariosError || isProjetosError || isDiariasError;
  const isPending = isFuncionariosPending || isProjetosPending || isDiariasPending;

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
          diarias={diarias}
          projetos={projetos}
          funcionarios={funcionarios}
          fromDate={fromDate}
          range={daysCount}
        />
      )}
    </ListPageLayout>
  );
}

'use client';

import {
  DiariasCalendar,
  DiariasDateSelector,
  ListPageLayout,
} from '../../../components';
import React from 'react';
import {
  addDays,
  reduceToRecord,
  startOfWeekMonday,
  toISODate,
} from '../../../lib';
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
    data: employees,
    isPending: isEmployeesPending,
    isError: isEmployeesError,
  } = useFuncionariosControllerFindAll();

  const {
    data: projects,
    isPending: isProjectsPending,
    isError: isProjectsError,
  } = useProjetosControllerFindAll({
    query: {
      select: reduceToRecord,
    },
  });

  const {
    data: diarias,
    isPending: isDiariasPending,
    isError: isDiariasError,
  } = useDiariasControllerFindInRange({
    from: toISODate(fromDate),
    to: toISODate(toDate),
  });

  const isError = isEmployeesError || isProjectsError || isDiariasError;
  const isPending = isEmployeesPending || isProjectsPending || isDiariasPending;

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
          funcionarios={employees}
          fromDate={fromDate}
          range={daysCount}
        />
      )}
    </ListPageLayout>
  );
}

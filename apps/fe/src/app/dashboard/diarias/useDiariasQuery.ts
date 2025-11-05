import {
  useDiariasControllerFindInRange,
  useFuncionariosControllerFindAll,
  useProjetosControllerFindAll,
} from '@dougust/clients';
import { reduceToRecord } from '../../../lib';
import React from 'react';

export const useDiariasQuery = (from: string, to: string) => {
  const employeesQuery = useFuncionariosControllerFindAll();

  const projectsQuery = useProjetosControllerFindAll({
    query: {
      select: reduceToRecord,
    },
  });

  const diariasQuery = useDiariasControllerFindInRange(
    {
      from,
      to,
    },
    {
      // query: {
      //   select: (diarias) =>
      //     reduceToRecordWithSelect(diarias, (diaria) => diaria.funcionarioId),
      // },
    }
  );

  const isPending =
    employeesQuery.isPending ||
    projectsQuery.isPending ||
    diariasQuery.isPending;
  const isError =
    employeesQuery.isError || projectsQuery.isError || diariasQuery.isError;

  return React.useMemo(
    () => ({
      employees: employeesQuery.data,
      projects: projectsQuery.data,
      diarias: diariasQuery.data,
      isPending,
      isError,
    }),
    [employeesQuery, projectsQuery, diariasQuery]
  );
};

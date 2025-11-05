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

  const isLoading = React.useMemo(
    () =>
      employeesQuery.isLoading ||
      projectsQuery.isLoading ||
      diariasQuery.isLoading,
    [employeesQuery.isLoading, projectsQuery.isLoading, diariasQuery.isLoading]
  );

  const refetch = React.useCallback(() => {
    employeesQuery.refetch();
    projectsQuery.refetch();
    diariasQuery.refetch();
  }, [employeesQuery, projectsQuery, diariasQuery]);

  return React.useMemo(() => {
    if (
      projectsQuery.isSuccess &&
      employeesQuery.isSuccess &&
      diariasQuery.isSuccess
    ) {
      const funcionarios = employeesQuery.data;
      const projetos = projectsQuery.data;
      const diarias = diariasQuery.data;

      return {
        funcionarios,
        projetos,
        diarias,
        refetch,
      };
    }

    return undefined;
  }, [employeesQuery, projectsQuery, diariasQuery]);
};

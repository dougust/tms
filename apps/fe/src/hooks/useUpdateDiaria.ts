import {
  DiariaDto,
  diariasControllerFindInRangeQueryKey,
  DiariasControllerFindInRangeQueryParams,
  useDiariasControllerUpdate,
} from '@dougust/clients';
import { useQueryClient } from '@tanstack/react-query';

export const useUpdateDiaria = (
  range: DiariasControllerFindInRangeQueryParams
) => {
  const queryClient = useQueryClient();
  return useDiariasControllerUpdate({
    mutation: {
      client: queryClient,
      onSuccess: (data, variables) =>
        queryClient.setQueryData(
          diariasControllerFindInRangeQueryKey(range),
          (diarias: DiariaDto[]) =>
            diarias.map((diaria) =>
              diaria.id === variables.id ? { ...diaria, ...data } : diaria
            )
        ),
      onError: (err) => {
        console.error('Falha ao atualizar diária', err);
      },
    },
  });
};

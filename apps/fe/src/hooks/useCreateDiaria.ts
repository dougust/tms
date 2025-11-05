import {
  DiariaDto,
  diariasControllerFindInRangeQueryKey,
  DiariasControllerFindInRangeQueryParams,
  useDiariasControllerCreate,
} from '@dougust/clients';
import { useQueryClient } from '@tanstack/react-query';

export const useCreateDiaria = (
  range: DiariasControllerFindInRangeQueryParams
) => {
  const queryClient = useQueryClient();
  return useDiariasControllerCreate({
    mutation: {
      client: queryClient,
      onSuccess: (data) => {
        queryClient.setQueryData(
          diariasControllerFindInRangeQueryKey(range),
          (prev: DiariaDto[]) => [...prev, data]
        );
      },
      onError: (err) => {
        console.error('Falha ao atualizar diária', err);
      },
    },
  });
};

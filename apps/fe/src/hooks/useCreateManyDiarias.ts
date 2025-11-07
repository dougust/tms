import { useQueryClient } from '@tanstack/react-query';
import {
  type DiariaDto,
  diariasControllerFindInRangeQueryKey,
  type DiariasControllerFindInRangeQueryParams,
  useDiariasControllerCreateMany,
} from '@dougust/clients';

export function useCreateManyDiarias(
  range: DiariasControllerFindInRangeQueryParams
) {
  const queryClient = useQueryClient();
  return useDiariasControllerCreateMany({
    mutation: {
      onSuccess: (created) => {
        queryClient.setQueryData(
          diariasControllerFindInRangeQueryKey(range),
          (prev: DiariaDto[] | undefined) => {
            const base = Array.isArray(prev) ? prev : [];
            return [...base, ...created];
          }
        );
      },
      onError: (err) => {
        console.error('Falha ao criar diárias em lote', err);
      },
    },
  });
}

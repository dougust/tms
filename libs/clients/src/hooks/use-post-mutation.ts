import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { FetchError, sendClientRequest } from '../clients';

export type UsePostMutationOptions<TResponse = any> = {
  mutationKey: string[];
};

export const usePostMutation = <TResponse = any, TVariables = unknown>({
  mutationKey,
}: UsePostMutationOptions<TResponse>): UseMutationResult<
  TResponse,
  FetchError,
  TVariables
> => {
  return useMutation<TResponse, FetchError, TVariables>({
    mutationKey,
    mutationFn: async (variables: TVariables) => {
      try {
        return await sendClientRequest<TResponse, TVariables>(
          mutationKey.join('/'),
          {
            method: 'POST',
            data: variables,
          }
        );
      } catch (e) {
        if (e instanceof FetchError) throw e;
        throw e as unknown as FetchError;
      }
    },
  });
};

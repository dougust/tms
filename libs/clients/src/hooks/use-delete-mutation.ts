import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { FetchError, sendClientRequest } from '../clients';

export type DeleteMutationVariables = {
  id: string;
};

export type UseAppMutationOptions<TResponse = any> = {
  mutationKey: string[];
};

export const useDeleteMutation = <TResponse = any>({
  mutationKey,
}: UseAppMutationOptions<TResponse>): UseMutationResult<
  TResponse,
  FetchError,
  DeleteMutationVariables
> => {
  return useMutation<TResponse, FetchError, DeleteMutationVariables>({
    mutationKey,
    mutationFn: async ({ id }: DeleteMutationVariables) => {
      try {
        return await sendClientRequest<TResponse, DeleteMutationVariables>(
          [...mutationKey, id].join('/'),
          {
            method: 'DELETE',
          }
        );
      } catch (e) {
        // Bubble up known FetchError directly so consumers can inspect status, etc.
        if (e instanceof FetchError) throw e;
        throw e as unknown as FetchError;
      }
    },
  });
};

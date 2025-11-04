import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { FetchError, sendClientRequest } from '../clients';

type Options = {
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
};

type UseDatabaseQueryOptions<T = unknown> = {
  queryKey: string[];
  data?: T;
  anonymous?: boolean;
  enabled?: boolean;
  options?: Options;
};

export const useAppQuery = <T = any, D = unknown>({
  queryKey,
  enabled = true,
  data,
  options,
}: UseDatabaseQueryOptions<D>): UseQueryResult<T> => {
  return useQuery({
    queryKey,
    queryFn: () => {
      try {
        return sendClientRequest<T>(queryKey.join('/'), {
          method: 'GET',
          data,
        });
      } catch (e) {
        const handledCodes = [404, 401];
        if (e instanceof FetchError && handledCodes.includes(e.status)) {
          return null as T;
        }
        throw e;
      }
    },
    enabled,
    ...options,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
  });
};

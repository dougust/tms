import fetch from '@kubb/plugin-client/clients/axios';

type Options<T = unknown> = RequestInit & {
  silent?: boolean;
  data?: T;
  method?: 'GET' | 'PUT' | 'POST' | 'DELETE';
};

export class FetchError extends Error {
  constructor(
    public status: number,
    message?: string,
    public description?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

export const sendClientRequest = async <T = any, D = unknown>(
  url: string,
  options: Options<D> = {}
): Promise<T> => {
  try {
    const response = await fetch<T>({
      url,
      method: options.method,
      data: options.data,
    });

    return response.data as T;
  } catch (error: any) {
    // Normalize axios errors to FetchError for downstream consumers
    const status: number = error?.response?.status ?? 0;
    const message: string =
      error?.response?.data?.message || error?.message || 'Request failed';
    throw new FetchError(status, message);
  }
};

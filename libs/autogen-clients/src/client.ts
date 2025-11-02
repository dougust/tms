import fetch, {
  RequestConfig,
  ResponseErrorConfig,
} from '@kubb/plugin-client/clients/axios';

export interface IClientConfig {
  baseURL: string;
}

export const setClientConfig = (config: IClientConfig) => {
  const { baseURL } = config;

  fetch.setConfig({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export type { RequestConfig, ResponseErrorConfig };

export default fetch;

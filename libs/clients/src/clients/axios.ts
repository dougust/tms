import fetch from '@kubb/plugin-client/clients/axios';

export interface IClientConfig {
  baseURL: string;
  accessToken?: string | null;
}

export const setClientConfig = (config: IClientConfig) => {
  const { baseURL, accessToken } = config;

  fetch.setConfig({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

export const setAuthToken = (accessToken?: string | null) => {
  const config = fetch.getConfig();
  fetch.setConfig({
    ...config,
    headers: {
      ...config.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

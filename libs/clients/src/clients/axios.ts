import fetch from '@kubb/plugin-client/clients/axios';

export interface IClientConfig {
  baseURL: string;
  accessToken?: string | null;
}

let _baseURL: string | undefined;

export const setClientConfig = (config: IClientConfig) => {
  const { baseURL, accessToken } = config;
  _baseURL = baseURL;

  fetch.setConfig({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

export const setAuthToken = (accessToken?: string | null) => {
  fetch.setConfig({
    baseURL: _baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

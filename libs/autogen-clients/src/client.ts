import fetch, {
  RequestConfig,
  ResponseErrorConfig,
} from '@kubb/plugin-client/clients/axios';

fetch.setConfig({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export type { RequestConfig, ResponseErrorConfig };

export default fetch;

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setClientConfig } from '@dougust/clients';
import { AppSettingsProvider } from './app-settings-context';
import dynamic from 'next/dynamic';

const RefreshAuthProvider = dynamic(() => import('./refresh-auth.provider'), {
  ssr: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes
      staleTime: 1000 * 60 * 5,
    },
  },
});

// Initialize API client with base URL and any persisted access token
setClientConfig({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  accessToken:
    typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : undefined,
});

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <RefreshAuthProvider>{children}</RefreshAuthProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
};

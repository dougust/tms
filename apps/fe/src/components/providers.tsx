'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setClientConfig } from '@dougust/clients';

const queryClient = new QueryClient();

setClientConfig({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
});

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

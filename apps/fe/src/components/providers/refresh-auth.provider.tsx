import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthControllerRefresh } from '@dougust/clients';
import { useAppSettings } from './app-settings-context';

export default function RefreshAuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { authContext, setSettings } = useAppSettings();

  const tokenExpiryDate = useMemo(() => {
    if (!authContext) return null;
    const payload = JSON.parse(atob(authContext.accessToken.split('.')[1]));
    return payload.exp * 1000;
  }, [authContext]);

  const { mutate } = useAuthControllerRefresh({
    mutation: {
      onSuccess: (data) => {
        setSettings({ authContext: data });
      },
      onError: () => {
        setSettings({ authContext: null });
        router.push('/login');
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  });

  useEffect(() => {
    if (!authContext) {
      router.push('/login');
      setIsLoading(false);
    }
  }, [authContext]);

  React.useEffect(() => {
    if (!tokenExpiryDate || !authContext) return;
    const { refreshToken } = authContext;

    const expiryDuration = tokenExpiryDate - Date.now() - 2 * 60 * 1000;

    if (expiryDuration > 0) {
      setIsLoading(false);
    }

    console.log('Refreshing token in', expiryDuration / 1000, 'seconds');
    const timeout = setTimeout(() => {
      mutate({ data: { refreshToken } });
    }, Math.max(expiryDuration, 0));

    return () => {
      clearInterval(timeout);
    };
  }, [authContext]);

  return <>{isLoading ? <div>Loading...</div> : children}</>;
}

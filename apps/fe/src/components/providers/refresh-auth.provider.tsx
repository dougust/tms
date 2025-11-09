import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponseDto, useAuthControllerRefresh } from '@dougust/clients';
import { getAuthContext, onAuthError, onAuthSuccess } from '../../lib';

export const RefreshAuthProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authResponse, setAuthResponse] = useState<AuthResponseDto | null>(
    getAuthContext()
  );

  const tokenExpiryDate = useMemo(() => {
    if (!authResponse) return null;
    const payload = JSON.parse(atob(authResponse.accessToken.split('.')[1]));
    return payload.exp * 1000;
  }, [authResponse]);

  const { mutate } = useAuthControllerRefresh({
    mutation: {
      onSuccess: (data) => {
        onAuthSuccess(data);
        setAuthResponse(data);
      },
      onError: () => {
        onAuthError();
        router.push('/login');
      },
      onSettled: () => {
        setIsLoading(false);
      },
    },
  });

  useEffect(() => {
    if (!authResponse) {
      router.push('/login');
      setIsLoading(false);
    }
  }, [authResponse]);

  React.useEffect(() => {
    if (!tokenExpiryDate || !authResponse) return;
    const { refreshToken } = authResponse;

    const expiryDuration = tokenExpiryDate - Date.now() - 2 * 60 * 1000;

    const timeout = setTimeout(() => {
      mutate({ data: { refreshToken } });
    }, Math.max(expiryDuration, 0));

    return () => {
      clearInterval(timeout);
    };
  }, [authResponse]);

  return <>{isLoading ? <div>Loading...</div> : children}</>;
};

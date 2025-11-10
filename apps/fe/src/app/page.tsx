'use client';

import { useRouter } from 'next/navigation';
import { useAppSettings } from '../components';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { authContext } = useAppSettings();

  useEffect(() => {
    if (authContext?.accessToken) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}

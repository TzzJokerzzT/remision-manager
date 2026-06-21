'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
import { authUseCases } from '@/src/core/di/container';
import { registerForcedLogoutHandler } from '@/src/core/infrastructure/http/httpClient';
import { tokenStorage } from '@/src/core/infrastructure/storage/tokenStorage';
import { useAuthStore } from '../stores/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clear } = useAuthStore();
  const [isHydrating, setIsHydrating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    registerForcedLogoutHandler(() => {
      clear();
      router.replace('/login');
    });
  }, [clear, router]);

  useEffect(() => {
    async function hydrateSession() {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        clear();
        setIsHydrating(false);
        return;
      }
      try {
        const user = await authUseCases.me();
        setUser(user);
      } catch {
        tokenStorage.clear();
        clear();
      } finally {
        setIsHydrating(false);
      }
    }
    hydrateSession();
  }, [clear, setUser]);

  if (isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

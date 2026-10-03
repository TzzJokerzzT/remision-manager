'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { clearSessionHint, setSessionHint } from '@/src/shared/utils/sessionHint';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function ProtectedShell({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Autocuración: repone la pista de sesión de las sesiones que se iniciaron
      // antes de que existiera, para que `/` las mande directo a `/dashboard`.
      setSessionHint();
      return;
    }

    clearSessionHint();
    router.replace('/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

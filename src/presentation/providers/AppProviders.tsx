'use client';

import { Toast } from '@heroui/react';
import type { ReactNode } from 'react';
import { CustomToast, toastQueue } from '../components/shared/Toast';
import { AuthProvider } from './AuthProvider';
import { MotionProvider } from './MotionProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <QueryProvider>
          <AuthProvider>
            <Toast.Provider placement="bottom end" queue={toastQueue}>
              {({ toast }) => <CustomToast toast={toast} />}
            </Toast.Provider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </MotionProvider>
    </ThemeProvider>
  );
}

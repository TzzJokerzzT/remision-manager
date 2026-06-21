import type { ReactNode } from 'react';
import { ProtectedShell } from '@/src/presentation/components/layout/ProtectedShell';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}

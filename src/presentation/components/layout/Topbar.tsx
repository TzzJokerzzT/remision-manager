'use client';

import { Avatar, Button } from '@heroui/react';
import { LogOut, Menu, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from '@/src/presentation/components/ui/ThemeToggle';
import { useLogout } from '@/src/presentation/features/auth/hooks/useLogout';
import { CompanySelector } from '@/src/presentation/features/companies/components/CompanySelector';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { Sidebar } from './Sidebar';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-default-200 bg-background px-4 sm:px-6">
        <Button
          variant="ghost"
          isIconOnly
          aria-label="Abrir menú"
          className="lg:hidden"
          onPress={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:block">
          <CompanySelector />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 rounded-full pr-2 transition-colors hover:bg-default-100"
          >
            <Avatar className="h-8 w-8">
              <Avatar.Image src={user?.companyLogoUrl ?? undefined} alt={user?.name ?? 'Usuario'} />
              <Avatar.Fallback>
                <UserRound className="h-4 w-4" />
              </Avatar.Fallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">{user?.name}</span>
          </Link>

          <Button
            variant="ghost"
            isIconOnly
            aria-label="Cerrar sesión"
            onPress={() => logoutMutation.mutate()}
            isDisabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="border-b border-default-200 px-4 py-2 sm:hidden">
        <CompanySelector />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 cursor-default bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 h-full shadow-xl">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Cerrar menú"
                onPress={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

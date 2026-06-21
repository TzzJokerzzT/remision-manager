'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, FileText, Truck, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/src/presentation/components/shared/PageHeader';
import { useClients } from '@/src/presentation/features/clients/hooks/useClients';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { useDrivers } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { useRemisiones } from '@/src/presentation/features/remisiones/hooks/useRemisiones';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { useCompanyStore } from '@/src/presentation/stores/company.store';

const cards = [
  { href: '/dashboard/remisiones', label: 'Remisiones', icon: FileText, color: 'bg-warning/10 text-warning' },
  { href: '/dashboard/companies', label: 'Empresas', icon: Building2, color: 'bg-primary/10 text-primary' },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users, color: 'bg-secondary/10 text-secondary' },
  { href: '/dashboard/drivers', label: 'Conductores', icon: Truck, color: 'bg-success/10 text-success' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { selectedCompany } = useCompanyStore();
  const { data: companies } = useCompanies();
  const { data: clients } = useClients(selectedCompany?.id);
  const { data: drivers } = useDrivers(selectedCompany?.id);
  const { data: remisiones } = useRemisiones(selectedCompany?.id);

  const counts = {
    '/dashboard/remisiones': remisiones?.length ?? 0,
    '/dashboard/companies': companies?.length ?? 0,
    '/dashboard/clients': clients?.length ?? 0,
    '/dashboard/drivers': drivers?.length ?? 0,
  } as Record<string, number>;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Hola, ${user?.name?.split(' ')[0] ?? ''} 👋`}
        description="Este es el resumen de tu cuenta"
      />

      {!selectedCompany && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-700 dark:text-warning">
          No tienes una empresa seleccionada. Ve a{' '}
          <Link href="/dashboard/companies" className="font-medium underline">
            Empresas
          </Link>{' '}
          y selecciona una para filtrar clientes y conductores.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={card.href}
                className="group flex flex-col gap-4 rounded-2xl border border-default-200 bg-background p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground/30 transition-transform group-hover:translate-x-1 group-hover:text-foreground/60" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{counts[card.href]}</p>
                  <p className="text-sm text-foreground/60">{card.label}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

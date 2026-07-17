'use client';

import { Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, FileWarning } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo } from 'react';
import { EmptyState } from '@/src/presentation/components/shared/EmptyState';
import { Spinner } from '@/src/presentation/components/shared/Spinner';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { useClients } from '@/src/presentation/features/clients/hooks/useClients';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { useDrivers } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { useRemision } from '../hooks/useRemisiones';

// import { RemisionDocument } from './RemisionDocument';

// PDFSlick toca APIs del navegador (canvas, worker) al cargar: se desactiva SSR.
const RemisionDocument = dynamic(() => import('./RemisionDocument').then((mod) => mod.RemisionDocument), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
});

function ViewerSkeleton() {
  return (
    <div className="border-default-200 bg-default-100 dark:bg-default-50/5 flex h-[70vh] items-center justify-center rounded-2xl border">
      <Spinner />
    </div>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface RemisionDetailProps {
  remisionId: string;
}

export function RemisionDetail({ remisionId }: RemisionDetailProps) {
  const { data: remision, isLoading: isLoadingRemision, error } = useRemision(remisionId);
  const { data: companies } = useCompanies();
  const { data: clients } = useClients(remision?.companyId);
  const { data: drivers } = useDrivers(remision?.companyId);

  const company = useMemo(() => companies?.find((c) => c.id === remision?.companyId), [companies, remision]);
  const client = useMemo(() => clients?.find((c) => c.id === remision?.clientId), [clients, remision]);
  const driver = useMemo(() => drivers?.find((d) => d.id === remision?.driverId), [drivers, remision]);

  if (isLoadingRemision) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!remision) {
    return (
      <EmptyState
        icon={FileWarning}
        title="Remisión no encontrada"
        description="Es posible que haya sido eliminada o que el enlace sea incorrecto."
        action={
          <Link href="/dashboard/remisiones">
            <Button variant="outline" className="mt-2 gap-2">
              <ArrowLeft className="h-4 w-4" /> Volver a remisiones
            </Button>
          </Link>
        }
      />
    );
  }

  const isPriced = remision.type === 'priced';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/remisiones">
            <Button variant="ghost" isIconOnly aria-label="Volver">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Remisión #{String(remision.consecutive).padStart(5, '0')}
            </h1>
            <p className="text-sm text-foreground/60">{formatDate(remision.createdAt)}</p>
          </div>
        </div>
        <Chip
          size="sm"
          className={isPriced ? 'bg-primary/15 text-primary' : 'bg-default-200 text-foreground/70'}
        >
          {isPriced ? 'Con precio + IVA' : 'Solo cantidad'}
        </Chip>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Resumen de datos */}
        <div className="flex flex-col gap-4">
          <div className="border-default-200 rounded-2xl border p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/40 uppercase">Empresa</p>
            <p className="mt-1 font-medium text-foreground">{company?.name ?? '—'}</p>
            <p className="text-xs text-foreground/50">NIT {company?.nit}</p>
          </div>

          <div className="border-default-200 rounded-2xl border p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/40 uppercase">Cliente</p>
            <p className="mt-1 font-medium text-foreground">{client?.name ?? '—'}</p>
            <p className="text-xs text-foreground/50">{client?.documentId}</p>
          </div>

          <div className="border-default-200 rounded-2xl border p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/40 uppercase">Conductor</p>
            <p className="mt-1 font-medium text-foreground">{driver?.name ?? '—'}</p>
            <p className="text-xs text-foreground/50">
              {driver?.documentId} {driver?.vehiclePlate ? `· Placa ${driver.vehiclePlate}` : ''}
            </p>
          </div>

          <div className="border-default-200 rounded-2xl border p-4">
            <p className="text-xs font-medium tracking-wide text-foreground/40 uppercase">Ítems</p>
            <ul className="mt-2 flex flex-col gap-2">
              {remision.items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: los ítems de la remisión no tienen id propio
                <li key={`${item.description}-${index}`} className="flex justify-between gap-2 text-sm">
                  <span className="text-foreground/80">
                    {item.quantity}× {item.description}
                  </span>
                  {isPriced && (
                    <span className="shrink-0 text-foreground/60">
                      {formatCurrency((item.unitPrice ?? 0) * item.quantity)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {isPriced && (
              <div className="border-default-200 mt-3 flex flex-col gap-1 border-t pt-3 text-sm">
                <div className="flex justify-between text-foreground/60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(remision.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span>IVA ({remision.ivaPercentage ?? 0}%)</span>
                  <span>{formatCurrency(remision.ivaValue ?? 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatCurrency(remision.total ?? 0)}</span>
                </div>
              </div>
            )}
          </div>

          {remision.notes && (
            <div className="border-default-200 rounded-2xl border p-4">
              <p className="text-xs font-medium tracking-wide text-foreground/40 uppercase">Notas</p>
              <p className="mt-1 text-sm text-foreground/80">{remision.notes}</p>
            </div>
          )}
        </div>

        {/* Visor PDF */}
        <div className="flex flex-col gap-3">
          {error ? (
            <EmptyState icon={FileWarning} title="No se pudo generar el PDF" description={error.message} />
          ) : isLoadingRemision ? (
            <ViewerSkeleton />
          ) : (
            <>
              <RemisionDocument remision={remision} company={company} client={client} driver={driver} />
              <p className="flex items-center gap-1.5 text-xs text-foreground/40">
                <ExternalLink className="h-3 w-3" /> El PDF se genera en tu navegador a partir de los datos de
                la remisión, usando PDFSlick para la vista previa.
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

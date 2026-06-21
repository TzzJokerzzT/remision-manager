'use client';

import { Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Pencil, Trash2, Truck, User } from 'lucide-react';
import Link from 'next/link';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import { listItemVariants } from '@/src/presentation/components/shared/AnimatedList';

interface RemisionCardProps {
  remision: Remision;
  client?: Client;
  driver?: Driver;
  onEdit: () => void;
  onDelete: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function RemisionCard({ remision, client, driver, onEdit, onDelete }: RemisionCardProps) {
  const isPriced = remision.type === 'priced';

  return (
    <motion.div
      layout
      variants={listItemVariants}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col gap-3 rounded-2xl border border-default-200 bg-background p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground/40">
            Remisión #{remision.consecutive}
          </p>
          <h3 className="mt-0.5 font-medium text-foreground">{client?.name ?? 'Cliente'}</h3>
        </div>
        <Chip
          size="sm"
          className={isPriced ? 'bg-primary/15 text-primary' : 'bg-default-200 text-foreground/70'}
        >
          {isPriced ? 'Con precio + IVA' : 'Solo cantidad'}
        </Chip>
      </div>

      <div className="flex flex-col gap-1 text-xs text-foreground/60">
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> {client?.name ?? '—'}
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" /> {driver?.name ?? '—'}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" /> {formatDate(remision.createdAt)}
        </span>
      </div>

      <div className="rounded-lg bg-default-100 px-3 py-2 text-xs text-foreground/60 dark:bg-default-50/10">
        {remision.items.length} ítem{remision.items.length !== 1 ? 's' : ''}
        {isPriced && typeof remision.total === 'number' && (
          <span className="ml-1 font-semibold text-foreground">· {formatCurrency(remision.total)}</span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <Link href={`/dashboard/remisiones/${remision.id}`} className="flex-1">
          <Button size="sm" variant="primary" fullWidth>
            <FileText className="h-3.5 w-3.5" /> Ver / Imprimir
          </Button>
        </Link>
        <Button size="sm" variant="outline" isIconOnly aria-label="Editar" onPress={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          aria-label="Eliminar remisión"
          className="text-danger hover:bg-danger/10"
          onPress={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

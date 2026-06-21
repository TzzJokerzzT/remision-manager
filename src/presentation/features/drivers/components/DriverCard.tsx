'use client';

import { Avatar, Button, Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { IdCard, Pencil, Phone, Trash2, Truck } from 'lucide-react';
import type { Driver } from '@/src/core/domain/entities/Driver';
import { listItemVariants } from '@/src/presentation/components/shared/AnimatedList';

interface DriverCardProps {
  driver: Driver;
  onEdit: () => void;
  onDelete: () => void;
}

export function DriverCard({ driver, onEdit, onDelete }: DriverCardProps) {
  return (
    <motion.div
      layout
      variants={listItemVariants}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col gap-3 rounded-2xl border border-default-200 bg-background p-4"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 shrink-0 bg-warning/15 text-warning">
          <Truck className="h-5 w-5" />
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-foreground">{driver.name}</h3>
          <p className="flex items-center gap-1 text-xs text-foreground/50">
            <IdCard className="h-3 w-3" /> {driver.documentId}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/60">
        {driver.vehiclePlate && (
          <Chip size="sm" className="bg-default-100 text-foreground/70">
            {driver.vehiclePlate}
          </Chip>
        )}
        {driver.licenseNumber && (
          <Chip size="sm" className="bg-default-100 text-foreground/70">
            Lic. {driver.licenseNumber}
          </Chip>
        )}
      </div>

      {driver.phone && (
        <span className="flex items-center gap-1.5 text-xs text-foreground/60">
          <Phone className="h-3.5 w-3.5" /> {driver.phone}
        </span>
      )}

      <div className="mt-1 flex items-center gap-2">
        <Button size="sm" variant="outline" fullWidth onPress={onEdit} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          aria-label="Eliminar"
          className="text-danger hover:bg-danger/10"
          onPress={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

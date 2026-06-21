'use client';

import { Avatar, Button } from '@heroui/react';
import { motion } from 'framer-motion';
import { IdCard, Mail, Pencil, Phone, Trash2, User } from 'lucide-react';
import type { Client } from '@/src/core/domain/entities/Client';
import { listItemVariants } from '@/src/presentation/components/shared/AnimatedList';

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  return (
    <motion.div
      layout
      variants={listItemVariants}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex flex-col gap-3 rounded-2xl border border-default-200 bg-background p-4"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11 shrink-0 bg-secondary/15 text-secondary">
          <User className="h-5 w-5" />
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate font-medium text-foreground">{client.name}</h3>
          <p className="flex items-center gap-1 text-xs text-foreground/50">
            <IdCard className="h-3 w-3" /> {client.documentId}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-xs text-foreground/60">
        {client.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> {client.phone}
          </span>
        )}
        {client.email && (
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {client.email}
          </span>
        )}
      </div>

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

'use client';

import { Avatar, Button, Chip } from '@heroui/react';
import { m } from 'framer-motion';
import { Building2, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import type { Company } from '@/src/core/domain/entities/Company';
import { listItemVariants } from '@/src/presentation/components/shared/AnimatedList';
import { useCompanyStore } from '@/src/presentation/stores/company.store';
import { cloudinaryImageUrl } from '@/src/shared/utils/cloudinary';

// El avatar se muestra a 44px (h-11): 96px cubre pantallas 2x sin traer el original.
const AVATAR_IMAGE = { width: 96, height: 96, crop: 'fill' } as const;

interface CompanyCardProps {
  company: Company;
  onEdit: () => void;
  onDelete: () => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  const { selectedCompany, setSelectedCompany } = useCompanyStore();
  const isSelected = selectedCompany?.id === company.id;

  return (
    <m.div
      layout
      variants={listItemVariants}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-default-200 bg-background'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <Avatar.Image src={cloudinaryImageUrl(company.logoUrl, AVATAR_IMAGE)} alt={company.name} />
            <Avatar.Fallback>
              <Building2 className="h-5 w-5" />
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-foreground">{company.name}</h3>
            <p className="text-xs text-foreground/50">NIT {company.nit}</p>
          </div>
        </div>
        {isSelected && (
          <Chip size="sm" className="bg-primary/15 text-primary">
            Activa
          </Chip>
        )}
      </div>

      <div className="flex flex-col gap-1 text-xs text-foreground/60">
        {company.phone && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> {company.phone}
          </span>
        )}
        {company.email && (
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {company.email}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <Button
          size="sm"
          variant={isSelected ? 'primary' : 'outline'}
          fullWidth
          onPress={() => setSelectedCompany(isSelected ? null : company)}
        >
          {isSelected ? 'Seleccionada' : 'Seleccionar'}
        </Button>
        <Button size="sm" variant="ghost" isIconOnly aria-label="Editar" onPress={onEdit}>
          <Pencil className="h-4 w-4" />
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
    </m.div>
  );
}

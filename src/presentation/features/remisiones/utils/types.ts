import type { RemisionFormValues } from '@/src/core/application/dtos/remision.dto';
import type { Client } from '@/src/core/domain/entities/Client';
import type { Company } from '@/src/core/domain/entities/Company';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type { Remision } from '@/src/core/domain/entities/Remision';
import type { DOCUMENT_CONFIG } from './constant';

// ===============================================
// RemisionCardProps Props
// ===============================================

export interface RemisionCardProps {
  remision: Remision;
  client?: Client;
  driver?: Driver;
  onEdit: () => void;
  onDelete: () => void;
}

// ===============================================
// RemisionCardProps Props
// ===============================================

export interface RemisionFormProps {
  companyId: string;
  defaultValues?: Partial<RemisionFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  onSubmit: (values: RemisionFormValues) => void;
}

// ===============================================
// RemisionDetailsProps Props
// ===============================================

export interface RemisionDetailProps {
  remisionId: string;
}

// ===============================================
// RemisionDocumentProps Props
// ===============================================

export interface RemisionDocumentProps {
  remision: Remision;
  company: Company;
  client: Client;
  driver?: Driver;
}

export type DocumentType = keyof typeof DOCUMENT_CONFIG;

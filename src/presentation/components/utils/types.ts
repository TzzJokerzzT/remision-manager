// ===============================================
// AppSelect Props
// ===============================================

import type { Input, UseOverlayStateReturn } from '@heroui/react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

export interface AppSelectOption {
  id: string;
  label: string;
}

export interface AppSelectProps {
  label?: string;
  placeholder?: string;
  options: AppSelectOption[];
  selectedKey: string | null;
  onSelectionChange: (key: string | null) => void;
  isInvalid?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// ===============================================
// ConfirmDialog Props
// ===============================================

export interface ConfirmDialogProps {
  state: UseOverlayStateReturn;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
}

// ===============================================
// Dropzone Props
// ===============================================

export interface DropzoneProps {
  /** URL actual (por ejemplo el logoUrl ya guardado del cliente/empresa). */
  value?: string | null;
  /** Se llama con la nueva URL al subir, o null al quitar la imagen. */
  onChange: (url: string | null) => void;
  label?: string;
  helperText?: string;
  /** Mensaje de error de validación del formulario (Zod/RHF). */
  error?: string;
  /** Tipos MIME aceptados, separados por coma. Default: imágenes comunes. */
  accept?: string;
  maxSizeMB?: number;
  /** Carpeta en Cloudinary (requiere que el upload preset lo permita). */
  folder?: string;
  disabled?: boolean;
}

// ===============================================
// FormField Props
// ===============================================

export interface FormFieldProps extends Omit<ComponentProps<typeof Input>, 'className'> {
  label: string;
  error?: string;
}

// ===============================================
// FormModal Props
// ===============================================

export interface FormModalProps {
  state: UseOverlayStateReturn;
  title: string;
  description?: string;
  children: ReactNode;
}

// ===============================================
// AnimatedList Props
// ===============================================

export interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

// ===============================================
// EmptyState Props
// ===============================================

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

// ===============================================
// PageHeader Props
// ===============================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

// ===============================================
// PageHeader Props
// ===============================================

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder?: string;
}

// ===============================================
// PageHeader Props
// ===============================================

export interface SidebarProps {
  onNavigate?: () => void;
}

import type { ClientFormValues } from '@/src/core/application/dtos/client.dto';

export interface ClientFormProps {
  defaultValues?: Partial<ClientFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  lockCompany?: boolean;
  onSubmit: (values: ClientFormValues) => void;
}

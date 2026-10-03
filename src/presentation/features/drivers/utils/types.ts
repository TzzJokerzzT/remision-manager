import type { DriverFormValues } from '@/src/core/application/dtos/driver.dto';

export interface DriverFormProps {
  defaultValues?: Partial<DriverFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  lockCompany?: boolean;
  onSubmit: (values: DriverFormValues) => void;
}

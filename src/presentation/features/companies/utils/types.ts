import type { CompanyFormValues } from '@/src/core/application/dtos/company.dto';

export interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  onSubmit: (values: CompanyFormValues) => void;
}

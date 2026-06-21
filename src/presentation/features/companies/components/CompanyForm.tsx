'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type CompanyFormValues, companySchema } from '@/src/core/application/dtos/company.dto';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  onSubmit: (values: CompanyFormValues) => void;
}

export function CompanyForm({
  defaultValues,
  isSubmitting,
  submitError,
  submitLabel,
  onSubmit,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Nombre de la empresa"
          placeholder="Mi Empresa S.A.S"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField label="NIT" placeholder="900123456-7" error={errors.nit?.message} {...register('nit')} />
      </div>
      <FormField
        label="Dirección"
        placeholder="Calle 10 # 5-23"
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Teléfono"
          placeholder="3001234567"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <FormField
          label="Email"
          type="email"
          placeholder="contacto@empresa.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <FormField
        label="URL del logo (opcional)"
        placeholder="https://miempresa.com/logo.png"
        error={errors.logoUrl?.message}
        {...register('logoUrl')}
      />

      {submitError ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(submitError, 'No se pudo guardar la empresa')}
        </p>
      ) : null}

      <Button type="submit" fullWidth isDisabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}

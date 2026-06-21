'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { type ClientFormValues, clientSchema } from '@/src/core/application/dtos/client.dto';
import { AppSelect } from '@/src/presentation/components/ui/AppSelect';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';

interface ClientFormProps {
  defaultValues?: Partial<ClientFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  lockCompany?: boolean;
  onSubmit: (values: ClientFormValues) => void;
}

export function ClientForm({
  defaultValues,
  isSubmitting,
  submitError,
  submitLabel,
  lockCompany,
  onSubmit,
}: ClientFormProps) {
  const { data: companies } = useCompanies();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  });

  const companyOptions = (companies ?? []).map((c) => ({ id: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="companyId"
        control={control}
        render={({ field }) => (
          <AppSelect
            label="Empresa"
            options={companyOptions}
            selectedKey={field.value || null}
            onSelectionChange={(key) => field.onChange(key ?? '')}
            isInvalid={!!errors.companyId}
            errorMessage={errors.companyId?.message}
            isDisabled={lockCompany}
          />
        )}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Nombre"
          placeholder="Nombre del cliente"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField
          label="Documento"
          placeholder="C.C / NIT"
          error={errors.documentId?.message}
          {...register('documentId')}
        />
      </div>
      <FormField
        label="Dirección"
        placeholder="Dirección"
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
          placeholder="cliente@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {submitError ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(submitError, 'No se pudo guardar el cliente')}
        </p>
      ) : null}

      <Button type="submit" fullWidth isDisabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}

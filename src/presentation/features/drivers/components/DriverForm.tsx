'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { type DriverFormValues, driverSchema } from '@/src/core/application/dtos/driver.dto';
import { AppSelect } from '@/src/presentation/components/ui/AppSelect';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { useCompanies } from '@/src/presentation/features/companies/hooks/useCompanies';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';

interface DriverFormProps {
  defaultValues?: Partial<DriverFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  lockCompany?: boolean;
  onSubmit: (values: DriverFormValues) => void;
}

export function DriverForm({
  defaultValues,
  isSubmitting,
  submitError,
  submitLabel,
  lockCompany,
  onSubmit,
}: DriverFormProps) {
  const { data: companies } = useCompanies();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
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
          placeholder="Nombre del conductor"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField
          label="Documento"
          placeholder="C.C"
          error={errors.documentId?.message}
          {...register('documentId')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="N° Licencia"
          placeholder="Licencia de conducción"
          error={errors.licenseNumber?.message}
          {...register('licenseNumber')}
        />
        <FormField
          label="Placa del vehículo"
          placeholder="ABC123"
          error={errors.vehiclePlate?.message}
          {...register('vehiclePlate')}
        />
      </div>
      <FormField
        label="Teléfono"
        placeholder="3001234567"
        error={errors.phone?.message}
        {...register('phone')}
      />

      {submitError ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(submitError, 'No se pudo guardar el conductor')}
        </p>
      ) : null}

      <Button type="submit" fullWidth isDisabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}

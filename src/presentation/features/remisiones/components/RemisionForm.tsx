'use client';

import { Button, Switch } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { type RemisionFormValues, remisionSchema } from '@/src/core/application/dtos/remision.dto';
import { AppSelect } from '@/src/presentation/components/ui/AppSelect';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { useClients } from '@/src/presentation/features/clients/hooks/useClients';
import { useDrivers } from '@/src/presentation/features/drivers/hooks/useDrivers';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';
import { computeRemisionTotals } from '@/src/shared/utils/remisionTotals';

const typeOptions = [
  { id: 'priced', label: 'Con precio e IVA' },
  { id: 'quantity_only', label: 'Solo cantidad' },
];

const documentTypeOptions = [
  { id: 'remision', label: 'Remisión' },
  { id: 'orden_compra', label: 'Orden de compra' },
];

interface RemisionFormProps {
  companyId: string;
  defaultValues?: Partial<RemisionFormValues>;
  isSubmitting?: boolean;
  submitError?: unknown;
  submitLabel: string;
  onSubmit: (values: RemisionFormValues) => void;
}

export function RemisionForm({
  companyId,
  defaultValues,
  isSubmitting,
  submitError,
  submitLabel,
  onSubmit,
}: RemisionFormProps) {
  const { data: clients } = useClients(companyId);
  const { data: drivers } = useDrivers(companyId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof remisionSchema>, unknown, RemisionFormValues>({
    resolver: zodResolver(remisionSchema),
    defaultValues: {
      type: 'priced',
      companyId,
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      ivaPercentage: 19,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const handleRetencionChange = (isSelected: boolean) => setValue('hasRetencion', isSelected === true);

  const watchedType = watch('type');
  const watchedItems = watch('items');
  const watchedIva = watch('ivaPercentage');
  const watchedHasRetencion = watch('hasRetencion');
  const watchedRetencionPct = watch('retencionPercentage');
  const isPriced = watchedType === 'priced';

  const totals = computeRemisionTotals(
    watchedItems ?? [],
    watchedType,
    watchedIva,
    watchedHasRetencion,
    watchedRetencionPct
  );

  const clientOptions = (clients?.items ?? []).map((c) => ({ id: c.id, label: c.name }));
  const driverOptions = (drivers?.items ?? []).map((d) => ({ id: d.id, label: d.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <AppSelect
              label="Tipo de remisión"
              options={typeOptions}
              selectedKey={field.value}
              onSelectionChange={(key) => {
                if (!key) return;
                field.onChange(key);
                if (key === 'quantity_only') {
                  setValue('hasRetencion', false);
                }
              }}
              isInvalid={!!errors.type}
              errorMessage={errors.type?.message}
            />
          )}
        />
        <Controller
          name="documentType"
          control={control}
          render={({ field }) => (
            <AppSelect
              label="Tipo de documento"
              options={documentTypeOptions}
              selectedKey={field.value ?? null}
              onSelectionChange={(key) => key && field.onChange(key)}
              isInvalid={!!errors.documentType}
              errorMessage={errors.documentType?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          name="clientId"
          control={control}
          render={({ field }) => (
            <AppSelect
              label="Cliente"
              placeholder={clientOptions.length ? 'Selecciona un cliente' : 'No hay clientes en esta empresa'}
              options={clientOptions}
              selectedKey={field.value || null}
              onSelectionChange={(key) => field.onChange(key ?? '')}
              isInvalid={!!errors.clientId}
              errorMessage={errors.clientId?.message}
              isDisabled={clientOptions.length === 0}
            />
          )}
        />
        <Controller
          name="driverId"
          control={control}
          render={({ field }) => (
            <AppSelect
              label="Conductor"
              placeholder={
                driverOptions.length ? 'Selecciona un conductor' : 'No hay conductores en esta empresa'
              }
              options={driverOptions}
              selectedKey={field.value || null}
              onSelectionChange={(key) => field.onChange(key ?? '')}
              isInvalid={!!errors.driverId}
              errorMessage={errors.driverId?.message}
              isDisabled={driverOptions.length === 0}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/80">Ítems</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onPress={() => append({ description: '', quantity: 1, unitPrice: 0 })}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar ítem
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 rounded-xl border border-default-200 p-3 sm:grid-cols-[1fr_110px_110px_44px] sm:items-end"
            >
              <FormField
                label="Descripción"
                placeholder="Producto o servicio"
                error={errors.items?.[index]?.description?.message}
                {...register(`items.${index}.description` as const)}
              />
              <FormField
                label="Cantidad"
                type="number"
                step="any"
                placeholder="1"
                error={errors.items?.[index]?.quantity?.message}
                {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
              />
              {isPriced && (
                <FormField
                  label="Precio unitario"
                  type="number"
                  step="any"
                  placeholder="0"
                  error={errors.items?.[index]?.unitPrice?.message}
                  {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                />
              )}
              <div className="flex items-end">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  isIconOnly
                  aria-label="Eliminar ítem"
                  isDisabled={fields.length === 1}
                  className="text-danger hover:bg-danger/10"
                  onPress={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errors.items?.root?.message && (
          <span className="text-xs text-danger">{errors.items.root.message}</span>
        )}
        {errors.items?.message && <span className="text-xs text-danger">{errors.items.message}</span>}
      </div>

      {isPriced && (
        <FormField
          label="IVA (%)"
          type="number"
          step="any"
          placeholder="19"
          error={errors.ivaPercentage?.message}
          {...register('ivaPercentage', { valueAsNumber: true })}
        />
      )}

      {isPriced && (
        <div className="flex flex-col gap-3">
          <Controller
            name="hasRetencion"
            control={control}
            render={({ field }) => (
              <Switch isSelected={field.value === true} onChange={handleRetencionChange}>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <span>Retención en la fuente</span>
                </Switch.Content>
              </Switch>
            )}
          />
          {watchedHasRetencion && (
            <FormField
              label="Retención (%)"
              type="number"
              step="any"
              placeholder="0"
              error={errors.retencionPercentage?.message}
              {...register('retencionPercentage', { valueAsNumber: true })}
            />
          )}
        </div>
      )}

      <FormField
        label="Notas (opcional)"
        placeholder="Observaciones de la remisión"
        error={errors.notes?.message}
        {...register('notes')}
      />

      {isPriced && (
        <div className="flex flex-col gap-1 rounded-xl bg-default-100 p-4 text-sm dark:bg-default-50/10">
          <div className="flex justify-between text-foreground/70">
            <span>Subtotal</span>
            <span>{totals.subtotal?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
          <div className="flex justify-between text-foreground/70">
            <span>IVA ({watchedIva || 0}%)</span>
            <span>{totals.ivaValue?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
          {totals.retencionValue !== undefined && (
            <div className="flex justify-between text-foreground/70">
              <span>Retención ({watchedRetencionPct ?? 0}%)</span>
              <span>
                -{totals.retencionValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-default-200 pt-1 font-semibold text-foreground">
            <span>Total</span>
            <span>{totals.total?.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
          </div>
        </div>
      )}

      {submitError ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(submitError, 'No se pudo guardar la remisión')}
        </p>
      ) : null}

      <Button
        type="submit"
        fullWidth
        isDisabled={isSubmitting}
        className="mt-2 self-start bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
      >
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}

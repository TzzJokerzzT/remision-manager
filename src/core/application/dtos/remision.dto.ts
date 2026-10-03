import { z } from 'zod';

export const remisionItemSchema = z.object({
  description: z.string().trim().min(1, 'Requerido').max(250),
  quantity: z.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'No puede ser negativo').optional(),
});
export type RemisionItemFormValues = z.infer<typeof remisionItemSchema>;

export const remisionSchema = z
  .object({
    type: z.enum(['priced', 'quantity_only']),
    documentType: z.enum(['remision', 'orden_compra']).default('remision'),
    companyId: z.string().min(1, 'Selecciona una empresa'),
    clientId: z.string().min(1, 'Selecciona un cliente'),
    driverId: z.string().optional().or(z.literal('')),
    items: z.array(remisionItemSchema).min(1, 'Agrega al menos un ítem'),
    ivaPercentage: z.number().min(0).max(100).optional(),
    hasRetencion: z.boolean().default(false),
    retencionPercentage: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100').optional(),
    notes: z.string().trim().max(500).optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      data.type !== 'priced' ||
      data.items.every((item) => typeof item.unitPrice === 'number' && !Number.isNaN(item.unitPrice)),
    {
      message: 'Cada ítem debe tener un precio unitario cuando la remisión es con precio e IVA',
      path: ['items'],
    }
  )
  .refine(
    (data) => data.hasRetencion !== true || data.type !== 'priced' || data.retencionPercentage !== undefined,
    {
      message: 'Ingresa el porcentaje de retención',
      path: ['retencionPercentage'],
    }
  )
  .refine((data) => data.type !== 'quantity_only' || data.hasRetencion === false, {
    message: 'La retención solo aplica a remisiones con precio',
    path: ['hasRetencion'],
  });
export type RemisionFormValues = z.infer<typeof remisionSchema>;

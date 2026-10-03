import { z } from 'zod';

/**
 * Ítem de remisión. El IVA es **por producto**, no global: cada ítem declara si está gravado
 * (`hasIva`) y con qué tasa (`ivaPercentage`). `ivaValue` es derivado y lo calcula el backend.
 *
 * Las dos reglas de coherencia espejan las del backend (`refineItemIva` en su `remision.dto`):
 * con `hasIva` en true la tasa es obligatoria y mayor a 0; con `hasIva` en false la tasa debe
 * estar ausente o ser 0.
 */
export const remisionItemSchema = z.object({
  description: z.string().trim().min(1, 'Requerido').max(250),
  quantity: z.number({ message: 'Requerido' }).positive('Debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'No puede ser negativo').optional(),
  hasIva: z.boolean(),
  ivaPercentage: z.number().min(0, 'No puede ser negativo').max(100, 'Máximo 100').optional(),
});
export type RemisionItemFormValues = z.infer<typeof remisionItemSchema>;

function refineItemIva(
  data: { items?: Array<{ hasIva: boolean; ivaPercentage?: number }> },
  ctx: z.RefinementCtx
) {
  data.items?.forEach((item, index) => {
    if (item.hasIva === true && (item.ivaPercentage === undefined || item.ivaPercentage <= 0)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresa el porcentaje de IVA',
        path: ['items', index, 'ivaPercentage'],
      });
    }

    if (item.hasIva === false && item.ivaPercentage !== undefined && item.ivaPercentage > 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Un producto exento no puede tener IVA',
        path: ['items', index, 'ivaPercentage'],
      });
    }
  });
}

export const remisionSchema = z
  .object({
    type: z.enum(['priced', 'quantity_only']),
    documentType: z.enum(['remision', 'orden_compra']).default('remision'),
    companyId: z.string().min(1, 'Selecciona una empresa'),
    clientId: z.string().min(1, 'Selecciona un cliente'),
    driverId: z.string().optional().or(z.literal('')),
    items: z.array(remisionItemSchema).min(1, 'Agrega al menos un ítem'),
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
  })
  .superRefine(refineItemIva);
export type RemisionFormValues = z.infer<typeof remisionSchema>;

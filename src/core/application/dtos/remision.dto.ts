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
    companyId: z.string().min(1, 'Selecciona una empresa'),
    clientId: z.string().min(1, 'Selecciona un cliente'),
    driverId: z.string().min(1, 'Selecciona un conductor'),
    items: z.array(remisionItemSchema).min(1, 'Agrega al menos un ítem'),
    ivaPercentage: z.number().min(0).max(100).optional(),
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
  );
export type RemisionFormValues = z.infer<typeof remisionSchema>;

import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(150),
  documentId: z.string().trim().min(3, 'Mínimo 3 caracteres').max(30),
  companyId: z.string().min(1, 'Selecciona una empresa'),
  address: z.string().trim().max(250).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Email inválido').max(200).optional().or(z.literal('')),
});
export type ClientFormValues = z.infer<typeof clientSchema>;

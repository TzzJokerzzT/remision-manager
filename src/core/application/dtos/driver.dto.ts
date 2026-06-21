import { z } from 'zod';

export const driverSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(150),
  documentId: z.string().trim().min(3, 'Mínimo 3 caracteres').max(30),
  companyId: z.string().min(1, 'Selecciona una empresa'),
  licenseNumber: z.string().trim().max(30).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  vehiclePlate: z.string().trim().max(15).optional().or(z.literal('')),
});
export type DriverFormValues = z.infer<typeof driverSchema>;

import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(150),
  nit: z.string().trim().min(3, 'Mínimo 3 caracteres').max(30),
  address: z.string().trim().max(250).optional().or(z.literal('')),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  email: z.string().trim().email('Email inválido').max(200).optional().or(z.literal('')),
  logoUrl: z.string().trim().url('URL inválida').max(500).optional().or(z.literal('')),
});
export type CompanyFormValues = z.infer<typeof companySchema>;

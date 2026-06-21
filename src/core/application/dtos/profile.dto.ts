import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
  companyLogoUrl: z.string().trim().url('URL inválida').max(500).optional().or(z.literal('')),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

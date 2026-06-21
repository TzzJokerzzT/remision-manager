import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
    email: z.string().trim().email('Email inválido').max(200),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(100)
      .regex(/[A-Z]/, 'Debe incluir una mayúscula')
      .regex(/[a-z]/, 'Debe incluir una minúscula')
      .regex(/[0-9]/, 'Debe incluir un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

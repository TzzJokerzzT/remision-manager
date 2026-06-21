'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { type RegisterFormValues, registerSchema } from '@/src/core/application/dtos/auth.dto';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';
import { useRegister } from '../hooks/useRegister';

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const registerMutation = useRegister();

  const onSubmit = (values: RegisterFormValues) => {
    const { confirmPassword: _confirmPassword, ...payload } = values;
    registerMutation.mutate(payload);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4"
    >
      <FormField
        label="Nombre completo"
        placeholder="Juan Pérez"
        error={errors.name?.message}
        {...register('name')}
      />
      <FormField
        label="Correo electrónico"
        type="email"
        placeholder="tucorreo@empresa.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        {...register('password')}
      />
      <FormField
        label="Confirmar contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {registerMutation.isError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(registerMutation.error, 'No se pudo completar el registro')}
        </p>
      )}

      <Button type="submit" fullWidth isDisabled={registerMutation.isPending} className="mt-2">
        {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>

      <p className="text-center text-sm text-foreground/60">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </motion.form>
  );
}

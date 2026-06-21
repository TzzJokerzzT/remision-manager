'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { type LoginFormValues, loginSchema } from '@/src/core/application/dtos/auth.dto';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useLogin();

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
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
        label="Correo electrónico"
        type="email"
        placeholder="tucorreo@empresa.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <FormField
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      {loginMutation.isError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {getErrorMessage(loginMutation.error, 'No se pudo iniciar sesión')}
        </p>
      )}

      <Button type="submit" fullWidth isDisabled={loginMutation.isPending} className="mt-2">
        {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
      </Button>

      <p className="text-center text-sm text-foreground/60">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </motion.form>
  );
}

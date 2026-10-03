'use client';

import { Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { type LoginFormValues, loginSchema } from '@/src/core/application/dtos/auth.dto';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useLogin();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // Una sesión ya iniciada no tiene nada que hacer en el formulario de acceso.
  // También cubre las sesiones previas a la pista de sesión, que llegan acá una vez.
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <m.form
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

      <Button
        type="submit"
        fullWidth
        isDisabled={loginMutation.isPending}
        className="mt-2 self-start bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
      >
        {loginMutation.isPending ? 'Ingresando...' : 'Ingresar'}
      </Button>

      <p className="text-center text-sm text-foreground/60">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </m.form>
  );
}

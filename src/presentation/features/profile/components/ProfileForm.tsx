'use client';

import { Avatar, Button, Chip } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { type ProfileFormValues, profileSchema } from '@/src/core/application/dtos/profile.dto';
import { Dropzone } from '@/src/presentation/components/ui/Dropzone';
import { FormField } from '@/src/presentation/components/ui/FormField';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { getErrorMessage } from '@/src/shared/utils/getErrorMessage';
import { useUpdateProfile } from '../hooks/useProfile';

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      companyLogoUrl: user?.companyLogoUrl ?? '',
    },
  });

  const previewLogo = watch('companyLogoUrl');

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate({
      name: values.name,
      companyLogoUrl: values.companyLogoUrl || null,
    });
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-xl flex-col gap-6"
    >
      <div className="flex items-center gap-4 rounded-2xl border border-default-200 p-4">
        <Avatar className="h-16 w-16">
          <Avatar.Image src={previewLogo || undefined} alt={user.name} />
          <Avatar.Fallback>
            <UserRound className="h-7 w-7" />
          </Avatar.Fallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{user.name}</p>
          <p className="text-sm text-foreground/60">{user.email}</p>
          <Chip size="sm" className="mt-1 bg-primary/10 text-primary capitalize">
            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </Chip>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Nombre completo" error={errors.name?.message} {...register('name')} />

        <Controller
          name="companyLogoUrl"
          control={control}
          render={({ field }) => (
            <Dropzone
              label="Logo de la empresa (opcional)"
              value={field.value}
              onChange={(url) => field.onChange(url ?? '')}
              error={errors.companyLogoUrl?.message}
              helperText="PNG, JPG o WEBP. Máx 5MB."
              folder="remision-manager/profiles"
            />
          )}
        />

        {updateProfile.isError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {getErrorMessage(updateProfile.error, 'No se pudo actualizar el perfil')}
          </p>
        )}
        {updateProfile.isSuccess && (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            Perfil actualizado correctamente
          </p>
        )}

        <Button
          type="submit"
          isDisabled={updateProfile.isPending}
          className="mt-2 self-start bg-primary gap-2 transition-color duration-300 ease-in-out hover:bg-primary/70"
        >
          {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </form>
    </motion.div>
  );
}

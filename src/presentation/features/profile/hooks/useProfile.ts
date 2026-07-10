import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userUseCases } from '@/src/core/di/container';
import type { UpdateUserPayload } from '@/src/core/domain/repositories/IUserRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { queryKeys } from '@/src/shared/constants/queryKeys';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => {
      if (!user) throw new Error('No hay usuario autenticado');
      return userUseCases.update(user.id, payload);
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      showToast('Usuario actualizado exitosamente', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Error al actualizar el usuario', 'error');
    },
  });
}

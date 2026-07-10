import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { authUseCases } from '@/src/core/di/container';
import type { RegisterPayload } from '@/src/core/domain/repositories/IAuthRepository';
import { showToast } from '@/src/presentation/components/shared/Toast';

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authUseCases.register(payload),
    onSuccess: ({ message }) => {
      router.replace('/login');
      showToast(message, 'success');
    },
    onError: (error) => {
      const msg =
        (isAxiosError(error) && (error.response?.data as { message?: string })?.message) ||
        (error as Error).message;
      showToast(msg, 'error');
    },
  });
}

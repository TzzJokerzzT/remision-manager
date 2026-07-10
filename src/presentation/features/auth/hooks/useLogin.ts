import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { authUseCases } from '@/src/core/di/container';
import type { LoginPayload } from '@/src/core/domain/repositories/IAuthRepository';
import { tokenStorage } from '@/src/core/infrastructure/storage/tokenStorage';
import { showToast } from '@/src/presentation/components/shared/Toast';
import { useAuthStore } from '@/src/presentation/stores/auth.store';

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authUseCases.login(payload),
    onSuccess: ({ user, tokens, message }) => {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      router.replace('/dashboard');
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

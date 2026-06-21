import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authUseCases } from '@/src/core/di/container';
import type { LoginPayload } from '@/src/core/domain/repositories/IAuthRepository';
import { tokenStorage } from '@/src/core/infrastructure/storage/tokenStorage';
import { useAuthStore } from '@/src/presentation/stores/auth.store';

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authUseCases.login(payload),
    onSuccess: ({ user, tokens }) => {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(user);
      router.replace('/dashboard');
    },
  });
}

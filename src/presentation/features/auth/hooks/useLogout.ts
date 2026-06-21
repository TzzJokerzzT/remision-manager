import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authUseCases } from '@/src/core/di/container';
import { tokenStorage } from '@/src/core/infrastructure/storage/tokenStorage';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { useCompanyStore } from '@/src/presentation/stores/company.store';

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const setSelectedCompany = useCompanyStore((s) => s.setSelectedCompany);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authUseCases.logout(),
    onSettled: () => {
      tokenStorage.clear();
      clear();
      setSelectedCompany(null);
      queryClient.clear();
      router.replace('/login');
    },
  });
}

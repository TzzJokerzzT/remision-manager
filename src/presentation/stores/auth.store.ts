import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/src/core/domain/entities/User';
import { clearSessionHint, setSessionHint } from '@/src/shared/utils/sessionHint';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        // La pista de sesión es lo único que el servidor puede leer para rutear `/`.
        if (user) {
          setSessionHint();
        } else {
          clearSessionHint();
        }
        set({ user, isAuthenticated: !!user });
      },
      clear: () => {
        clearSessionHint();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'remisiones-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

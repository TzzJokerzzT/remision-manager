import type { User } from '@/src/core/domain/entities/User';
import { useAuthStore } from '@/src/presentation/stores/auth.store';
import { SESSION_HINT_COOKIE, SESSION_HINT_VALUE } from '@/src/shared/constants/sessionHint';

const user: User = {
  id: 'user-1',
  name: 'Ana Pérez',
  email: 'ana@correo.com',
  role: 'admin',
  companyLogoUrl: null,
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // biome-ignore lint/suspicious/noDocumentCookie: el test observa la cookie que el store escribe; jsdom no implementa Cookie Store API.
    document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0`;
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('inicia sin usuario autenticado', () => {
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('setUser guarda el usuario y marca la sesión como autenticada', () => {
    useAuthStore.getState().setUser(user);

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('setUser escribe la cookie de pista de sesión', () => {
    useAuthStore.getState().setUser(user);

    expect(document.cookie).toContain(`${SESSION_HINT_COOKIE}=${SESSION_HINT_VALUE}`);
  });

  it('setUser(null) limpia el usuario y la cookie', () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(document.cookie).not.toContain(`${SESSION_HINT_COOKIE}=${SESSION_HINT_VALUE}`);
  });

  it('clear limpia el usuario y la cookie', () => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().clear();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(document.cookie).not.toContain(`${SESSION_HINT_COOKIE}=${SESSION_HINT_VALUE}`);
  });
});

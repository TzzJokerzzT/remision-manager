import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import type { User } from '@/src/core/domain/entities/User';
import { ProtectedShell } from '@/src/presentation/components/layout/ProtectedShell';
import { useAuthStore } from '@/src/presentation/stores/auth.store';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/src/presentation/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('./Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}));

jest.mock('./Topbar', () => ({
  Topbar: () => <div data-testid="topbar" />,
}));

const useRouterMock = useRouter as jest.Mock;
const useAuthStoreMock = useAuthStore as unknown as jest.Mock;

const user: User = {
  id: 'user-1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'admin',
  companyLogoUrl: null,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('ProtectedShell', () => {
  beforeEach(() => {
    // Aísla la pista de sesión entre tests: la cookie persiste en el mismo jsdom.
    // biome-ignore lint/suspicious/noDocumentCookie: se limpia la pista de sesión real entre tests.
    document.cookie = 'remisiones_session=; path=/; max-age=0';
    useRouterMock.mockReset();
    useAuthStoreMock.mockReset();
  });

  it('sin autenticar muestra el spinner, redirige a /login y limpia la pista de sesión', () => {
    const replaceMock = jest.fn();
    useAuthStoreMock.mockReturnValue({ isAuthenticated: false, user: null });
    useRouterMock.mockReturnValue({ replace: replaceMock });

    const { container } = render(
      <ProtectedShell>
        <p>contenido privado</p>
      </ProtectedShell>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith('/login');
    // `clearSessionHint` expira la cookie: jsdom la elimina del todo, así que el valor 1 no puede quedar.
    expect(document.cookie).not.toContain('remisiones_session=1');
  });

  it('autenticado renderiza los children y escribe la pista de sesión', () => {
    const replaceMock = jest.fn();
    useAuthStoreMock.mockReturnValue({ isAuthenticated: true, user });
    useRouterMock.mockReturnValue({ replace: replaceMock });

    render(
      <ProtectedShell>
        <p>contenido privado</p>
      </ProtectedShell>
    );

    expect(screen.getByText('contenido privado')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(document.cookie).toContain('remisiones_session=1');
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

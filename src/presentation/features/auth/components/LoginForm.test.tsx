import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { User } from '@/src/core/domain/entities/User';
import { LoginForm } from '@/src/presentation/features/auth/components/LoginForm';
import { useLogin } from '@/src/presentation/features/auth/hooks/useLogin';
import { useAuthStore } from '@/src/presentation/stores/auth.store';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

jest.mock('@/src/presentation/features/auth/hooks/useLogin', () => ({
  useLogin: jest.fn(),
}));

jest.mock('@/src/presentation/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const useRouterMock = useRouter as jest.Mock;
const useLoginMock = useLogin as jest.Mock;
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

function mockLogin(mutate: jest.Mock = jest.fn()) {
  useLoginMock.mockReturnValue({ mutate, isPending: false, isError: false, error: null });
  return mutate;
}

describe('LoginForm', () => {
  beforeEach(() => {
    useRouterMock.mockReset();
    useLoginMock.mockReset();
    useAuthStoreMock.mockReset();
  });

  it('rebota a /dashboard cuando ya hay una sesión activa', () => {
    const replaceMock = jest.fn();
    useRouterMock.mockReturnValue({ replace: replaceMock });
    useAuthStoreMock.mockReturnValue({ isAuthenticated: true, user });
    mockLogin();

    render(<LoginForm />);

    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('envía al mutation los valores escritos', async () => {
    const replaceMock = jest.fn();
    const mutate = mockLogin();
    useRouterMock.mockReturnValue({ replace: replaceMock });
    useAuthStoreMock.mockReturnValue({ isAuthenticated: false, user: null });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'secreto123');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(mutate).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secreto123' });
  });

  it('muestra errores con email inválido y contraseña vacía', async () => {
    const replaceMock = jest.fn();
    const mutate = mockLogin();
    useRouterMock.mockReturnValue({ replace: replaceMock });
    useAuthStoreMock.mockReturnValue({ isAuthenticated: false, user: null });

    const { container } = render(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'noesmail');
    // `userEvent.click` del submit activa la validación nativa de jsdom para `type="email"`
    // y bloquea el evento de submit; se dispara el submit directo para ejercer la validación de Zod.
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(await screen.findByText('Email inválido')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});

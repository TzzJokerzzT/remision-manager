import { AuthUseCases } from '@/src/core/application/use-cases/auth/AuthUseCases';
import type { User } from '@/src/core/domain/entities/User';
import type {
  AuthTokens,
  IAuthRepository,
  LoginPayload,
  RegisterPayload,
} from '@/src/core/domain/repositories/IAuthRepository';

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

const tokens: AuthTokens = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
};

const registerPayload: RegisterPayload = {
  name: 'Ana Pérez',
  email: 'ana@correo.com',
  password: 'secreto',
};

const loginPayload: LoginPayload = {
  email: 'ana@correo.com',
  password: 'secreto',
};

const repo: IAuthRepository = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
};

describe('AuthUseCases', () => {
  const useCases = new AuthUseCases(repo);

  it('register reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { user, message: 'Registro exitoso' };
    jest.mocked(repo.register).mockResolvedValue(result);

    await expect(useCases.register(registerPayload)).resolves.toBe(result);

    expect(repo.register).toHaveBeenCalledWith(registerPayload);
  });

  it('login reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { user, tokens, message: 'Sesión iniciada' };
    jest.mocked(repo.login).mockResolvedValue(result);

    await expect(useCases.login(loginPayload)).resolves.toBe(result);

    expect(repo.login).toHaveBeenCalledWith(loginPayload);
  });

  it('logout delega sin argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.logout).mockResolvedValue(undefined);

    await expect(useCases.logout()).resolves.toBeUndefined();

    expect(repo.logout).toHaveBeenCalledWith();
  });

  it('me delega sin argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.me).mockResolvedValue(user);

    await expect(useCases.me()).resolves.toBe(user);

    expect(repo.me).toHaveBeenCalledWith();
  });
});

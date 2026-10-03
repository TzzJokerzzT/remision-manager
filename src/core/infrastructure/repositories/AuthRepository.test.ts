import type { User } from '@/src/core/domain/entities/User';
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
} from '@/src/core/domain/repositories/IAuthRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { AuthRepository } from '@/src/core/infrastructure/repositories/AuthRepository';

jest.mock('@/src/core/infrastructure/http/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const getMock = httpClient.get as jest.Mock;
const postMock = httpClient.post as jest.Mock;

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

describe('AuthRepository', () => {
  const repository = new AuthRepository();

  describe('register', () => {
    it('envía POST y combina data.data con data.message', async () => {
      postMock.mockResolvedValue({ data: { data: { user }, message: 'Registro exitoso' } });

      await expect(repository.register(registerPayload)).resolves.toEqual({
        user,
        message: 'Registro exitoso',
      });
      expect(postMock).toHaveBeenCalledWith('/auth/register', registerPayload);
    });
  });

  describe('login', () => {
    it('envía POST y combina data.data con data.message', async () => {
      postMock.mockResolvedValue({
        data: { data: { user, tokens }, message: 'Sesión iniciada' },
      });

      await expect(repository.login(loginPayload)).resolves.toEqual({
        user,
        tokens,
        message: 'Sesión iniciada',
      });
      expect(postMock).toHaveBeenCalledWith('/auth/login', loginPayload);
    });
  });

  describe('refresh', () => {
    it('envía el refreshToken en el cuerpo y desenvuelve data.data', async () => {
      postMock.mockResolvedValue({ data: { data: tokens } });

      await expect(repository.refresh('refresh-1')).resolves.toEqual(tokens);
      expect(postMock).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-1' });
    });
  });

  describe('logout', () => {
    it('envía POST y devuelve data.message', async () => {
      postMock.mockResolvedValue({ data: { message: 'Sesión cerrada' } });

      // El contrato (IAuthRepository) declara Promise<void>, pero la implementación
      // devuelve data.message; se fija el comportamiento actual.
      await expect(repository.logout()).resolves.toBe('Sesión cerrada');
      expect(postMock).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('me', () => {
    it('envía GET y desenvuelve data.data', async () => {
      getMock.mockResolvedValue({ data: { data: user } });

      await expect(repository.me()).resolves.toEqual(user);
      expect(getMock).toHaveBeenCalledWith('/users/me');
    });
  });
});

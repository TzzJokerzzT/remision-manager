import type { User } from '@/src/core/domain/entities/User';
import type { UpdateUserPayload } from '@/src/core/domain/repositories/IUserRepository';
import { httpClient } from '@/src/core/infrastructure/http/httpClient';
import { UserRepository } from '@/src/core/infrastructure/repositories/UserRepository';

jest.mock('@/src/core/infrastructure/http/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const getMock = httpClient.get as jest.Mock;
const patchMock = httpClient.patch as jest.Mock;
const deleteMock = httpClient.delete as jest.Mock;

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

const updatePayload: UpdateUserPayload = {
  companyLogoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/logos/acme.png',
};

describe('UserRepository', () => {
  const repository = new UserRepository();

  describe('getById', () => {
    it('obtiene por id y desenvuelve data.data', async () => {
      getMock.mockResolvedValue({ data: { data: user } });

      await expect(repository.getById('user-1')).resolves.toEqual(user);
      expect(getMock).toHaveBeenCalledWith('/users/user-1');
    });
  });

  describe('update', () => {
    it('envía PATCH y desenvuelve data.data', async () => {
      patchMock.mockResolvedValue({ data: { data: user } });

      await expect(repository.update('user-1', updatePayload)).resolves.toEqual(user);
      expect(patchMock).toHaveBeenCalledWith('/users/user-1', updatePayload);
    });
  });

  describe('delete', () => {
    it('envía DELETE en la URL correcta y no devuelve nada', async () => {
      deleteMock.mockResolvedValue({ data: {} });

      await expect(repository.delete('user-1')).resolves.toBeUndefined();
      expect(deleteMock).toHaveBeenCalledWith('/users/user-1');
    });
  });
});

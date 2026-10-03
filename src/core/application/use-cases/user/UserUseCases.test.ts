import { UserUseCases } from '@/src/core/application/use-cases/user/UserUseCases';
import type { User } from '@/src/core/domain/entities/User';
import type { IUserRepository, UpdateUserPayload } from '@/src/core/domain/repositories/IUserRepository';

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

const repo: IUserRepository = {
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UserUseCases', () => {
  const useCases = new UserUseCases(repo);

  it('getById reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.getById).mockResolvedValue(user);

    await expect(useCases.getById('user-1')).resolves.toBe(user);

    expect(repo.getById).toHaveBeenCalledWith('user-1');
  });

  it('update reenvía id y payload y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.update).mockResolvedValue(user);

    await expect(useCases.update('user-1', updatePayload)).resolves.toBe(user);

    expect(repo.update).toHaveBeenCalledWith('user-1', updatePayload);
  });

  it('delete reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.delete).mockResolvedValue(undefined);

    await expect(useCases.delete('user-1')).resolves.toBeUndefined();

    expect(repo.delete).toHaveBeenCalledWith('user-1');
  });
});

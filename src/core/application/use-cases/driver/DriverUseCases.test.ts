import { DriverUseCases } from '@/src/core/application/use-cases/driver/DriverUseCases';
import type { Driver } from '@/src/core/domain/entities/Driver';
import type {
  CreateDriverPayload,
  IDriverRepository,
  PaginatedDriverResponse,
  UpdateDriverPayload,
} from '@/src/core/domain/repositories/IDriverRepository';

const driver: Driver = {
  id: 'driver-1',
  name: 'Juan Pérez',
  documentId: '1030000000',
  licenseNumber: 'C1-123',
  companyId: 'company-1',
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedDriverResponse = {
  items: [driver],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateDriverPayload = {
  name: 'Juan Pérez',
  documentId: '1030000000',
  companyId: 'company-1',
};

const updatePayload: UpdateDriverPayload = { vehiclePlate: 'ABC-123' };

const repo: IDriverRepository = {
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DriverUseCases', () => {
  const useCases = new DriverUseCases(repo);

  it('list reenvía los argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.list).mockResolvedValue(paginated);

    await expect(useCases.list('company-1', 'juan', 2, 10)).resolves.toBe(paginated);

    expect(repo.list).toHaveBeenCalledWith('company-1', 'juan', 2, 10);
  });

  it('getById reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    const result = { driver, message: 'ok' };
    jest.mocked(repo.getById).mockResolvedValue(result);

    await expect(useCases.getById('driver-1')).resolves.toBe(result);

    expect(repo.getById).toHaveBeenCalledWith('driver-1');
  });

  it('create reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { driver, message: 'Creado' };
    jest.mocked(repo.create).mockResolvedValue(result);

    await expect(useCases.create(createPayload)).resolves.toBe(result);

    expect(repo.create).toHaveBeenCalledWith(createPayload);
  });

  it('update reenvía id y payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { driver, message: 'Actualizado' };
    jest.mocked(repo.update).mockResolvedValue(result);

    await expect(useCases.update('driver-1', updatePayload)).resolves.toBe(result);

    expect(repo.update).toHaveBeenCalledWith('driver-1', updatePayload);
  });

  it('delete reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.delete).mockResolvedValue(undefined);

    await expect(useCases.delete('driver-1')).resolves.toBeUndefined();

    expect(repo.delete).toHaveBeenCalledWith('driver-1');
  });
});

import { CompanyUseCases } from '@/src/core/application/use-cases/company/CompanyUseCases';
import type { Company } from '@/src/core/domain/entities/Company';
import type {
  CreateCompanyPayload,
  ICompanyRepository,
  PaginatedCompanyResponse,
  UpdateCompanyPayload,
} from '@/src/core/domain/repositories/ICompanyRepository';

const company: Company = {
  id: 'company-1',
  name: 'Acme SAS',
  nit: '900123456-1',
  logoUrl: null,
  ownerId: 'owner-1',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const paginated: PaginatedCompanyResponse = {
  items: [company],
  total: 1,
  limit: 10,
  page: 1,
  totalPages: 1,
};

const createPayload: CreateCompanyPayload = {
  name: 'Acme SAS',
  nit: '900123456-1',
};

const updatePayload: UpdateCompanyPayload = { name: 'Acme Corp' };

const repo: ICompanyRepository = {
  list: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CompanyUseCases', () => {
  const useCases = new CompanyUseCases(repo);

  it('list reenvía los argumentos y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.list).mockResolvedValue(paginated);

    await expect(useCases.list('acme', 2, 10)).resolves.toBe(paginated);

    expect(repo.list).toHaveBeenCalledWith('acme', 2, 10);
  });

  it('getById reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.getById).mockResolvedValue(company);

    await expect(useCases.getById('company-1')).resolves.toBe(company);

    expect(repo.getById).toHaveBeenCalledWith('company-1');
  });

  it('create reenvía el payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { company, message: 'Creada' };
    jest.mocked(repo.create).mockResolvedValue(result);

    await expect(useCases.create(createPayload)).resolves.toBe(result);

    expect(repo.create).toHaveBeenCalledWith(createPayload);
  });

  it('update reenvía id y payload y devuelve el resultado exacto del repositorio', async () => {
    const result = { company, message: 'Actualizada' };
    jest.mocked(repo.update).mockResolvedValue(result);

    await expect(useCases.update('company-1', updatePayload)).resolves.toBe(result);

    expect(repo.update).toHaveBeenCalledWith('company-1', updatePayload);
  });

  it('delete reenvía el id y devuelve el resultado exacto del repositorio', async () => {
    jest.mocked(repo.delete).mockResolvedValue(undefined);

    await expect(useCases.delete('company-1')).resolves.toBeUndefined();

    expect(repo.delete).toHaveBeenCalledWith('company-1');
  });
});

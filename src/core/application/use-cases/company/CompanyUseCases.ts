import type {
  CreateCompanyPayload,
  ICompanyRepository,
  PaginatedCompanyResponse,
  UpdateCompanyPayload,
} from '../../../domain/repositories/ICompanyRepository';

export class CompanyUseCases {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  list(search?: string, page?: number, limit?: number): Promise<PaginatedCompanyResponse> {
    return this.companyRepo.list(search, page, limit);
  }

  getById(id: string) {
    return this.companyRepo.getById(id);
  }

  create(payload: CreateCompanyPayload) {
    return this.companyRepo.create(payload);
  }

  update(id: string, payload: UpdateCompanyPayload) {
    return this.companyRepo.update(id, payload);
  }

  delete(id: string) {
    return this.companyRepo.delete(id);
  }
}

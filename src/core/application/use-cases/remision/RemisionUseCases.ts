import type {
  CreateRemisionPayload,
  IRemisionRepository,
  PaginatedRemisionResponse,
  UpdateRemisionPayload,
} from '../../../domain/repositories/IRemisionRepository';

export class RemisionUseCases {
  constructor(private readonly remisionRepo: IRemisionRepository) {}

  list(
    companyId?: string,
    search?: string,
    page?: number,
    limit?: number,
    filters?: { clientName?: string; driverName?: string; type?: string; from?: string; to?: string }
  ): Promise<PaginatedRemisionResponse> {
    return this.remisionRepo.list(companyId, search, page, limit, filters);
  }

  getById(id: string) {
    return this.remisionRepo.getById(id);
  }

  create(payload: CreateRemisionPayload) {
    return this.remisionRepo.create(payload);
  }

  update(id: string, payload: UpdateRemisionPayload) {
    return this.remisionRepo.update(id, payload);
  }

  delete(id: string) {
    return this.remisionRepo.delete(id);
  }
}

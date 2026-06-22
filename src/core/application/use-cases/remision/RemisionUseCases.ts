import type {
  CreateRemisionPayload,
  IRemisionRepository,
  UpdateRemisionPayload,
} from '../../../domain/repositories/IRemisionRepository';

export class RemisionUseCases {
  constructor(private readonly remisionRepo: IRemisionRepository) {}

  list(companyId?: string, search?: string) {
    return this.remisionRepo.list(companyId, search);
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

import type {
  CreateClientPayload,
  IClientRepository,
  UpdateClientPayload,
} from '../../../domain/repositories/IClientRepository';

export class ClientUseCases {
  constructor(private readonly clientRepo: IClientRepository) {}

  list(companyId?: string, search?: string) {
    return this.clientRepo.list(companyId, search);
  }

  getById(id: string) {
    return this.clientRepo.getById(id);
  }

  create(payload: CreateClientPayload) {
    return this.clientRepo.create(payload);
  }

  update(id: string, payload: UpdateClientPayload) {
    return this.clientRepo.update(id, payload);
  }

  delete(id: string) {
    return this.clientRepo.delete(id);
  }
}

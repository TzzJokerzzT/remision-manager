import type {
  CreateDriverPayload,
  IDriverRepository,
  UpdateDriverPayload,
} from '../../../domain/repositories/IDriverRepository';

export class DriverUseCases {
  constructor(private readonly driverRepo: IDriverRepository) {}

  list(companyId?: string) {
    return this.driverRepo.list(companyId);
  }

  getById(id: string) {
    return this.driverRepo.getById(id);
  }

  create(payload: CreateDriverPayload) {
    return this.driverRepo.create(payload);
  }

  update(id: string, payload: UpdateDriverPayload) {
    return this.driverRepo.update(id, payload);
  }

  delete(id: string) {
    return this.driverRepo.delete(id);
  }
}

import type { IUserRepository, UpdateUserPayload } from '../../../domain/repositories/IUserRepository';

export class UserUseCases {
  constructor(private readonly userRepo: IUserRepository) {}

  getById(id: string) {
    return this.userRepo.getById(id);
  }

  update(id: string, payload: UpdateUserPayload) {
    return this.userRepo.update(id, payload);
  }

  delete(id: string) {
    return this.userRepo.delete(id);
  }
}

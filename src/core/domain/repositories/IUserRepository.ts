import type { User } from '../entities/User';

export interface UpdateUserPayload {
  name?: string;
  companyLogoUrl?: string | null;
  isActive?: boolean;
}

export interface IUserRepository {
  getById(id: string): Promise<User>;
  update(id: string, payload: UpdateUserPayload): Promise<User>;
  delete(id: string): Promise<void>;
}

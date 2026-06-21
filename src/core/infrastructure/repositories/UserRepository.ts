import type { User } from '../../domain/entities/User';
import type { IUserRepository, UpdateUserPayload } from '../../domain/repositories/IUserRepository';
import { httpClient } from '../http/httpClient';

export class UserRepository implements IUserRepository {
  async getById(id: string) {
    const { data } = await httpClient.get(`/users/${id}`);
    return data.data as User;
  }

  async update(id: string, payload: UpdateUserPayload) {
    const { data } = await httpClient.patch(`/users/${id}`, payload);
    return data.data as User;
  }

  async delete(id: string) {
    await httpClient.delete(`/users/${id}`);
  }
}

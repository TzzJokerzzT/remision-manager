import type { User } from '../../domain/entities/User';
import type {
  AuthTokens,
  IAuthRepository,
  LoginPayload,
  RegisterPayload,
} from '../../domain/repositories/IAuthRepository';
import { httpClient } from '../http/httpClient';

export class AuthRepository implements IAuthRepository {
  async register(payload: RegisterPayload) {
    const { data } = await httpClient.post('/auth/register', payload);
    return {
      ...(data.data as { user: User }),
      message: data.message as string,
    };
  }

  async login(payload: LoginPayload) {
    const { data } = await httpClient.post('/auth/login', payload);
    return {
      ...(data.data as { user: User; tokens: AuthTokens }),
      message: data.message as string,
    };
  }

  async refresh(refreshToken: string) {
    const { data } = await httpClient.post('/auth/refresh', { refreshToken });
    return data.data as AuthTokens;
  }

  async logout() {
    const { data } = await httpClient.post('/auth/logout');
    return data.message;
  }

  async me() {
    const { data } = await httpClient.get('/users/me');
    return data.data as User;
  }
}

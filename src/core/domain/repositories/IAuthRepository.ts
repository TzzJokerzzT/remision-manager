import type { User } from '../entities/User';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface IAuthRepository {
  register(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }>;
  login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  me(): Promise<User>;
}

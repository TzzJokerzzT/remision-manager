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
  register(payload: RegisterPayload): Promise<{ user: User; message: string }>;
  login(payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens; message: string }>;
  refresh(refreshToken: string): Promise<AuthTokens>;
  logout(): Promise<void>;
  me(): Promise<User>;
}

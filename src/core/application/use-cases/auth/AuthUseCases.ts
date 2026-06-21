import type {
  IAuthRepository,
  LoginPayload,
  RegisterPayload,
} from '../../../domain/repositories/IAuthRepository';

export class AuthUseCases {
  constructor(private readonly authRepo: IAuthRepository) {}

  register(payload: RegisterPayload) {
    return this.authRepo.register(payload);
  }

  login(payload: LoginPayload) {
    return this.authRepo.login(payload);
  }

  logout() {
    return this.authRepo.logout();
  }

  me() {
    return this.authRepo.me();
  }
}

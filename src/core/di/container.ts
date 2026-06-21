import { AuthUseCases } from '../application/use-cases/auth/AuthUseCases';
import { ClientUseCases } from '../application/use-cases/client/ClientUseCases';
import { CompanyUseCases } from '../application/use-cases/company/CompanyUseCases';
import { DriverUseCases } from '../application/use-cases/driver/DriverUseCases';
import { RemisionUseCases } from '../application/use-cases/remision/RemisionUseCases';
import { UserUseCases } from '../application/use-cases/user/UserUseCases';
import { AuthRepository } from '../infrastructure/repositories/AuthRepository';
import { ClientRepository } from '../infrastructure/repositories/ClientRepository';
import { CompanyRepository } from '../infrastructure/repositories/CompanyRepository';
import { DriverRepository } from '../infrastructure/repositories/DriverRepository';
import { RemisionRepository } from '../infrastructure/repositories/RemisionRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';

const authRepository = new AuthRepository();
const companyRepository = new CompanyRepository();
const clientRepository = new ClientRepository();
const driverRepository = new DriverRepository();
const userRepository = new UserRepository();
const remisionRepository = new RemisionRepository();

export const authUseCases = new AuthUseCases(authRepository);
export const companyUseCases = new CompanyUseCases(companyRepository);
export const clientUseCases = new ClientUseCases(clientRepository);
export const driverUseCases = new DriverUseCases(driverRepository);
export const userUseCases = new UserUseCases(userRepository);
export const remisionUseCases = new RemisionUseCases(remisionRepository);

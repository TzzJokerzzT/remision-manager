import type { Company } from '../entities/Company';

export interface CreateCompanyPayload {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface ICompanyRepository {
  list(): Promise<Company[]>;
  getById(id: string): Promise<Company>;
  create(payload: CreateCompanyPayload): Promise<Company>;
  update(id: string, payload: UpdateCompanyPayload): Promise<Company>;
  delete(id: string): Promise<void>;
}

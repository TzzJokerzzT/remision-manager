import type { Remision, RemisionItem, RemisionType } from '../entities/Remision';

export interface PaginatedRemisionResponse {
  items: Remision[];
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface CreateRemisionPayload {
  type: RemisionType;
  companyId: string;
  clientId: string;
  driverId?: string;
  items: RemisionItem[];
  ivaPercentage?: number;
  notes?: string;
}

export interface UpdateRemisionPayload {
  items?: RemisionItem[];
  ivaPercentage?: number;
  notes?: string;
  clientId?: string;
  driverId?: string;
}

export interface RemisionFilters {
  companyId?: string;
  search?: string;
  clientName?: string;
  driverName?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface IRemisionRepository {
  list(
    companyId?: string,
    search?: string,
    page?: number,
    limit?: number,
    filters?: Pick<RemisionFilters, 'clientName' | 'driverName' | 'type' | 'from' | 'to'>
  ): Promise<PaginatedRemisionResponse>;
  getById(id: string): Promise<Remision>;
  create(payload: CreateRemisionPayload): Promise<{ remision: Remision; message: string }>;
  update(id: string, payload: UpdateRemisionPayload): Promise<{ remision: Remision; message: string }>;
  delete(id: string): Promise<void>;
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  companies: {
    all: (search?: string, page?: number) => ['companies', search ?? '', page ?? 1] as const,
    detail: (id: string) => ['companies', id] as const,
  },
  clients: {
    all: (companyId?: string, search?: string, page?: number) =>
      ['clients', companyId ?? 'all', search ?? '', page ?? 1] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  drivers: {
    all: (companyId?: string, search?: string, page?: number) =>
      ['drivers', companyId ?? 'all', search ?? '', page ?? 1] as const,
    detail: (id: string) => ['drivers', 'detail', id] as const,
  },
  remisiones: {
    all: (
      companyId?: string,
      search?: string,
      page?: number,
      filters?: { clientName?: string; driverName?: string; type?: string; from?: string; to?: string }
    ) =>
      [
        'remisiones',
        companyId ?? 'all',
        search ?? '',
        page ?? 1,
        filters?.clientName ?? '',
        filters?.driverName ?? '',
        filters?.type ?? '',
        filters?.from ?? '',
        filters?.to ?? '',
      ] as const,
    detail: (id: string) => ['remisiones', 'detail', id] as const,
  },
} as const;

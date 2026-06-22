export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  companies: {
    all: (search?: string) => ['companies', search ?? ''] as const,
    detail: (id: string) => ['companies', id] as const,
  },
  clients: {
    all: (companyId?: string, search?: string) => ['clients', companyId ?? 'all', search ?? ''] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  drivers: {
    all: (companyId?: string, search?: string) => ['drivers', companyId ?? 'all', search ?? ''] as const,
    detail: (id: string) => ['drivers', 'detail', id] as const,
  },
  remisiones: {
    all: (companyId?: string, search?: string) => ['remisiones', companyId ?? 'all', search ?? ''] as const,
    detail: (id: string) => ['remisiones', 'detail', id] as const,
  },
} as const;

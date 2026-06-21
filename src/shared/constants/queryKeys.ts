export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  companies: {
    all: ['companies'] as const,
    detail: (id: string) => ['companies', id] as const,
  },
  clients: {
    all: (companyId?: string) => ['clients', companyId ?? 'all'] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  drivers: {
    all: (companyId?: string) => ['drivers', companyId ?? 'all'] as const,
    detail: (id: string) => ['drivers', 'detail', id] as const,
  },
  remisiones: {
    all: (companyId?: string) => ['remisiones', companyId ?? 'all'] as const,
    detail: (id: string) => ['remisiones', 'detail', id] as const,
  },
} as const;

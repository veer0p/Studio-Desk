/**
 * Centralized React Query key factory. Each module adds its keys here so cache
 * invalidation stays consistent across the app.
 */

export const queryKeys = {
  me: ['me'] as const,
  leads: {
    all: ['leads'] as const,
    list: (params: Record<string, unknown>) => ['leads', 'list', params] as const,
    detail: (id: string) => ['leads', 'detail', id] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (params: Record<string, unknown>) => ['clients', 'list', params] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  proposals: {
    all: ['proposals'] as const,
    list: (params: Record<string, unknown>) => ['proposals', 'list', params] as const,
    detail: (id: string) => ['proposals', 'detail', id] as const,
  },
  contracts: {
    all: ['contracts'] as const,
    list: (params: Record<string, unknown>) => ['contracts', 'list', params] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (params: Record<string, unknown>) => ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    activity: (id: string) => ['bookings', 'activity', id] as const,
    shootBrief: (id: string) => ['bookings', 'shootBrief', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: (params: Record<string, unknown>) => ['invoices', 'list', params] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (params: Record<string, unknown>) => ['payments', 'list', params] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    today: ['dashboard', 'today'] as const,
  },
  galleries: {
    all: ['galleries'] as const,
    list: (params: Record<string, unknown>) => ['galleries', 'list', params] as const,
    detail: (id: string) => ['galleries', 'detail', id] as const,
    clusters: (id: string) => ['galleries', 'clusters', id] as const,
    uploadJob: (galleryId: string, jobId: string) => ['galleries', 'uploadJob', galleryId, jobId] as const,
  },
} as const;

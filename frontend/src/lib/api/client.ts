import ky, { HTTPError, type Options } from 'ky';
import type {
  ApiErrorCode,
  ApiErrorEnvelope,
  ApiSuccessEnvelope,
  PaginatedEnvelope,
  PaginatedResult,
} from '@/types/api';

/**
 * Typed error thrown by the API client. Components and React Query `onError`
 * branches dispatch on `code` for specific UX (QUOTA_EXCEEDED → upgrade sheet,
 * RATE_LIMITED → retry-after toast, etc.).
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const http = ky.create({
  prefixUrl: BASE_URL,
  credentials: 'include',
  timeout: 30_000,
  retry: { limit: 1, methods: ['get'] },
  hooks: {
    beforeError: [
      async (error) => {
        const res = (error as HTTPError).response;
        if (!res) return error;
        const body = (await res.clone().json().catch(() => null)) as
          | ApiErrorEnvelope
          | null;
        const apiErr = new ApiError(
          body?.code ?? 'UNKNOWN',
          res.status,
          body?.error ?? res.statusText ?? 'Request failed',
        );
        // Preserve ky stack for devtools
        (error as unknown as { apiError: ApiError }).apiError = apiErr;

        // 401 from a protected endpoint — signal AuthProviderLayout to clear session
        if (res.status === 401) {
          const path = window.location.pathname;
          const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].some(
            (p) => path.startsWith(p),
          );
          if (!isAuthPage) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
        }

        return error;
      },
    ],
  },
});

async function unwrap<T>(promise: Promise<ApiSuccessEnvelope<T>>): Promise<T> {
  try {
    const body = await promise;
    return body.data;
  } catch (err) {
    if (err instanceof HTTPError) {
      const attached = (err as unknown as { apiError?: ApiError }).apiError;
      if (attached) throw attached;
      throw new ApiError('UNKNOWN', err.response?.status ?? 0, err.message);
    }
    throw err;
  }
}

async function unwrapList<T>(promise: Promise<PaginatedEnvelope<T>>): Promise<PaginatedResult<T>> {
  try {
    const body = await promise;
    return {
      rows: body.data,
      page: body.meta.page,
      pageSize: body.meta.pageSize,
      total: body.meta.count,
      totalPages: body.meta.totalPages,
    };
  } catch (err) {
    if (err instanceof HTTPError) {
      const attached = (err as unknown as { apiError?: ApiError }).apiError;
      if (attached) throw attached;
      throw new ApiError('UNKNOWN', err.response?.status ?? 0, err.message);
    }
    throw err;
  }
}

export function apiGet<T>(path: string, opts?: Options): Promise<T> {
  return unwrap(http.get(path, opts).json<ApiSuccessEnvelope<T>>());
}

export function apiGetList<T>(path: string, opts?: Options): Promise<PaginatedResult<T>> {
  return unwrapList(http.get(path, opts).json<PaginatedEnvelope<T>>());
}

export function apiPost<T>(path: string, json?: unknown, opts?: Options): Promise<T> {
  return unwrap(http.post(path, { ...opts, json }).json<ApiSuccessEnvelope<T>>());
}

export function apiPatch<T>(path: string, json?: unknown, opts?: Options): Promise<T> {
  return unwrap(http.patch(path, { ...opts, json }).json<ApiSuccessEnvelope<T>>());
}

export function apiDelete<T = void>(path: string, opts?: Options): Promise<T> {
  return unwrap(http.delete(path, opts).json<ApiSuccessEnvelope<T>>());
}

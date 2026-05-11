/**
 * Backend envelope shape — mirrors `backend/studiodesk/lib/response.ts`.
 *
 * Success:    { data: T, error: null }
 * Error:      { data: null, error: string, code: string }
 * Paginated:  { data: T[], meta: PaginationMeta, error: null }
 */

export interface ApiSuccessEnvelope<T> {
  data: T;
  error: null;
  code?: string;
}

export interface ApiErrorEnvelope {
  data: null;
  error: string;
  code: string;
}

export interface PaginationMeta {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
  error: null;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export interface PaginatedResult<T> {
  rows: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Known error codes the backend returns (from lib/services/errors). */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'QUOTA_EXCEEDED'
  | 'PAYMENT_FAILED'
  | 'RATE_LIMITED'
  | 'EXTERNAL_ERROR'
  | 'UNKNOWN'
  | (string & {});

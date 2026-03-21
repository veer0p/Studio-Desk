export class ServiceError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number = 400
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

export const Errors = {
  notFound: (entity: string) => new ServiceError(`${entity} not found`, 'NOT_FOUND', 404),
  unauthorized: () => new ServiceError('Unauthorized', 'UNAUTHORIZED', 401),
  forbidden: () => new ServiceError('Access denied', 'FORBIDDEN', 403),
  conflict: (msg: string) => new ServiceError(msg, 'CONFLICT', 409),
  quotaExceeded: () => new ServiceError('Storage quota exceeded', 'QUOTA_EXCEEDED', 422),
  paymentFailed: (msg: string) => new ServiceError(msg, 'PAYMENT_FAILED', 402),
  validation: (msg: string) => new ServiceError(msg, 'VALIDATION_ERROR', 400),
  external: (service: string) => new ServiceError(`${service} service unavailable`, 'EXTERNAL_ERROR', 502),
  rateLimited: () => new ServiceError('Too many requests', 'RATE_LIMITED', 429),
}

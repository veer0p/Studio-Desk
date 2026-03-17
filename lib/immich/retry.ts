import { updateSyncJob } from './sync-logger';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean;
}

/**
 * Retry wrapper for flaky Immich operations
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  jobId: string,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      const waitTime = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      console.warn(`Immich retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
      
      await updateSyncJob(jobId, { 
        retryCount: attempt + 1, 
        errorMessage: `Retry ${attempt + 1}: ${error.message}` 
      });

      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Check if the error is worth retrying (network, 5xx)
 */
function isRetryableError(error: any): boolean {
  if (!error.status) return true; // Network/Fetch errors
  return error.status >= 500 && error.status <= 504;
}

import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from './supabase/admin'

/**
 * trackEvent
 * Sends a breadcrumb to Sentry for key user actions.
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  Sentry.addBreadcrumb({
    category: 'user_action',
    message: name,
    data: properties,
    level: 'info',
  })
}

/**
 * trackError
 * Logs an error to Sentry and optionally to Supabase logs for internal audit.
 */
export async function trackError(error: any, context?: Record<string, any>) {
  console.error('[MONITORING_ERROR]', error, context)
  
  Sentry.captureException(error, {
    extra: context,
  })

  // Optional: Log to Supabase background_job_logs or a dedicated error_logs table
  try {
    const supabase = createAdminClient()
    await supabase.from('background_job_logs').insert({
      job_name: 'error_track',
      status: 'failed',
      error_message: error instanceof Error ? error.message : String(error),
      metadata: context,
    })
  } catch (supabaseError) {
    console.warn('Failed to log error to Supabase:', supabaseError)
  }
}

/**
 * trackPageView
 * For custom analytics tracking if needed.
 */
export function trackPageView(path: string) {
  // Sentry handles most of this automatically in Next.js
  trackEvent('page_view', { path })
}

/**
 * measurePerformance
 * Wraps an async function to measure its execution time.
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    const duration = performance.now() - start
    trackEvent('performance_metric', {
      name,
      duration_ms: Math.round(duration),
      ...context,
    })
  }
}

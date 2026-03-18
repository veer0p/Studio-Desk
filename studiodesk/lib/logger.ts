import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest } from 'next/server'

interface LogErrorParams {
  message: string
  stack?: string
  studioId?: string
  userId?: string
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical'
  requestUrl?: string
  context?: Record<string, unknown>
}

/**
 * Log error to the database, bypassing RLS using admin client
 */
export async function logError(params: LogErrorParams): Promise<void> {
  const { severity = 'error', context = {} } = params
  
  // Strip sensitive info from context
  const cleanContext = { ...context }
  const sensitiveKeys = ['phone', 'password', 'token', 'key', 'secret', 'card', 'bank']
  Object.keys(cleanContext).forEach(key => {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      cleanContext[key] = '[REDACTED]'
    }
  })

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('error_logs').insert({
      message: params.message,
      stack_trace: params.stack,
      studio_id: params.studioId,
      user_id: params.userId,
      severity,
      request_url: params.requestUrl,
      metadata: cleanContext,
    })

    if (error) throw error
  } catch (error) {
    console.error('Failed to log error to Supabase:', error)
    console.error('Original error:', params.message, params.stack)
  }
}

interface LogSecurityParams {
  eventType: string
  req: NextRequest
  studioId?: string
  userId?: string
  context?: Record<string, unknown>
}

/**
 * Log security event to the database
 */
export async function logSecurityEvent(params: LogSecurityParams): Promise<void> {
  const { req, context = {} } = params
  
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || '0.0.0.0'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('security_events_log').insert({
      event_type: params.eventType,
      studio_id: params.studioId,
      user_id: params.userId,
      ip_address: ip,
      user_agent: userAgent,
      metadata: context,
    })

    if (error) throw error
  } catch (error) {
    console.error('Failed to log security event to Supabase:', error)
  }
}

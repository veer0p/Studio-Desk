import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { TeamService } from '@/lib/services/team.service'
import { checkAndIncrementRateLimit } from '@/lib/rate-limit'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { tokenSchema } from '@/lib/validations/team.schema'

export async function POST(
  req: NextRequest,
  context?: { params?: Promise<{ token: string }> }
) {
  try {
    const params = context?.params
    const resolved = params && 'then' in params ? await (params as Promise<{ token: string }>) : params
    const token = resolved?.token ?? ''
    const validated = tokenSchema.safeParse(token)
    if (!validated.success) {
      return Response.error('Invalid invitation token', 'INVALID_TOKEN', 400)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? '0.0.0.0'
    await checkAndIncrementRateLimit(`team_accept:${ip}`)

    const result = await TeamService.acceptInvitation(validated.data, { headers: (n) => req.headers.get(n) })
    const res = Response.ok(result)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err: any) {
    if (err instanceof ServiceError) {
      if (err.code === 'RATE_LIMITED') {
        return Response.error('Too many attempts', 'RATE_LIMITED', 429)
      }
      return Response.error(err.message, err.code, err.status)
    }
    if (err?.status && err?.code) {
      return Response.error(err.message ?? 'Error', err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

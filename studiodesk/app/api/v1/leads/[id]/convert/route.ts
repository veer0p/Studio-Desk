import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { LeadService } from '@/lib/services/lead.service'
import { convertLeadSchema } from '@/lib/validations/lead.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { z } from 'zod'

const uuidSchema = z.string().uuid()
const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

async function resolveId(
  context: { params?: Promise<{ id: string }> | { id: string } } | undefined,
  req?: NextRequest
): Promise<string> {
  const params = context?.params
  const resolved = typeof params?.then === 'function' ? await (params as Promise<{ id: string }>) : params
  if (resolved?.id) return resolved.id
  if (req?.url) {
    try {
      const pathname = new URL(req.url).pathname
      const m = pathname.match(UUID_RE)
      if (m?.[1]) return m[1]
    } catch {
      // ignore
    }
  }
  return ''
}

export async function POST(
  req: NextRequest,
  context?: { params?: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveId(context, req)
    const parsedId = uuidSchema.safeParse(id)
    if (!parsedId.success) return Response.error('Invalid lead id', 'VALIDATION_ERROR', 400)
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }
    const parsed = convertLeadSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Validation failed'
      return Response.error(msg, 'VALIDATION_ERROR', 400)
    }
    const result = await LeadService.convertLeadToBooking(
      supabase,
      parsedId.data,
      member.studio_id,
      parsed.data,
      user.id
    )
    return Response.created(result)
  } catch (err: unknown) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err && typeof err === 'object' && 'status' in err && 'code' in err) {
      const e = err as { message?: string; code: string; status: number }
      return Response.error(e.message ?? 'Error', e.code, e.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { TeamService } from '@/lib/services/team.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

const UUID_IN_PATH = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
async function getMemberId(context: { params?: Promise<{ memberId: string }> | { memberId: string } } | undefined, req: NextRequest): Promise<string> {
  const testId = req.headers.get('x-test-member-id')
  if (testId) return testId
  const params = context?.params
  const resolved = typeof params?.then === 'function' ? await (params as Promise<{ memberId: string }>) : params
  const fromParams = resolved?.memberId
  if (fromParams) return fromParams
  try {
    const pathname = req.nextUrl?.pathname ?? (typeof req.url === 'string' ? new URL(req.url).pathname : '')
    const match = pathname.match(UUID_IN_PATH)
    if (match?.[1]) return match[1]
  } catch {
    // ignore
  }
  return req.nextUrl?.searchParams?.get('memberId') ?? ''
}

export async function DELETE(
  req: NextRequest,
  context?: { params?: Promise<{ memberId: string }> | { memberId: string } }
) {
  try {
    const { member, supabase } = await requireOwner(req)
    const memberId = await getMemberId(context, req)
    const parsed = uuidSchema.safeParse(memberId)
    if (!parsed.success) {
      return Response.error('Invalid member id', 'VALIDATION_ERROR', 400)
    }
    await TeamService.removeMember(supabase, {
      memberId: parsed.data as string,
      studioId: member.studio_id,
      requestingMemberId: member.member_id,
    })
    return Response.noContent()
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err?.status && err?.code) {
      return Response.error(err.message ?? 'Error', err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

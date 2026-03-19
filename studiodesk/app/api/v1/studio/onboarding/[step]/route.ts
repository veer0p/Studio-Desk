import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { StudioService } from '@/lib/services/studio.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

const bodySchema = z.object({
  /** Zod v4 requires key schema for z.record */
  data: z.record(z.string(), z.unknown()).optional().default({}),
  time_spent_sec: z.number().int().min(0).max(86400).optional(),
})

export async function POST(
  req: NextRequest,
  context?: { params?: Promise<{ step: string }> | { step: string } }
) {
  try {
    const { member, supabase } = await requireAuth(req)
    const params = context?.params
    const resolvedParams =
      params == null
        ? undefined
        : typeof (params as any)?.then === 'function'
          ? await (params as Promise<{ step: string }>)
          : params
    const stepParam = resolvedParams?.step
    const stepNum = parseInt(stepParam ?? '', 10)
    if (Number.isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
      return Response.error('Invalid step', 'INVALID_STEP', 400)
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }
    const completeResult = bodySchema.safeParse(body ?? {})
    if (!completeResult.success) {
      return Response.error(
        completeResult.error.issues[0]?.message ?? 'Invalid body',
        'VALIDATION_ERROR',
        400
      )
    }
    const { data: stepData, time_spent_sec } = completeResult.data
    const stepPayload =
      typeof stepData === 'object' && stepData !== null ? (stepData as Record<string, unknown>) : {}

    const status = await StudioService.completeOnboardingStep(
      supabase,
      member.studio_id,
      stepNum,
      stepPayload,
      time_spent_sec
    )
    const res = Response.ok(status)
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    if (err?.status && err?.code) {
      return Response.error(err.message ?? 'Error', err.code, err.status)
    }
    await logError({
      message: (err?.message ?? String(err)) + (err?.stack ? `\n${err.stack}` : ''),
      requestUrl: req.url,
    })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

import { NextRequest } from 'next/server'
import { Response } from '@/lib/response'
import { LeadService } from '@/lib/services/lead.service'
import { inquiryFormSchema } from '@/lib/validations/lead.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function POST(req: NextRequest) {
  try {
    const studioSlug = req.nextUrl.searchParams.get('studio')
    if (!studioSlug?.trim()) {
      return Response.error('Missing studio query parameter', 'MISSING_STUDIO', 400)
    }

    const ip =
      (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '0.0.0.0'

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }

    const parsed = inquiryFormSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Validation failed'
      return Response.error(msg, 'VALIDATION_ERROR', 400)
    }

    const result = await LeadService.processInquiryForm(
      studioSlug.trim(),
      parsed.data,
      ip
    )

    return Response.created({
      lead_id: result.lead_id,
      message: 'Thank you! We will get back to you shortly.',
    })
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

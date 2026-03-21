import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { PackageService } from '@/lib/services/package.service'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req)
    const templates = PackageService.getTemplates()
    const res = Response.ok(templates)
    res.headers.set('Cache-Control', 'public, max-age=3600')
    return res
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

import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { PackageService } from '@/lib/services/package.service'
import { createAddonSchema } from '@/lib/validations/package.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const addons = await PackageService.getAddons(supabase, member.studio_id)
    const res = Response.ok(addons)
    res.headers.set('Cache-Control', 'no-store')
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

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }
    const parsed = createAddonSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Validation failed'
      return Response.error(msg, 'VALIDATION_ERROR', 400)
    }
    const addon = await PackageService.createAddon(supabase, member.studio_id, parsed.data)
    const res = Response.created(addon)
    res.headers.set('Cache-Control', 'no-store')
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

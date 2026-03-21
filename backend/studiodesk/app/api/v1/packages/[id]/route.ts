import { NextRequest } from 'next/server'
import { requireAuth, requireOwner } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { PackageService } from '@/lib/services/package.service'
import { updatePackageSchema } from '@/lib/validations/package.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { z } from 'zod'

const uuidSchema = z.string().uuid()

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/
async function resolveId(
  context: { params?: Promise<{ id: string }> } | undefined,
  req?: NextRequest
): Promise<string> {
  const params = context?.params
  const resolved = params && 'then' in params ? await (params as Promise<{ id: string }>) : params
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

export async function GET(
  req: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  try {
    const { member, supabase } = await requireAuth(req)
    const id = await resolveId(context, req)
    const parsed = uuidSchema.safeParse(id)
    if (!parsed.success) {
      return Response.error('Invalid package id', 'VALIDATION_ERROR', 400)
    }
    const pkg = await PackageService.getPackageById(supabase, parsed.data, member.studio_id)
    const res = Response.ok(pkg)
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

export async function PATCH(
  req: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  try {
    const { member, supabase, user } = await requireOwner(req)
    const id = await resolveId(context, req)
    const idParsed = uuidSchema.safeParse(id)
    if (!idParsed.success) {
      return Response.error('Invalid package id', 'VALIDATION_ERROR', 400)
    }
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }
    if (
      body === null ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body as object).length === 0
    ) {
      return Response.error('At least one field must be provided', 'VALIDATION_ERROR', 400)
    }
    const bodyParsed = updatePackageSchema.safeParse(body)
    if (!bodyParsed.success) {
      const msg = bodyParsed.error.issues[0]?.message ?? 'Validation failed'
      return Response.error(msg, 'VALIDATION_ERROR', 400)
    }
    const pkg = await PackageService.updatePackage(
      supabase,
      idParsed.data,
      member.studio_id,
      bodyParsed.data,
      user.id
    )
    const res = Response.ok(pkg)
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

export async function DELETE(
  req: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  try {
    const { member, supabase } = await requireOwner(req)
    const id = await resolveId(context, req)
    const parsed = uuidSchema.safeParse(id)
    if (!parsed.success) {
      return Response.error('Invalid package id', 'VALIDATION_ERROR', 400)
    }
    await PackageService.deletePackage(supabase, parsed.data, member.studio_id)
    return Response.noContent()
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

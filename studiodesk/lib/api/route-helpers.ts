import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ServiceError } from '@/lib/errors'
import { Response } from '@/lib/response'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

export function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Validation failed'
}

export async function parseJson(req: NextRequest) {
  try {
    return await req.json()
  } catch {
    throw new ServiceError('Invalid JSON body', 'VALIDATION_ERROR', 400)
  }
}

export async function resolveUuidParam(
  context: { params?: Promise<{ id: string }> | { id: string } } | undefined,
  req: NextRequest,
  label: string
) {
  const params = context?.params
  const resolved = typeof params?.then === 'function' ? await params : params
  const candidate = resolved?.id ?? req.url.match(UUID_RE)?.[1] ?? ''
  const parsed = z.string().uuid().safeParse(candidate)
  if (!parsed.success) {
    throw new ServiceError(`Invalid ${label}`, 'VALIDATION_ERROR', 400)
  }
  return parsed.data
}

export async function resolveTokenParam(
  context: { params?: Promise<{ token: string }> | { token: string } } | undefined,
  req: NextRequest,
  label: string
) {
  const params = context?.params
  const resolved = typeof params?.then === 'function' ? await params : params
  const token = resolved?.token ?? req.url.split('/').at(-1) ?? ''
  const parsed = z.string().regex(/^[0-9a-f]{64}$/i, `Invalid ${label}`).safeParse(token)
  if (!parsed.success) {
    throw new ServiceError(`Invalid ${label}`, 'VALIDATION_ERROR', 400)
  }
  return parsed.data
}

export function withNoStore(res: NextResponse) {
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export function withCache(res: NextResponse, value: string) {
  res.headers.set('Cache-Control', value)
  return res
}

export async function handleRouteError(err: unknown, req: NextRequest) {
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

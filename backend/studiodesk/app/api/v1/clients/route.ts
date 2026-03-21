import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { ClientService } from '@/lib/services/client.service'
import { createClientSchema, clientsQuerySchema } from '@/lib/validations/client.schema'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const searchParams = req.nextUrl?.searchParams ?? new URLSearchParams()
    const params = clientsQuerySchema.parse({
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    })
    const { data, count } = await ClientService.getClients(supabase, member.studio_id, params)
    const res = Response.paginated(data, count, params.page, params.pageSize)
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
    const { member, supabase } = await requireAuth(req)
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }
    const parsed = createClientSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Validation failed'
      return Response.error(msg, 'VALIDATION_ERROR', 400)
    }
    const client = await ClientService.createClient(supabase, member.studio_id, parsed.data)
    const res = Response.created(client)
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

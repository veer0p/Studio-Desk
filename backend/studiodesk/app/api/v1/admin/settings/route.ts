import { NextRequest, NextResponse } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAdminAuth } from '@/lib/admin/guards'
import { updatePlatformSettingSchema } from '@/lib/validations/admin.schema'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

/**
 * GET /api/v1/admin/settings
 * Get all platform settings.
 */
export async function GET(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)
    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('platform_settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) throw new Error('Failed to fetch platform settings')

    return ApiResponse.ok(data || [])
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * PATCH /api/v1/admin/settings
 * Update platform settings. Accepts array of { key, value/value_json }.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { admin, supabase } = await requireAdminAuth(req)
    const adminClient = createAdminClient()

    const body = await req.json()
    const settings = Array.isArray(body) ? body : [body]

    const results = []
    for (const setting of settings) {
      const { key, value, value_json } = setting
      if (!key) continue

      const validated = updatePlatformSettingSchema.safeParse({ value, value_json })
      if (!validated.success) continue

      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      }
      if (validated.data.value !== undefined) updates.value = validated.data.value
      if (validated.data.value_json !== undefined) updates.value_json = validated.data.value_json

      // Upsert
      const { data: result, error } = await adminClient
        .from('platform_settings')
        .upsert({ key, ...updates }, { onConflict: 'key' })
        .select('*')
        .single()

      if (!error) results.push(result)
    }

    return ApiResponse.ok(results)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

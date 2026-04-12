import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/**
 * GET /api/v1/settings/templates
 * List all WhatsApp and email templates for current studio.
 */
export async function GET(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    const [{ data: whatsapp }, { data: email }] = await Promise.all([
      adminClient.from('whatsapp_templates').select('*').eq('studio_id', studio_id).order('automation_type'),
      adminClient.from('email_templates').select('*').eq('studio_id', studio_id).order('automation_type'),
    ])

    return ApiResponse.ok({
      whatsapp: whatsapp || [],
      email: email || [],
    })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/settings/templates
 * Create or update a template (auto-detects type from body fields).
 */
export async function POST(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const body = await req.json()

    const adminClient = createAdminClient()

    if (body.body_text !== undefined) {
      // WhatsApp template
      const { data, error } = await adminClient
        .from('whatsapp_templates')
        .upsert({
          studio_id,
          automation_type: body.automation_type,
          template_name: body.template_name,
          provider: body.provider || 'interakt',
          language: body.language || 'en',
          category: body.category || 'utility',
          body_text: body.body_text,
          variables: body.variables || [],
          is_active: body.is_active ?? false,
        }, { onConflict: 'studio_id,automation_type,language' })
        .select('*')
        .single()

      if (error) throw new Error('Failed to save WhatsApp template')
      return ApiResponse.ok({ type: 'whatsapp', template: data })
    } else {
      // Email template
      const { data, error } = await adminClient
        .from('email_templates')
        .upsert({
          studio_id,
          automation_type: body.automation_type,
          name: body.name,
          subject: body.subject,
          html_body: body.html_body,
          text_body: body.text_body || null,
          variables_used: body.variables_used || [],
          is_default: body.is_default ?? false,
          is_active: body.is_active ?? true,
        })
        .select('*')
        .single()

      if (error) throw new Error('Failed to save email template')
      return ApiResponse.ok({ type: 'email', template: data })
    }
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * PATCH /api/v1/settings/templates/[id]
 * Update a template.
 */
export async function PATCH(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { studio_id } = await requireAuth(req)
    const params = await (context?.params || Promise.resolve({ id: '' }))
    const id = params.id || req.url.match(UUID_RE)?.[1] || ''

    if (!id) return ApiResponse.error('Invalid template ID', 'VALIDATION_ERROR', 400)

    const body = await req.json()
    const adminClient = createAdminClient()

    // Determine type by checking which table has this ID
    const { data: wa } = await adminClient.from('whatsapp_templates').select('id').eq('id', id).eq('studio_id', studio_id).maybeSingle()

    const table = wa ? 'whatsapp_templates' : 'email_templates'
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    // Copy only provided fields
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) updates[key] = value
    }

    const { error } = await adminClient.from(table).update(updates).eq('id', id).eq('studio_id', studio_id)
    if (error) throw new Error('Failed to update template')

    return ApiResponse.ok({ updated: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/settings/templates/[id]
 * Delete a template.
 */
export async function DELETE(req: NextRequest, context: { params?: Promise<{ id: string }> }) {
  try {
    const { studio_id } = await requireAuth(req)
    const params = await (context?.params || Promise.resolve({ id: '' }))
    const id = params.id || req.url.match(UUID_RE)?.[1] || ''

    if (!id) return ApiResponse.error('Invalid template ID', 'VALIDATION_ERROR', 400)

    const adminClient = createAdminClient()

    // Try both tables
    const { error: waError } = await adminClient.from('whatsapp_templates').delete().eq('id', id).eq('studio_id', studio_id)
    if (!waError) return ApiResponse.ok({ deleted: true })

    const { error: emailError } = await adminClient.from('email_templates').delete().eq('id', id).eq('studio_id', studio_id)
    if (emailError) throw new Error('Failed to delete template')

    return ApiResponse.ok({ deleted: true })
  } catch (err: any) {
    if (err.message === 'Unauthorized') return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    await logError({ message: String(err), requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

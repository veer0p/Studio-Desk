import { NextRequest } from 'next/server'
import { Response as ApiResponse } from '@/lib/response'
import { requireAuth } from '@/lib/auth/guards'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError } from '@/lib/logger'

const UUID_RE = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/

/** Normalize DB row to frontend-friendly shape (clause_name → title, clause_content → content) */
function normalizeClause(row: Record<string, unknown>) {
  const { clause_name, clause_content, ...rest } = row
  return {
    ...rest,
    title: clause_name,
    content: clause_content,
  }
}

/**
 * GET /api/v1/contract-clauses
 * List all clauses (studio-specific + system defaults). Filter by ?category=...
 */
export async function GET(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const adminClient = createAdminClient()

    const url = new URL(req.url)
    const category = url.searchParams.get('category')

    // Fetch studio-specific clauses
    let studioQuery = adminClient
      .from('contract_clause_library')
      .select('*')
      .eq('studio_id', studio_id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (category) {
      studioQuery = studioQuery.eq('category', category)
    }

    // Fetch system defaults (studio_id is null) — we use a subquery approach
    // Since the FK requires NOT NULL studio_id, defaults would need a separate table or nullable FK
    // For now, we return studio clauses only and include defaults from a known seed if available
    const [{ data: studioClauses, error: studioError }] = await Promise.all([studioQuery])

    if (studioError) throw new Error('Failed to fetch studio clauses')

    return ApiResponse.ok({
      studio: (studioClauses || []).map(normalizeClause),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message, requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * POST /api/v1/contract-clauses
 * Create a new clause for the current studio.
 */
export async function POST(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const body = await req.json()

    const { title, category, content } = body

    if (!title || !category || !content) {
      return ApiResponse.error('title, category, and content are required', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    const { data, error } = await adminClient
      .from('contract_clause_library')
      .insert({
        studio_id,
        clause_name: title,
        category,
        clause_content: content,
        sort_order: 0,
        is_active: true,
      })
      .select('*')
      .single()

    if (error) throw new Error('Failed to create clause')

    return ApiResponse.ok(normalizeClause(data as Record<string, unknown>))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message, requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * PATCH /api/v1/contract-clauses
 * Update a clause. Only studio-owned clauses can be updated.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const body = await req.json()

    const { id, title, category, content, is_active, sort_order } = body

    if (!id) {
      return ApiResponse.error('id is required', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    // Verify ownership
    const { data: existing, error: fetchError } = await adminClient
      .from('contract_clause_library')
      .select('id, studio_id')
      .eq('id', id)
      .eq('studio_id', studio_id)
      .maybeSingle()

    if (fetchError) throw new Error('Failed to fetch clause')
    if (!existing) {
      return ApiResponse.error('Clause not found or not owned by studio', 'NOT_FOUND', 404)
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updates.clause_name = title
    if (category !== undefined) updates.category = category
    if (content !== undefined) updates.clause_content = content
    if (is_active !== undefined) updates.is_active = is_active
    if (sort_order !== undefined) updates.sort_order = sort_order

    const { data, error } = await adminClient
      .from('contract_clause_library')
      .update(updates)
      .eq('id', id)
      .eq('studio_id', studio_id)
      .select('*')
      .single()

    if (error) throw new Error('Failed to update clause')

    return ApiResponse.ok(normalizeClause(data as Record<string, unknown>))
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message, requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

/**
 * DELETE /api/v1/contract-clauses
 * Delete a clause. Only studio-owned clauses can be deleted.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { studio_id } = await requireAuth(req)
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || req.url.match(UUID_RE)?.[1] || ''

    if (!id) {
      return ApiResponse.error('id is required', 'VALIDATION_ERROR', 400)
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('contract_clause_library')
      .delete()
      .eq('id', id)
      .eq('studio_id', studio_id)

    if (error) throw new Error('Failed to delete clause')

    return ApiResponse.ok({ deleted: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'Unauthorized') {
      return ApiResponse.error('Unauthorized', 'UNAUTHORIZED', 401)
    }
    await logError({ message, requestUrl: req.url })
    return ApiResponse.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

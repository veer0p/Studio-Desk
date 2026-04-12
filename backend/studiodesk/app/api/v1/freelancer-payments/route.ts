import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth/guards'
import { handleRouteError, validationMessage, withNoStore } from '@/lib/api/route-helpers'
import { Response } from '@/lib/response'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { z } from 'zod'
import type { FreelancerPaymentsInput } from '@/types/database'

const VALID_STATUSES = ['pending', 'processing', 'captured', 'refunded', 'failed'] as const
const VALID_METHODS = ['upi', 'cash', 'neft', 'rtgs', 'net_banking', 'card', 'cheque', 'wallet', 'other'] as const

const listQuerySchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  member_id: z.string().uuid().optional(),
})

const createBodySchema = z.object({
  member_id: z.string().uuid('Invalid member ID'),
  assignment_id: z.string().uuid('Invalid assignment ID'),
  booking_id: z.string().uuid('Invalid booking ID'),
  amount: z.coerce.number().positive('Amount must be positive'),
  payment_method: z.enum(VALID_METHODS).optional(),
  due_date: z.string().date('Invalid due date').optional(),
  notes: z.string().optional().nullable(),
})

const updateBodySchema = z.object({
  id: z.string().uuid('Invalid payment ID'),
  status: z.enum(VALID_STATUSES),
  payment_method: z.enum(VALID_METHODS).optional().nullable(),
  reference_number: z.string().optional().nullable(),
  paid_at: z.string().date('Invalid paid date').optional().nullable(),
})

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)

    const parsed = listQuerySchema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams.entries())
    )
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const { status, member_id } = parsed.data

    let query = supabase
      .from('freelancer_payments')
      .select(`
        *,
        studio_members!freelancer_payments_member_id_fkey (
          full_name,
          role
        ),
        bookings!freelancer_payments_booking_id_fkey (
          id,
          client_name,
          event_type
        )
      `)
      .eq('studio_id', member.studio_id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (member_id) {
      query = query.eq('member_id', member_id)
    }

    const { data, error } = await query

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    // Compute summary totals
    const { data: allPayments, error: summaryError } = await supabase
      .from('freelancer_payments')
      .select('amount, status, paid_at')
      .eq('studio_id', member.studio_id)

    if (summaryError) throw new ServiceError(summaryError.message, 'DATABASE_ERROR', 500)

    const summary = {
      total_pending: allPayments
        ?.filter((p: { status: string }) => p.status === 'pending' || p.status === 'processing')
        .reduce((sum: number, p: { amount: string | number }) => sum + Number(p.amount), 0) ?? 0,
      total_paid_this_month: allPayments
        ?.filter((p: { status: string; paid_at: string | null }) => {
          if (p.status !== 'captured' || !p.paid_at) return false
          const paidDate = new Date(p.paid_at)
          const now = new Date()
          return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear()
        })
        .reduce((sum: number, p: { amount: string | number }) => sum + Number(p.amount), 0) ?? 0,
      overdue_count: allPayments?.filter((p: { status: string }) => {
        if (p.status === 'captured' || p.status === 'refunded' || p.status === 'failed') return false
        return true
      }).length ?? 0,
    }

    const res = Response.ok({ payments: data ?? [], summary })
    return withNoStore(res)
  } catch (err) {
    return handleRouteError(err, req)
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

    const parsed = createBodySchema.safeParse(body)
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const { member_id, assignment_id, booking_id, amount, payment_method, notes } = parsed.data

    // Verify member belongs to this studio
    const { data: memberData, error: memberError } = await supabase
      .from('studio_members')
      .select('id')
      .eq('id', member_id)
      .eq('studio_id', member.studio_id)
      .single()

    if (memberError || !memberData) {
      return Response.error('Member not found in this studio', 'NOT_FOUND', 404)
    }

    const insertData: FreelancerPaymentsInput = {
      studio_id: member.studio_id,
      member_id,
      assignment_id,
      booking_id,
      amount,
      notes: notes ?? null,
      payment_method: payment_method ?? undefined,
    }

    const { data, error } = await supabase
      .from('freelancer_payments')
      .insert(insertData as FreelancerPaymentsInput & Record<string, unknown>)
      .select()
      .single()

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    const res = Response.created(data)
    return withNoStore(res)
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return Response.error('Invalid JSON body', 'VALIDATION_ERROR', 400)
    }

    const parsed = updateBodySchema.safeParse(body)
    if (!parsed.success) {
      return Response.error(validationMessage(parsed.error), 'VALIDATION_ERROR', 400)
    }

    const { id, status, payment_method, reference_number, paid_at } = parsed.data

    // Verify payment belongs to this studio
    const { data: existing, error: fetchError } = await supabase
      .from('freelancer_payments')
      .select('id, studio_id')
      .eq('id', id)
      .eq('studio_id', member.studio_id)
      .single()

    if (fetchError || !existing) {
      return Response.error('Payment record not found', 'NOT_FOUND', 404)
    }

    const updateData: Record<string, unknown> = { status }
    if (payment_method !== undefined) updateData.payment_method = payment_method
    if (reference_number !== undefined) updateData.reference_number = reference_number
    if (paid_at !== undefined) updateData.paid_at = paid_at
    if (status === 'captured' && !paid_at) {
      updateData.paid_at = new Date().toISOString().split('T')[0]
    }

    const { data, error } = await supabase
      .from('freelancer_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    const res = Response.ok(data)
    return withNoStore(res)
  } catch (err) {
    return handleRouteError(err, req)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { member, supabase } = await requireOwner(req)

    const searchParams = new URL(req.url).searchParams
    const id = searchParams.get('id')

    if (!id) {
      return Response.error('Payment ID is required', 'VALIDATION_ERROR', 400)
    }

    const parsed = z.string().uuid().safeParse(id)
    if (!parsed.success) {
      return Response.error('Invalid payment ID', 'VALIDATION_ERROR', 400)
    }

    // Verify payment belongs to this studio
    const { data: existing, error: fetchError } = await supabase
      .from('freelancer_payments')
      .select('id, studio_id, status')
      .eq('id', id)
      .eq('studio_id', member.studio_id)
      .single()

    if (fetchError || !existing) {
      return Response.error('Payment record not found', 'NOT_FOUND', 404)
    }

    // Prevent deletion of captured records
    if (existing.status === 'captured') {
      return Response.error('Cannot delete a captured payment record', 'FORBIDDEN', 403)
    }

    const { error } = await supabase
      .from('freelancer_payments')
      .delete()
      .eq('id', id)

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    return Response.noContent()
  } catch (err) {
    return handleRouteError(err, req)
  }
}

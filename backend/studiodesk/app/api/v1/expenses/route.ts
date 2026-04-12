import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { Response } from '@/lib/response'
import { ServiceError } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { z } from 'zod'

const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  incurred_at: z.string().optional(),
  vendor: z.string().optional(),
  booking_id: z.string().uuid().optional().nullable(),
  receipt_url: z.string().url().optional().nullable(),
  is_reimbursable: z.boolean().optional().default(false),
  incurred_by: z.string().uuid().optional().nullable(),
})

const updateExpenseSchema = createExpenseSchema.partial()

export async function GET(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)

    const { data, error } = await supabase
      .from('expense_tracking')
      .select('*')
      .eq('studio_id', member.studio_id)
      .order('incurred_at', { ascending: false })

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    const expenses = (data || []).map((e) => ({
      id: e.id,
      date: e.incurred_at,
      description: e.description,
      category: e.category,
      vendor: e.incurred_by || e.description.split(' ').slice(0, 2).join(' '),
      amount: Number(e.amount),
      gstInput: 0,
      hasReceipt: !!e.receipt_url,
    }))

    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalGst = expenses.reduce((sum, e) => sum + e.gstInput, 0)

    return Response.ok({ list: expenses, count: expenses.length, totalExp, totalGst })
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const body = await req.json()
    const validated = createExpenseSchema.parse(body)

    const { data, error } = await supabase
      .from('expense_tracking')
      .insert({
        studio_id: member.studio_id,
        category: validated.category,
        description: validated.description,
        amount: validated.amount,
        incurred_at: validated.incurred_at || new Date().toISOString().split('T')[0],
        receipt_url: validated.receipt_url || null,
        is_reimbursable: validated.is_reimbursable,
        booking_id: validated.booking_id || null,
        incurred_by: validated.incurred_by || null,
      })
      .select()
      .single()

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    return Response.ok({
      id: data.id,
      date: data.incurred_at,
      description: data.description,
      category: data.category,
      vendor: validated.vendor || '',
      amount: Number(data.amount),
      gstInput: 0,
      hasReceipt: !!data.receipt_url,
    })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return Response.error(err.errors[0].message, 'VALIDATION_ERROR', 400)
    }
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return Response.error('Expense ID is required', 'VALIDATION_ERROR', 400)

    const validated = updateExpenseSchema.parse(updates)

    const updateData: Record<string, any> = { ...validated }
    if (validated.incurred_at) updateData.incurred_at = validated.incurred_at
    if (validated.description) updateData.description = validated.description
    if (validated.amount) updateData.amount = validated.amount
    if (validated.category) updateData.category = validated.category
    if ('receipt_url' in validated) updateData.receipt_url = validated.receipt_url

    const { data, error } = await supabase
      .from('expense_tracking')
      .update(updateData)
      .eq('id', id)
      .eq('studio_id', member.studio_id)
      .select()
      .single()

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)
    if (!data) return Response.error('Expense not found', 'NOT_FOUND', 404)

    return Response.ok({
      id: data.id,
      date: data.incurred_at,
      description: data.description,
      category: data.category,
      vendor: '',
      amount: Number(data.amount),
      gstInput: 0,
      hasReceipt: !!data.receipt_url,
    })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return Response.error(err.errors[0].message, 'VALIDATION_ERROR', 400)
    }
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { member, supabase } = await requireAuth(req)
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) return Response.error('Expense ID is required', 'VALIDATION_ERROR', 400)

    const { error } = await supabase
      .from('expense_tracking')
      .delete()
      .eq('id', id)
      .eq('studio_id', member.studio_id)

    if (error) throw new ServiceError(error.message, 'DATABASE_ERROR', 500)

    return Response.ok({ success: true })
  } catch (err: any) {
    if (err instanceof ServiceError) {
      return Response.error(err.message, err.code, err.status)
    }
    await logError({ message: String(err), requestUrl: req.url })
    return Response.error('Internal server error', 'INTERNAL_ERROR', 500)
  }
}

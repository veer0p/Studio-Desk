import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InvoiceService } from '@/lib/services/invoice.service'
import { invoiceRepo } from '@/lib/repositories/invoice.repo'
import { paymentRepo } from '@/lib/repositories/payment.repo'
import { createPaymentLink } from '@/lib/razorpay/client'

vi.mock('@/lib/repositories/invoice.repo', () => ({
  invoiceRepo: {
    getInvoices: vi.fn(),
    getInvoiceById: vi.fn(),
    getInvoiceByToken: vi.fn(),
    getInvoiceLineItems: vi.fn(),
    createInvoice: vi.fn(),
    createLineItems: vi.fn(),
    updateInvoice: vi.fn(),
    updateInvoiceStatus: vi.fn(),
    updateInvoiceRazorpay: vi.fn(),
    markInvoiceSent: vi.fn(),
    markInvoiceViewed: vi.fn(),
    getOutstandingInvoices: vi.fn(),
    getFinancialSummary: vi.fn(),
    batchMarkOverdue: vi.fn(),
  },
}))

vi.mock('@/lib/repositories/payment.repo', () => ({
  paymentRepo: {
    createPayment: vi.fn(),
    logPaymentGateway: vi.fn(),
  },
}))

vi.mock('@/lib/razorpay/client', async () => {
  const actual = await vi.importActual<any>('@/lib/razorpay/client')
  return { ...actual, createPaymentLink: vi.fn() }
})

vi.mock('@/lib/resend/client', () => ({ sendEmail: vi.fn().mockResolvedValue({}) }))
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }))

function chain(result: any) {
  const self: any = {
    eq: vi.fn(() => self),
    neq: vi.fn(() => self),
    is: vi.fn(() => self),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    select: vi.fn(() => self),
  }
  return self
}

function createSupabase(config: {
  booking?: any
  studio?: any
  client?: any
  advanceCount?: number
}) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'bookings') return { select: vi.fn(() => chain({ data: config.booking ?? null, error: null })) }
      if (table === 'studios') return { select: vi.fn(() => chain({ data: config.studio ?? null, error: null })) }
      if (table === 'clients') return { select: vi.fn(() => chain({ data: config.client ?? null, error: null })) }
      if (table === 'invoices') {
        return {
          select: vi.fn((_q?: string, opts?: any) =>
            opts?.head ? { eq: vi.fn(() => ({ eq: vi.fn(() => ({ neq: vi.fn(async () => ({ count: config.advanceCount ?? 0, error: null })) })) })) } : chain({ data: null, error: null })
          ),
          insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 'inv-1', invoice_number: 'XYZ-FY2526-0001', access_token: 't1' }, error: null })) })) })),
        }
      }
      return { insert: vi.fn(() => Promise.resolve({ error: null })) }
    }),
  } as any
}

describe('InvoiceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(invoiceRepo.createInvoice).mockResolvedValue({ id: 'inv-1', invoice_number: 'XYZ-FY2526-0001', access_token: 't1' } as any)
    vi.mocked(invoiceRepo.createLineItems).mockResolvedValue([] as any)
  })

  it('createInvoice throws NOT_FOUND when booking is missing', async () => {
    const supabase = createSupabase({ studio: { id: 's1', state_id: 7 } })
    await expect(
      InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', line_items: [{ name: 'x', quantity: '1', unit_price: '100.00' }] }, 'u1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('createInvoice validates line item bounds', async () => {
    const supabase = createSupabase({
      booking: { id: 'b1', client_id: 'c1', venue_state_id: 7, status: 'contract_signed' },
      studio: { id: 's1', state_id: 7 },
      client: { id: 'c1', state_id: 7, state: 'Gujarat' },
    })
    await expect(InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', line_items: [] }, 'u1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(
      InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', line_items: Array.from({ length: 21 }, () => ({ name: 'x', quantity: '1', unit_price: '1.00' })) }, 'u1')
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
  })

  it('createInvoice blocks duplicate advance invoices', async () => {
    const supabase = createSupabase({
      booking: { id: 'b1', client_id: 'c1', venue_state_id: 7, status: 'contract_signed' },
      studio: { id: 's1', state_id: 7 },
      client: { id: 'c1', state_id: 7, state: 'Gujarat' },
      advanceCount: 1,
    })
    await expect(
      InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', line_items: [{ name: 'x', quantity: '1', unit_price: '100.00' }] }, 'u1')
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('createInvoice computes cgst_sgst totals and omits invoice_number from insert payload', async () => {
    const supabase = createSupabase({
      booking: { id: 'b1', client_id: 'c1', venue_state_id: 7, status: 'contract_signed' },
      studio: { id: 's1', state_id: 7 },
      client: { id: 'c1', state_id: 7, state: 'Gujarat' },
    })
    vi.spyOn(InvoiceService, 'getInvoiceById').mockResolvedValue({ id: 'inv-1' } as any)

    await InvoiceService.createInvoice(
      supabase,
      's1',
      { booking_id: 'b1', invoice_type: 'advance', gst_type: 'cgst_sgst', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '85000.00' }] },
      'u1'
    )

    const payload = vi.mocked(invoiceRepo.createInvoice).mock.calls[0][1] as Record<string, unknown>
    expect(payload).not.toHaveProperty('invoice_number')
    expect(payload.cgst_amount).toBe('7650.00')
    expect(payload.sgst_amount).toBe('7650.00')
    expect(payload.total_amount).toBe('100300.00')
  })

  it('createInvoice computes igst and exempt totals', async () => {
    const supabase = createSupabase({
      booking: { id: 'b1', client_id: 'c1', venue_state_id: 27, status: 'contract_signed' },
      studio: { id: 's1', state_id: 7 },
      client: { id: 'c1', state_id: 27, state: 'Maharashtra' },
    })
    vi.spyOn(InvoiceService, 'getInvoiceById').mockResolvedValue({ id: 'inv-1' } as any)

    await InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', gst_type: 'igst', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '85000.00' }] }, 'u1')
    let payload = vi.mocked(invoiceRepo.createInvoice).mock.calls.at(-1)?.[1] as any
    expect(payload.igst_amount).toBe('15300.00')
    expect(payload.total_amount).toBe('100300.00')

    await InvoiceService.createInvoice(supabase, 's1', { booking_id: 'b1', invoice_type: 'advance', gst_type: 'exempt', line_items: [{ name: 'Shoot', quantity: '1', unit_price: '85000.00' }] }, 'u1')
    payload = vi.mocked(invoiceRepo.createInvoice).mock.calls.at(-1)?.[1] as any
    expect(payload.cgst_amount).toBe('0.00')
    expect(payload.sgst_amount).toBe('0.00')
    expect(payload.igst_amount).toBe('0.00')
    expect(payload.total_amount).toBe('85000.00')
  })

  it('generatePaymentLink handles conflicts, reuse, expiry, zero balance, and paise conversion', async () => {
    vi.spyOn(InvoiceService, 'getInvoiceById')
      .mockResolvedValueOnce({ status: 'paid' } as any)
      .mockResolvedValueOnce({ status: 'cancelled' } as any)
      .mockResolvedValueOnce({ status: 'sent', payment_link_url: 'https://old', payment_link_expires_at: new Date(Date.now() + 60000).toISOString() } as any)
      .mockResolvedValueOnce({ id: 'i1', status: 'sent', amount_due: '0.00' } as any)
      .mockResolvedValueOnce({ id: 'i1', status: 'sent', amount_due: '100300.00', invoice_number: 'INV', booking_title: 'Shoot', client_name: 'Priya', client_email: 'priya@test.com', client_phone: '9876543210' } as any)

    await expect(InvoiceService.generatePaymentLink({} as any, 'i1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(InvoiceService.generatePaymentLink({} as any, 'i1', 's1')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(InvoiceService.generatePaymentLink({} as any, 'i1', 's1')).resolves.toEqual({ payment_link_url: 'https://old' })
    await expect(InvoiceService.generatePaymentLink({} as any, 'i1', 's1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    vi.mocked(createPaymentLink).mockResolvedValue({ payment_link_id: 'plink_1', short_url: 'https://rzp.io/i/x' } as any)
    await expect(InvoiceService.generatePaymentLink({} as any, 'i1', 's1')).resolves.toEqual({ payment_link_url: 'https://rzp.io/i/x' })
    expect(createPaymentLink).toHaveBeenCalledWith(expect.objectContaining({ amount_rupees: 100300 }))
  })

  it('recordManualPayment validates state and amount bounds', async () => {
    vi.spyOn(InvoiceService, 'getInvoiceById')
      .mockResolvedValueOnce({ status: 'paid' } as any)
      .mockResolvedValueOnce({ status: 'sent', amount_due: '50.00' } as any)
      .mockResolvedValueOnce({ status: 'sent', amount_due: '100.00', booking_id: 'b1', invoice_type: 'advance', invoice_number: 'INV', client_email: 'p@test.com' } as any)
    const loggableSupabase = { from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any
    await expect(InvoiceService.recordManualPayment(loggableSupabase, 'i1', 's1', { amount: '10.00', method: 'cash' }, 'u1')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(InvoiceService.recordManualPayment(loggableSupabase, 'i1', 's1', { amount: '60.00', method: 'cash' }, 'u1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    vi.mocked(paymentRepo.createPayment).mockResolvedValue({ id: 'p1' } as any)
    await expect(InvoiceService.recordManualPayment(loggableSupabase, 'i1', 's1', { amount: '100.00', method: 'cash' }, 'u1')).resolves.toMatchObject({ id: 'p1' })
  })

  it('createCreditNote enforces paid invoice and amount ceiling', async () => {
    vi.spyOn(InvoiceService, 'getInvoiceById')
      .mockResolvedValueOnce({ status: 'sent' } as any)
      .mockResolvedValueOnce({ status: 'paid', total_amount: '500.00' } as any)
      .mockResolvedValueOnce({ status: 'paid', total_amount: '500.00', booking_id: 'b1', client_id: 'c1', gst_type: 'exempt', hsn_sac_code: '998389', invoice_number: 'INV' } as any)
    await expect(InvoiceService.createCreditNote({} as any, 'i1', 's1', { amount: '10.00', reason: 'valid reason text' }, 'u1')).rejects.toMatchObject({ code: 'CONFLICT' })
    await expect(InvoiceService.createCreditNote({} as any, 'i1', 's1', { amount: '600.00', reason: 'valid reason text' }, 'u1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    vi.spyOn(InvoiceService, 'createInvoice').mockResolvedValue({ id: 'cn1', invoice_type: 'credit_note' } as any)
    await expect(InvoiceService.createCreditNote({} as any, 'i1', 's1', { amount: '200.00', reason: 'valid reason text' }, 'u1')).resolves.toMatchObject({ id: 'cn1' })
  })
})

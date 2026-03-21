import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { contractRepo } from '@/lib/repositories/contract.repo'
import { ContractService, replaceVariables } from '@/lib/services/contract.service'
import * as support from '@/lib/services/contract.service.support'

vi.mock('@/lib/repositories/contract.repo', () => ({
  contractRepo: {
    getContracts: vi.fn(),
    getContractById: vi.fn(),
    getContractByToken: vi.fn(),
    createContract: vi.fn(),
    updateContract: vi.fn(),
    markContractSent: vi.fn(),
    markContractViewed: vi.fn(),
    markContractSigned: vi.fn(),
    updateReminderSent: vi.fn(),
    softDeleteContract: vi.fn(),
    getTemplates: vi.fn(),
    getTemplateById: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    softDeleteTemplate: vi.fn(),
    getDefaultTemplate: vi.fn(),
    ensureDefaultTemplates: vi.fn(),
  },
}))

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/resend/client', () => ({ sendEmail: vi.fn().mockResolvedValue({}) }))

const mockSupabase = {
  from: vi.fn().mockImplementation(() => ({
    insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
  })),
} as any

describe('ContractService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('replaceVariables replaces placeholders, keeps unknown vars, and strips script tags', () => {
    const html = '<p>{{client_name}} and {{client_name}} owe {{total_amount}}</p><script>alert(1)</script><p>{{unknown}}</p>'
    const result = replaceVariables(html, { client_name: 'Priya Sharma', total_amount: '85000' })

    expect(result).toContain('Priya Sharma and Priya Sharma owe 85000')
    expect(result).toContain('{{unknown}}')
    expect(result).not.toContain('<script>')
  })

  it('createContract throws NOT_FOUND when booking lookup fails', async () => {
    vi.spyOn(support, 'getBookingAndStudio').mockRejectedValue({ code: 'NOT_FOUND', status: 404 })

    await expect(
      ContractService.createContract(mockSupabase, 'studio-1', { booking_id: 'b1' } as any, 'user-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('createContract throws 422 when no template is available', async () => {
    vi.spyOn(support, 'getBookingAndStudio').mockResolvedValue({
      booking: { id: 'b1', client_id: 'c1', event_type: 'wedding', event_date: '2026-05-18' },
      studio: { id: 's1', name: 'XYZ Photography', email: 'studio@test.com' },
    } as any)
    vi.spyOn(support, 'getClient').mockResolvedValue({ id: 'c1', full_name: 'Priya Sharma' } as any)
    vi.mocked(contractRepo.getDefaultTemplate).mockResolvedValue(null)

    await expect(
      ContractService.createContract(mockSupabase, 'studio-1', { booking_id: 'b1' } as any, 'user-1')
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 422 })
  })

  it('createContract uses matching template and returns detail', async () => {
    vi.spyOn(support, 'getBookingAndStudio').mockResolvedValue({
      booking: {
        id: 'b1',
        client_id: 'c1',
        event_type: 'wedding',
        event_date: '2026-05-18',
        venue_name: 'Hotel Grand, Surat',
        package_snapshot: { name: 'Wedding Full Day' },
        total_amount: 85000,
        advance_amount: 25500,
        balance_amount: 59500,
      },
      studio: { id: 's1', name: 'XYZ Photography', phone: '9876543210', email: 'studio@test.com' },
    } as any)
    vi.spyOn(support, 'getClient').mockResolvedValue({
      id: 'c1',
      full_name: 'Priya Sharma',
      email: 'priya@test.com',
      phone: '9876543210',
    } as any)
    vi.mocked(contractRepo.getDefaultTemplate).mockResolvedValue({
      id: 'tpl-1',
      content_html: '<p>{{client_name}} - {{event_date}}</p>',
    } as any)
    vi.mocked(contractRepo.createContract).mockResolvedValue({ id: 'contract-1', access_token: 't1' } as any)
    vi.mocked(contractRepo.getContractById).mockResolvedValue({
      id: 'contract-1',
      content_html: '<p>Priya Sharma - 18 May 2026</p>',
      status: 'draft',
    } as any)

    const result = await ContractService.createContract(
      mockSupabase,
      'studio-1',
      { booking_id: 'b1' } as any,
      'user-1'
    )

    expect(contractRepo.createContract).toHaveBeenCalledWith(
      mockSupabase,
      expect.objectContaining({
        template_id: 'tpl-1',
        content_html: expect.stringContaining('Priya Sharma'),
      })
    )
    expect(result.id).toBe('contract-1')
  })

  it('updateContract throws CONFLICT when current status is sent', async () => {
    vi.mocked(contractRepo.getContractById).mockResolvedValue({ id: 'c1', status: 'sent' } as any)

    await expect(
      ContractService.updateContract(mockSupabase, 'c1', 's1', { notes: 'x' }, 'u1')
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('deleteContract delegates to repo', async () => {
    await ContractService.deleteContract(mockSupabase, 'c1', 's1')
    expect(contractRepo.softDeleteContract).toHaveBeenCalledWith(mockSupabase, 'c1', 's1')
  })

  it('sendContract rejects signed contracts', async () => {
    vi.spyOn(ContractService, 'getContractById').mockResolvedValueOnce({ id: 'c1', status: 'signed' } as any)

    await expect(ContractService.sendContract(mockSupabase, 'c1', 's1', 'u1')).rejects.toMatchObject({
      code: 'CONFLICT',
    })
  })

  it('sendContract marks draft as sent and fires notifications', async () => {
    vi.spyOn(ContractService, 'getContractById')
      .mockResolvedValueOnce({ id: 'c1', status: 'draft' } as any)
      .mockResolvedValueOnce({
        id: 'c1',
        status: 'sent',
        booking_id: 'b1',
        client_id: 'c1',
        client_name: 'Priya Sharma',
        client_email: 'priya@test.com',
        access_token: 't1',
      } as any)
    vi.spyOn(support, 'getStudioInfo').mockResolvedValue({ name: 'XYZ Photography' } as any)
    const notifySpy = vi.spyOn(support, 'notifyContractSend').mockResolvedValue(undefined)

    const result = await ContractService.sendContract(mockSupabase, 'c1', 's1', 'u1')

    expect(contractRepo.markContractSent).toHaveBeenCalledWith(mockSupabase, 'c1')
    expect(notifySpy).toHaveBeenCalled()
    expect(result.status).toBe('sent')
  })

  it('remindContract enforces the 24 hour rule', async () => {
    vi.spyOn(ContractService, 'getContractById').mockResolvedValue({
      id: 'c1',
      status: 'sent',
      reminder_sent_at: new Date().toISOString(),
    } as any)

    await expect(ContractService.remindContract(mockSupabase, 'c1', 's1', 'u1')).rejects.toMatchObject({
      code: 'CONFLICT',
    })
  })

  it('remindContract updates timestamp when old reminder has expired', async () => {
    vi.spyOn(ContractService, 'getContractById').mockResolvedValue({
      id: 'c1',
      status: 'sent',
      booking_id: 'b1',
      client_id: 'c1',
      client_name: 'Priya Sharma',
      client_email: 'priya@test.com',
      access_token: 't1',
      reminder_sent_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    } as any)
    vi.mocked(contractRepo.updateReminderSent).mockResolvedValue({
      reminder_sent_at: '2026-03-19T10:00:00.000Z',
    } as any)
    vi.spyOn(support, 'getStudioInfo').mockResolvedValue({ name: 'XYZ Photography' } as any)
    vi.spyOn(support, 'notifyContractSend').mockResolvedValue(undefined)

    const result = await ContractService.remindContract(mockSupabase, 'c1', 's1', 'u1')
    expect(result.reminded_at).toBe('2026-03-19T10:00:00.000Z')
  })

  it('signContract rejects already signed contracts', async () => {
    vi.mocked(createAdminClient).mockReturnValue(mockSupabase)
    vi.mocked(contractRepo.getContractByToken).mockResolvedValue({ id: 'c1', status: 'signed' } as any)

    await expect(
      ContractService.signContract('token', {
        signatureData: 'Priya Sharma',
        ipAddress: '127.0.0.1',
        userAgent: 'Vitest',
      })
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('signContract marks contract signed and updates the booking', async () => {
    const updateEq = vi.fn().mockResolvedValue({ data: {}, error: null })
    const update = vi.fn().mockReturnValue({ eq: updateEq })
    const insert = vi.fn().mockResolvedValue({ data: {}, error: null })
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockImplementation((table: string) => ({
        update: table === 'bookings' ? update : vi.fn(),
        insert,
      })),
    } as any)
    vi.mocked(contractRepo.getContractByToken).mockResolvedValue({
      id: 'c1',
      studio_id: 's1',
      studio_name: 'XYZ Photography',
      studio_email: 'studio@test.com',
      booking_id: 'b1',
      booking_title: 'Priya Wedding',
      client_name: 'Priya Sharma',
      client_email: 'priya@test.com',
      status: 'sent',
    } as any)
    vi.mocked(contractRepo.markContractSigned).mockResolvedValue({
      id: 'c1',
      booking_id: 'b1',
      signed_at: '2026-03-19T11:00:00.000Z',
    } as any)
    const emailSpy = vi.spyOn(support, 'sendContractEmail').mockResolvedValue(undefined)

    const result = await ContractService.signContract('token', {
      signatureData: 'Priya Sharma',
      ipAddress: '127.0.0.1',
      userAgent: 'Vitest',
    })

    expect(contractRepo.markContractSigned).toHaveBeenCalledWith(
      expect.anything(),
      'c1',
      'Priya Sharma',
      '127.0.0.1',
      'Vitest'
    )
    expect(updateEq).toHaveBeenCalledWith('id', 'b1')
    expect(emailSpy).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      signed_at: '2026-03-19T11:00:00.000Z',
      booking_id: 'b1',
    })
  })
})

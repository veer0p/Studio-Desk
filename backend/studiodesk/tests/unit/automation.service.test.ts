import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AutomationService, DEFAULT_AUTOMATION_SETTINGS, automationTransport } from '@/lib/services/automation.service'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/resend/client'
import { checkAndIncrementRateLimitWithCustomMax } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn() }))
vi.mock('@/lib/resend/client', () => ({ sendEmail: vi.fn().mockResolvedValue({}) }))
vi.mock('@/lib/logger', () => ({ logError: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/rate-limit', () => ({ checkAndIncrementRateLimitWithCustomMax: vi.fn().mockResolvedValue(undefined) }))

function makeBuilder(result: any, capture?: Record<string, any>) {
  const self: any = {
    select: vi.fn((_cols?: any, opts?: any) => { self.mode = opts?.head ? 'count' : self.mode; return self }),
    eq: vi.fn(() => self),
    gte: vi.fn(() => self),
    lte: vi.fn(() => self),
    order: vi.fn(() => self),
    range: vi.fn(async () => result.rows ?? { data: [], count: 0, error: null }),
    maybeSingle: vi.fn(async () => result.row ? { data: result.row, error: null } : { count: result.count ?? 0, error: null }),
    single: vi.fn(async () => result.row ? { data: result.row, error: null } : { data: result.insertRow ?? null, error: null }),
    then: (resolve: any, reject: any) => Promise.resolve(result.rows ?? result.row ? { data: result.rows ?? result.row, count: result.count ?? (result.rows?.length ?? 0), error: null } : { count: result.count ?? 0, error: null }).then(resolve, reject),
    insert: vi.fn((payload: any) => {
      capture?.inserted?.push(payload)
      return { select: vi.fn(() => ({ single: vi.fn(async () => ({ data: result.insertRow ?? { id: 'row-1' }, error: null })) })) }
    }),
    upsert: vi.fn((payload: any) => {
      capture?.upserted?.push(payload)
      return { select: vi.fn(async () => ({ data: payload, error: null })) }
    }),
    update: vi.fn((payload: any) => {
      capture?.updated?.push(payload)
      return { eq: vi.fn(async () => ({ error: null })) }
    }),
    mode: 'rows',
  }
  return self
}

function makeSupabase(config: Record<string, any> = {}) {
  const captures: Record<string, any> = { inserted: [], upserted: [], updated: [] }
  const tables: Record<string, any> = {
    automation_settings: makeBuilder({ count: config.settingsCount ?? 0, rows: config.settingsRows ?? [], insertRow: config.settingsRow }, captures),
    automation_log: makeBuilder({ rows: config.logRows ?? [], count: config.logRows?.length ?? 0, insertRow: config.logRow ?? { id: 'log-1' } }, captures),
    whatsapp_templates: makeBuilder({ rows: config.whatsappRows ?? [], count: config.whatsappRows?.length ?? 0 }, captures),
    studios: makeBuilder({ row: config.studioRow ?? null }, captures),
    bookings: makeBuilder({ row: config.bookingRow ?? null }, captures),
    leads: makeBuilder({ row: config.leadRow ?? null }, captures),
    clients: makeBuilder({ row: config.clientRow ?? null }, captures),
  }
  return { state: captures, from: vi.fn((table: string) => tables[table] ?? makeBuilder({ row: null }, captures)) } as any
}

function makeAdmin(setting: any, logRow = { id: 'log-1' }) {
  const inserted: any[] = []
  const updated: any[] = []
  const settingsChain: any = {
    eq: vi.fn(() => settingsChain),
    maybeSingle: vi.fn(async () => ({ data: setting, error: null })),
  }
  const logInsert = {
    select: vi.fn(() => ({ single: vi.fn(async () => ({ data: logRow, error: null })) })),
  }
  const logUpdate = {
    eq: vi.fn(async (field: string, value: string) => ({ error: null })),
  }
  return {
    state: { inserted, updated },
    from: vi.fn((table: string) => {
      if (table === 'automation_settings') return { select: vi.fn(() => settingsChain) }
      if (table === 'automation_log') return { insert: vi.fn((payload: any) => { inserted.push(payload); return logInsert }), update: vi.fn((payload: any) => { updated.push(payload); return logUpdate }) }
      return { select: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: null, error: null })) })) }
    }),
  } as any
}

describe('AutomationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('replaceTemplateVariables replaces all placeholders and truncates long output', () => {
    const text = AutomationService.replaceTemplateVariables('Hi {{name}} {{name}} {{missing}}', { name: 'Priya' })
    expect(text).toBe('Hi Priya Priya {{missing}}')
    expect(AutomationService.replaceTemplateVariables('x<script>alert(1)</script>y', {})).toBe('xy')
    expect(AutomationService.replaceTemplateVariables('a'.repeat(2000), {})).toHaveLength(1500)
  })

  it('sendAutomation respects disabled settings and logs send outcomes', async () => {
    const admin = makeAdmin({ is_enabled: false, send_whatsapp: true, send_email: false, automation_type: 'contract_sent' })
    vi.mocked(createAdminClient).mockReturnValue(admin)
    const wa = vi.spyOn(automationTransport, 'sendWhatsApp').mockResolvedValue({ messageId: 'wamid-1' } as any)

    await expect(AutomationService.sendAutomation({
      studioId: 'studio-1',
      automationType: 'contract_sent',
      recipientPhone: '9876543210',
      recipientName: 'Priya',
      variables: { client_name: 'Priya', studio_name: 'Studio', contract_url: 'https://example.com' },
    })).resolves.toBeUndefined()
    expect(wa).not.toHaveBeenCalled()

    vi.mocked(createAdminClient).mockReturnValue(makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'contract_sent' }))
    const sentAdmin = makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'contract_sent' })
    vi.mocked(createAdminClient).mockReturnValue(sentAdmin)
    await AutomationService.sendAutomation({
      studioId: 'studio-1',
      automationType: 'contract_sent',
      recipientPhone: '9876543210',
      recipientName: 'Priya',
      variables: { client_name: 'Priya', studio_name: 'Studio', contract_url: 'https://example.com' },
    })
    expect(sentAdmin.state.inserted[0].status).toBe('pending')
    expect(sentAdmin.state.updated.at(-1).status).toBe('sent')
    expect(sendEmail).not.toHaveBeenCalled()

    const failedAdmin = makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'contract_sent' })
    vi.mocked(createAdminClient).mockReturnValue(failedAdmin)
    wa.mockRejectedValueOnce(new Error('boom'))
    await expect(AutomationService.sendAutomation({
      studioId: 'studio-1',
      automationType: 'contract_sent',
      recipientPhone: '9876543210',
      recipientName: 'Priya',
      variables: { client_name: 'Priya', studio_name: 'Studio', contract_url: 'https://example.com' },
    })).resolves.toBeUndefined()
    expect(failedAdmin.state.updated.at(-1).status).toBe('failed')
  })

  it('sendAutomation skips missing recipients without throwing', async () => {
    const admin = makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'gallery_ready' })
    vi.mocked(createAdminClient).mockReturnValue(admin)
    await AutomationService.sendAutomation({
      studioId: 'studio-1',
      automationType: 'gallery_ready',
      recipientName: 'Priya',
      variables: { client_name: 'Priya', studio_name: 'Studio', gallery_url: 'https://example.com' },
    })
    expect(admin.state.updated.at(-1).status).toBe('skipped')
  })

  it('getSettings seeds defaults and returns enriched settings', async () => {
    const supabase = makeSupabase({ settingsCount: 0, settingsRows: [] })
    const settings = await AutomationService.getSettings(supabase, 'studio-1')
    expect(settings).toHaveLength(15)
    expect(settings[0]).toMatchObject({ label: expect.any(String), description: expect.any(String), trigger: expect.any(String) })
    expect(supabase.state.inserted[0]).toHaveLength(6)
    expect(DEFAULT_AUTOMATION_SETTINGS.find((row) => row.automation_type === 'shoot_reminder')?.delay_days).toBe(2)
  })

  it('updateSettings validates values and persists merged rows', async () => {
    const supabase = makeSupabase({ settingsRow: { id: 's1', automation_type: 'shoot_reminder', is_enabled: true, trigger_offset_days: 1, trigger_delay_hours: 0, send_whatsapp: true, send_email: false, custom_message: null, custom_subject: null } })
    await expect(AutomationService.updateSettings(supabase, 'studio-1', [{ automation_type: 'shoot_reminder', delay_days: 31 } as any])).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(AutomationService.updateSettings(supabase, 'studio-1', [{ automation_type: 'shoot_reminder', delay_hours: 24 } as any])).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(AutomationService.updateSettings(supabase, 'studio-1', [{ automation_type: 'shoot_reminder', send_time: '9am' } as any])).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    vi.spyOn(AutomationService, 'getSettings').mockResolvedValue([{ id: 's1', automation_type: 'shoot_reminder', label: 'Shoot Reminder', description: 'Sent before a shoot date', trigger: 'Before shoot date', is_enabled: false, channel: 'whatsapp', delay_days: 1, delay_hours: 0, send_time: '10:00', updated_at: new Date().toISOString() } as any])
    const updated = await AutomationService.updateSettings(supabase, 'studio-1', [{ automation_type: 'shoot_reminder', is_enabled: false, delay_days: 2, channel: 'whatsapp' } as any])
    expect(supabase.state.upserted[0][0]).toMatchObject({ trigger_offset_days: 2, is_enabled: false, send_whatsapp: true, send_email: false })
    expect(updated[0].is_enabled).toBe(false)
  })

  it('triggerManual and sendTestMessage call sendAutomation with test data', async () => {
    const supabase = makeSupabase({
      studioRow: { id: 'studio-1', name: 'Studio' },
      bookingRow: { id: 'booking-1', client_id: 'client-1', title: 'Priya Wedding', event_type: 'wedding', event_date: '2026-05-18', venue_name: 'Hotel Grand', total_amount: 85000, advance_amount: 25500, balance_amount: 59500, package_snapshot: { turnaround_days: 30 } },
      clientRow: { id: 'client-1', full_name: 'Priya Sharma', phone: '9876543210', email: 'priya@test.com', whatsapp: '9876543210' },
      leadRow: { id: 'lead-1', client_id: 'client-1', event_type: 'portrait', event_date_approx: '2026-06-01', venue: 'Studio One' },
    })
    const admin = makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'shoot_reminder' })
    vi.mocked(createAdminClient).mockReturnValue(admin)
    await expect(AutomationService.triggerManual(supabase, 'studio-1', { automation_type: 'shoot_reminder', booking_id: 'booking-1' }, 'user-1')).resolves.toEqual({ message: 'Automation triggered. Check the log for delivery status.' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(admin.state.inserted[0]).toMatchObject({ automation_type: 'shoot_reminder_client', recipient_phone: '9876543210' })
    await expect(AutomationService.triggerManual(supabase, 'studio-1', { automation_type: 'shoot_reminder' } as any, 'user-1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(AutomationService.triggerManual(makeSupabase({ studioRow: { id: 'studio-1', name: 'Studio' } }), 'studio-1', { automation_type: 'shoot_reminder', booking_id: 'missing' }, 'user-1')).rejects.toMatchObject({ code: 'NOT_FOUND' })

    const testAdmin = makeAdmin({ is_enabled: true, send_whatsapp: true, send_email: false, automation_type: 'gallery_ready' })
    vi.mocked(createAdminClient).mockReturnValue(testAdmin)
    await expect(AutomationService.sendTestMessage(supabase, 'studio-1', { automation_type: 'gallery_ready', phone: '123' } as any, 'user-1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    vi.mocked(checkAndIncrementRateLimitWithCustomMax).mockResolvedValue(undefined)
    const test = await AutomationService.sendTestMessage(supabase, 'studio-1', { automation_type: 'gallery_ready', phone: '9876543210' }, 'user-1')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(test.message).toBe('Test message sent to +919876543210')
    expect(testAdmin.state.inserted.at(-1)).toMatchObject({ automation_type: 'gallery_ready', recipient_phone: '9876543210' })
    expect(checkAndIncrementRateLimitWithCustomMax).toHaveBeenCalledWith('automation_test:studio-1', 10)
  })

  it('getTemplates and getStats return API-shaped data', async () => {
    const supabase = makeSupabase({
      whatsappRows: [{ id: 'tpl-1', automation_type: 'gallery_ready', template_name: 'Gallery Ready', body_text: 'Hi {{client_name}}', variables: ['client_name'], is_active: true }],
      logRows: [
        { id: 'l1', automation_type: 'gallery_ready', channel: 'whatsapp', status: 'sent', recipient_name: 'Priya', recipient_phone: '9876543210', message_body: 'Hi', provider_message_id: 'wamid-1', scheduled_for: '2026-03-01T10:00:00Z', sent_at: '2026-03-01T10:00:01Z', created_at: '2026-03-01T10:00:00Z' },
        { id: 'l2', automation_type: 'gallery_ready', channel: 'email', status: 'failed', recipient_name: 'Priya', recipient_email: 'p@test.com', message_body: 'Hi', failure_reason: 'No email', created_at: '2026-03-01T11:00:00Z' },
      ],
    })
    const templates = await AutomationService.getTemplates(supabase, 'studio-1')
    expect(templates.filter((row) => row.type === 'built_in')).toHaveLength(15)
    expect(templates.find((row) => row.type === 'custom')).toMatchObject({ automation_type: 'gallery_ready', variables: ['client_name'] })

    const stats = await AutomationService.getStats(supabase, 'studio-1', 'this_month')
    expect(stats).toMatchObject({ total_sent: 1, total_failed: 1, by_channel: { whatsapp: 1, email: 1, both: 0 } })
    expect(stats.by_type.gallery_ready).toBe(2)
  })
})

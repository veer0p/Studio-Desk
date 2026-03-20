import { createAdminClient } from '@/lib/supabase/admin'
import { Errors, ServiceError } from '@/lib/errors'
import { contractRepo } from '@/lib/repositories/contract.repo'
import {
  buildVariables,
  ContractDetail,
  ContractTemplate,
  Db,
  getBookingAndStudio,
  getClient,
  getStudioInfo,
  logInsert,
  notifyContractSend,
  PublicContractView,
  replaceVariables,
  sanitizeHtml,
  sendContractEmail,
  toDateString,
} from '@/lib/services/contract.service.support'
import type {
  ContractsQueryInput,
  CreateContractInput,
  CreateTemplateInput,
  UpdateContractInput,
  UpdateTemplateInput,
} from '@/lib/validations/contract.schema'

export const DEFAULT_TEMPLATES = [
  {
    name: 'Wedding Photography Agreement',
    event_type: 'wedding',
    content_html: `
<h1>Photography & Videography Agreement</h1>
<p>This agreement is made between <strong>{{studio_name}}</strong> ("Studio") and <strong>{{client_name}}</strong> ("Client").</p>
<h2>Event Details</h2>
<p><strong>Event Date:</strong> {{event_date}}<br><strong>Venue:</strong> {{venue}}<br><strong>Event Type:</strong> {{event_type}}</p>
<h2>Services & Deliverables</h2>
<p>Package: {{package_name}}<br>Deliverables will be provided within {{turnaround_days}} days of the event.</p>
<h2>Payment Terms</h2>
<p><strong>Total Amount:</strong> &#8377;{{total_amount}}<br><strong>Advance (due on signing):</strong> &#8377;{{advance_amount}}<br><strong>Balance (due before delivery):</strong> &#8377;{{balance_amount}}</p>
<h2>Cancellation Policy</h2>
<p>Advance payment is non-refundable. Cancellation within 30 days of event: 50% of total amount. Cancellation within 7 days: full amount forfeited.</p>
<h2>Usage Rights</h2>
<p>The Studio retains the right to use images for portfolio and marketing purposes unless specifically requested otherwise in writing.</p>
<h2>Agreement</h2>
<p>By signing below, both parties agree to the terms stated in this agreement.</p>
<p>Date: {{today_date}}</p>`,
  },
  {
    name: 'Corporate Event Agreement',
    event_type: 'corporate',
    content_html: `<h1>Corporate Event Agreement</h1><p>This agreement is between <strong>{{studio_name}}</strong> and <strong>{{client_name}}</strong> for {{event_type}} coverage on {{event_date}} at {{venue}}.</p><p>Package: {{package_name}}. Total fee: &#8377;{{total_amount}} with advance of &#8377;{{advance_amount}}.</p><p>Delivery timeline: {{turnaround_days}} days.</p><p>Date: {{today_date}}</p>`,
  },
  {
    name: 'Portrait Session Agreement',
    event_type: 'portrait',
    content_html: `<h1>Portrait Session Agreement</h1><p><strong>{{studio_name}}</strong> will photograph <strong>{{client_name}}</strong> on {{event_date}} at {{venue}}.</p><p>Package: {{package_name}}. Total fee: &#8377;{{total_amount}}.</p><p>Balance due before final delivery. Delivery timeline: {{turnaround_days}} days.</p><p>Date: {{today_date}}</p>`,
  },
  {
    name: 'General Photography Agreement',
    event_type: null,
    is_default: true,
    content_html: `<h1>Photography Agreement</h1><p>This agreement is made between <strong>{{studio_name}}</strong> and <strong>{{client_name}}</strong> for {{event_type}} coverage on {{event_date}}.</p><p>Venue: {{venue}}. Package: {{package_name}}. Total fee: &#8377;{{total_amount}}.</p><p>Delivery timeline: {{turnaround_days}} days.</p><p>Date: {{today_date}}</p>`,
  },
] as const

function templateSeed() {
  return DEFAULT_TEMPLATES.map((template) => ({
    ...template,
    version: 1,
    is_active: true,
    is_default: Boolean(template.is_default),
    content_html: sanitizeHtml(template.content_html),
  }))
}

export { buildVariables, replaceVariables }
export type { ContractDetail, ContractTemplate, PublicContractView }

export const ContractService = {
  async getContracts(supabase: Db, studioId: string, params: ContractsQueryInput) {
    return contractRepo.getContracts(supabase, studioId, params)
  },

  async getContractById(supabase: Db, contractId: string, studioId: string): Promise<ContractDetail> {
    const contract = await contractRepo.getContractById(supabase, contractId, studioId)
    if (!contract) throw Errors.notFound('Contract')
    return contract as ContractDetail
  },

  async createContract(supabase: Db, studioId: string, data: CreateContractInput, userId: string): Promise<ContractDetail> {
    const { booking, studio } = await getBookingAndStudio(supabase, data.booking_id, studioId)
    const client = await getClient(supabase, booking.client_id, studioId)
    const template = data.template_id
      ? await contractRepo.getTemplateById(supabase, data.template_id, studioId)
      : await contractRepo.getDefaultTemplate(supabase, studioId, booking.event_type)
    if (!data.custom_content && !template) {
      throw new ServiceError('No contract template found. Create a template in Settings first.', 'VALIDATION_ERROR', 422)
    }
    const content = sanitizeHtml(data.custom_content ?? replaceVariables(String(template?.content_html ?? ''), buildVariables(booking, client, studio)))
    const created = await contractRepo.createContract(supabase, {
      studio_id: studioId,
      booking_id: data.booking_id,
      client_id: booking.client_id,
      template_id: data.template_id ?? template?.id ?? null,
      status: 'draft',
      content_html: content,
      notes: data.notes ?? null,
    })
    logInsert(supabase, 'audit_logs', {
      studio_id: studioId,
      user_id: userId,
      action: 'create',
      entity_type: 'contracts',
      entity_id: created.id,
      entity_snapshot: { booking_id: data.booking_id, template_id: data.template_id ?? template?.id ?? null },
    })
    return this.getContractById(supabase, created.id, studioId)
  },

  async updateContract(supabase: Db, contractId: string, studioId: string, data: UpdateContractInput, userId: string): Promise<ContractDetail> {
    const current = await contractRepo.getContractById(supabase, contractId, studioId)
    if (!current) throw Errors.notFound('Contract')
    if (current.status !== 'draft') throw Errors.conflict('Sent and signed contracts cannot be edited.')
    await contractRepo.updateContract(supabase, contractId, studioId, {
      content_html: data.content_html ? sanitizeHtml(data.content_html) : undefined,
      notes: data.notes,
    })
    logInsert(supabase, 'audit_logs', {
      studio_id: studioId,
      user_id: userId,
      action: 'update',
      entity_type: 'contracts',
      entity_id: contractId,
      entity_snapshot: { fields_changed: Object.keys(data) },
    })
    return this.getContractById(supabase, contractId, studioId)
  },

  async deleteContract(supabase: Db, contractId: string, studioId: string) {
    await contractRepo.softDeleteContract(supabase, contractId, studioId)
  },

  async sendContract(supabase: Db, contractId: string, studioId: string, userId: string): Promise<ContractDetail> {
    const contract = await this.getContractById(supabase, contractId, studioId)
    if (contract.status === 'signed') throw Errors.conflict('Signed contracts cannot be resent')
    if (contract.status === 'cancelled') throw Errors.conflict('Cancelled contracts cannot be sent')
    await contractRepo.markContractSent(supabase, contractId)
    const [updated, studio] = await Promise.all([this.getContractById(supabase, contractId, studioId), getStudioInfo(supabase, studioId)])
    notifyContractSend(supabase, { ...updated, studio_id: studioId }, studio.name, userId)
    return updated
  },

  async remindContract(supabase: Db, contractId: string, studioId: string, userId: string) {
    const contract = await this.getContractById(supabase, contractId, studioId)
    if (contract.status !== 'sent') throw Errors.validation('Reminders can only be sent for contracts awaiting signature')
    if (contract.reminder_sent_at && Date.now() - new Date(contract.reminder_sent_at).getTime() < 24 * 60 * 60 * 1000) {
      throw Errors.conflict('A reminder was already sent in the last 24 hours. Please wait before sending another.')
    }
    const [updated, studio] = await Promise.all([contractRepo.updateReminderSent(supabase, contractId), getStudioInfo(supabase, studioId)])
    notifyContractSend(supabase, { ...contract, studio_id: studioId, reminder_sent_at: updated.reminder_sent_at }, studio.name, userId, true)
    return { reminded_at: updated.reminder_sent_at }
  },

  async viewContract(token: string): Promise<PublicContractView> {
    const supabase = createAdminClient()
    const contract = await contractRepo.getContractByToken(supabase, token)
    if (!contract) throw Errors.notFound('Contract')
    contractRepo.markContractViewed(supabase, contract.id).catch(() => {})
    return {
      id: contract.id,
      status: contract.status,
      content_html: sanitizeHtml(contract.content_html),
      signed_at: contract.signed_at ?? null,
      studio: {
        name: contract.studio_name,
        logo_url: contract.studio_logo_url,
        brand_color: contract.studio_brand_color ?? '#1A3C5E',
        phone: contract.studio_phone,
        email: contract.studio_email,
      },
      client_name: contract.client_name,
      booking: {
        title: contract.booking_title,
        event_type: contract.event_type,
        event_date: toDateString(contract.event_date),
        venue_name: contract.venue_name,
      },
    }
  },

  async signContract(token: string, params: { signatureData: string; ipAddress: string; userAgent: string }) {
    const supabase = createAdminClient()
    const contract = await contractRepo.getContractByToken(supabase, token)
    if (!contract) throw Errors.notFound('Contract')
    if (!params.signatureData.trim()) throw Errors.validation('Signature is required')
    if (params.signatureData.length > 50000) throw Errors.validation('Signature data too large')
    if (contract.status !== 'sent') {
      throw Errors.conflict(contract.status === 'signed' ? 'This contract has already been signed' : 'This contract is not available for signing')
    }
    const signed = await contractRepo.markContractSigned(supabase, contract.id, params.signatureData, params.ipAddress, params.userAgent)
    await supabase.from('bookings').update({ status: 'contract_signed', updated_at: new Date().toISOString() }).eq('id', contract.booking_id)
    logInsert(supabase, 'booking_activity_feed', {
      studio_id: contract.studio_id,
      booking_id: contract.booking_id,
      event_type: 'contract_signed',
      actor_type: 'client',
      metadata: { signed_ip: params.ipAddress, signed_at: signed.signed_at },
    })
    sendContractEmail(contract.studio_id, contract.client_email, `Your contract with ${contract.studio_name} has been signed`, `<p>Your contract for <strong>${contract.booking_title}</strong> has been signed.</p>`)
    sendContractEmail(contract.studio_id, contract.studio_email, `${contract.client_name} has signed the contract for ${contract.booking_title}`, `<p>${contract.client_name} signed the contract.</p>`)
    return { signed_at: signed.signed_at, booking_id: contract.booking_id }
  },

  async getTemplates(supabase: Db, studioId: string): Promise<ContractTemplate[]> {
    const admin = createAdminClient()
    const seedPromise = contractRepo.ensureDefaultTemplates(admin, studioId, templateSeed()).catch(() => {})
    let templates = await contractRepo.getTemplates(supabase, studioId)
    if (!templates.length) {
      await seedPromise
      templates = await contractRepo.getTemplates(supabase, studioId)
      if (!templates.length) {
        templates = await contractRepo.getTemplates(admin, studioId)
      }
    }
    return templates as ContractTemplate[]
  },

  async createTemplate(supabase: Db, studioId: string, data: CreateTemplateInput): Promise<ContractTemplate> {
    return contractRepo.createTemplate(supabase, {
      studio_id: studioId,
      name: data.name,
      event_type: data.event_type ?? null,
      content_html: sanitizeHtml(data.content_html),
      version: 1,
      is_default: data.is_default ?? false,
      is_active: true,
    }) as Promise<ContractTemplate>
  },

  async updateTemplate(supabase: Db, templateId: string, studioId: string, data: UpdateTemplateInput): Promise<ContractTemplate> {
    const current = await contractRepo.getTemplateById(supabase, templateId, studioId)
    if (!current) throw Errors.notFound('Contract template')
    return contractRepo.updateTemplate(supabase, templateId, studioId, {
      ...data,
      content_html: data.content_html ? sanitizeHtml(data.content_html) : undefined,
    }) as Promise<ContractTemplate>
  },

  async deleteTemplate(supabase: Db, templateId: string, studioId: string) {
    await contractRepo.softDeleteTemplate(supabase, templateId, studioId)
  },
}

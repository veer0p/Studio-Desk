import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { proposalRepo, ProposalRow, ProposalLineItemRow } from '@/lib/repositories/proposal.repo'
import { getBookingById, getClientById } from '@/lib/supabase/queries'
import { calculateGst } from '@/lib/gst/calculator'
import { generateSecureToken } from '@/lib/crypto'
import { Errors } from '@/lib/errors'
import { sendEmail } from '@/lib/resend/client'
import { env } from '@/lib/env'
import { logError } from '@/lib/logger'

export interface ProposalLineItem {
  id: string
  sort_order: number
  item_type: string
  name: string
  description: string | null
  hsn_sac_code: string | null
  quantity: string
  unit_price: string
  total_price: string
  addon_id: string | null
}

export interface ProposalSummary {
  id: string
  booking_id: string
  booking_title: string
  event_type: string
  event_date: string | null
  client_id: string
  client_name: string
  client_phone: string | null
  version: number
  status: string
  subtotal: string
  total_amount: string
  valid_until: string | null
  sent_at: string | null
  viewed_at: string | null
  accepted_at: string | null
  created_at: string
}

export interface ProposalDetail extends ProposalSummary {
  gst_type: string
  cgst_amount: string
  sgst_amount: string
  igst_amount: string
  notes: string | null
  is_expired: boolean
  line_items: ProposalLineItem[]
  pdf_url: string | null
}

export interface PublicProposalView {
  id: string
  status: string
  subtotal: string
  cgst_amount: string
  sgst_amount: string
  igst_amount: string
  total_amount: string
  valid_until: string | null
  is_expired: boolean
  notes: string | null
  line_items: ProposalLineItem[]
  studio: {
    name: string
    logo_url: string | null
    brand_color: string
    phone: string | null
    email: string | null
  }
  client_name: string
  booking: {
    title: string
    event_type: string
    event_date: string | null
    venue_name: string | null
  }
}

function formatAmount(value: unknown): string {
  return Number(value ?? 0).toFixed(2)
}

export const ProposalService = {
  async getProposals(supabase: SupabaseClient<Database>, studioId: string, params: any) {
    // 1. Fire-and-forget: Auto-expire stale proposals
    proposalRepo.checkExpiredProposals(supabase, studioId).catch((err) =>
      logError({ message: 'Auto-expire failed', context: { studioId, err } })
    )

    // 2. Fetch
    return proposalRepo.getProposals(supabase, studioId, params)
  },

  async getProposalById(
    supabase: SupabaseClient<Database>,
    proposalId: string,
    studioId: string
  ): Promise<ProposalDetail> {
    const [proposal, lineItems] = await Promise.all([
      proposalRepo.getProposalById(supabase, proposalId, studioId),
      proposalRepo.getProposalLineItems(supabase, proposalId),
    ])

    if (!proposal) throw Errors.notFound('Proposal')

    const isExpired =
      proposal.status === 'sent' &&
      proposal.valid_until &&
      new Date(proposal.valid_until) < new Date()

    return {
      ...proposal,
      is_expired: !!isExpired,
      line_items: (lineItems || []).map((item: any) => ({
        ...item,
        quantity: String(item.quantity),
        unit_price: formatAmount(item.unit_price),
        total_price: formatAmount(item.total_price),
      })),
      subtotal: formatAmount(proposal.subtotal),
      total_amount: formatAmount(proposal.total_amount),
      cgst_amount: formatAmount(proposal.cgst_amount),
      sgst_amount: formatAmount(proposal.sgst_amount),
      igst_amount: formatAmount(proposal.igst_amount),
    } as ProposalDetail
  },

  async createProposal(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: any,
    userId: string
  ): Promise<ProposalDetail> {
    // 1. Validations
    await Promise.all([
      getBookingById(supabase, data.booking_id, studioId),
      getClientById(supabase, data.client_id, studioId),
    ])

    if (!data.line_items || data.line_items.length === 0) {
      throw Errors.validation('At least one line item is required')
    }

    // 2. Totals Calculation
    let subtotal = 0
    data.line_items.forEach((item: any) => {
      subtotal += parseFloat((parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2))
    })

    const gst = calculateGst(subtotal, data.gst_type)
    const totalAmount = subtotal + gst.total

    // 3. Defaults
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 7)
    const validUntil = data.valid_until || defaultExpiry.toISOString().split('T')[0]

    // 4. Create Proposal
    const { id: proposalId, access_token } = await proposalRepo.createProposal(supabase, {
      studio_id: studioId,
      booking_id: data.booking_id,
      client_id: data.client_id,
      version: 1,
      status: 'draft',
      subtotal,
      gst_type: data.gst_type,
      cgst_rate: data.gst_type === 'cgst_sgst' ? 9 : 0,
      sgst_rate: data.gst_type === 'cgst_sgst' ? 9 : 0,
      igst_rate: data.gst_type === 'igst' ? 18 : 0,
      cgst_amount: gst.cgst,
      sgst_amount: gst.sgst,
      igst_amount: gst.igst,
      total_amount: totalAmount,
      valid_until: validUntil,
      notes: data.notes,
      access_token: generateSecureToken(),
    })

    // 5. Create Line Items
    const lineItems = data.line_items.map((item: any, index: number) => ({
      ...item,
      proposal_id: proposalId,
      studio_id: studioId,
      sort_order: item.sort_order ?? index,
      quantity: parseFloat(item.quantity),
      unit_price: parseFloat(item.unit_price),
    }))

    await proposalRepo.createLineItems(supabase, lineItems)

    // 6. Audit Log (Fire-and-forget)
    supabase
      .from('audit_logs')
      .insert({
        studio_id: studioId,
        user_id: userId,
        action: 'create',
        entity_type: 'proposals',
        entity_id: proposalId,
        entity_snapshot: { ...data, line_items: undefined },
      })
      .then(() => {})
      .catch(() => {})

    return this.getProposalById(supabase, proposalId, studioId)
  },

  async updateProposal(
    supabase: SupabaseClient<Database>,
    proposalId: string,
    studioId: string,
    data: any,
    userId: string
  ): Promise<ProposalDetail> {
    const current = await proposalRepo.getProposalById(supabase, proposalId, studioId)
    if (!current) throw Errors.notFound('Proposal')
    if (current.status !== 'draft') {
      throw Errors.conflict('Only draft proposals can be edited. Create a new version to modify a sent proposal.')
    }

    const updateData: any = { ...data }
    delete updateData.line_items

    if (data.line_items) {
      // Recalculate totals
      let subtotal = 0
      data.line_items.forEach((item: any) => {
        subtotal += parseFloat((parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2))
      })

      const gstType = data.gst_type || current.gst_type
      const gst = calculateGst(subtotal, gstType)
      const totalAmount = subtotal + gst.total

      updateData.subtotal = subtotal
      updateData.gst_type = gstType
      updateData.cgst_amount = gst.cgst
      updateData.sgst_amount = gst.sgst
      updateData.igst_amount = gst.igst
      updateData.total_amount = totalAmount
      updateData.cgst_rate = gstType === 'cgst_sgst' ? 9 : 0
      updateData.sgst_rate = gstType === 'cgst_sgst' ? 9 : 0
      updateData.igst_rate = gstType === 'igst' ? 18 : 0

      // Replace line items
      await proposalRepo.deleteLineItems(supabase, proposalId)
      const lineItems = data.line_items.map((item: any, index: number) => ({
        ...item,
        proposal_id: proposalId,
        studio_id: studioId,
        sort_order: item.sort_order ?? index,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
      }))
      await proposalRepo.createLineItems(supabase, lineItems)
    }

    await proposalRepo.updateProposal(supabase, proposalId, studioId, updateData)

    // Audit Log (Fire-and-forget)
    supabase
      .from('audit_logs')
      .insert({
        studio_id: studioId,
        user_id: userId,
        action: 'update',
        entity_type: 'proposals',
        entity_id: proposalId,
        entity_snapshot: { fields_changed: Object.keys(data) },
      })
      .then(() => {})
      .catch(() => {})

    return this.getProposalById(supabase, proposalId, studioId)
  },

  async deleteProposal(supabase: SupabaseClient<Database>, proposalId: string, studioId: string) {
    await proposalRepo.softDeleteProposal(supabase, proposalId, studioId)
  },

  async sendProposal(
    supabase: SupabaseClient<Database>,
    proposalId: string,
    studioId: string,
    userId: string
  ): Promise<ProposalDetail> {
    const proposal = await this.getProposalById(supabase, proposalId, studioId)
    if (proposal.status === 'accepted') throw Errors.conflict('Accepted proposals cannot be resent')
    if (proposal.is_expired) {
      throw Errors.conflict('Expired proposals cannot be sent. Update valid_until date first.')
    }

    if (proposal.status === 'draft') {
      await proposalRepo.markProposalSent(supabase, proposalId)
    } else {
      // Refresh sent_at only
      await proposalRepo.updateProposal(supabase, proposalId, studioId, {
        sent_at: new Date().toISOString(),
      })
    }

    // Refresh data
    const updated = await this.getProposalById(supabase, proposalId, studioId)
    const proposalUrl = `${env.NEXT_PUBLIC_APP_URL}/proposals/view/${updated.access_token}`

    // Side Effects (Fire-and-forget)
    this.handleSendSideEffects(supabase, updated, studioId, userId, proposalUrl).catch((err) =>
      logError({ message: 'Send side effects failed', context: { proposalId, err } })
    )

    return updated
  },

  async handleSendSideEffects(
    supabase: SupabaseClient<Database>,
    proposal: ProposalDetail,
    studioId: string,
    userId: string,
    proposalUrl: string
  ) {
    // 1. Get client + studio info for email/WhatsApp
    const [client, studio] = await Promise.all([
      supabase.from('clients').select('email, whatsapp').eq('id', proposal.client_id).single(),
      supabase.from('studios').select('name').eq('id', studioId).single(),
    ])

    const clientData = client.data
    const studioName = studio.data?.name || 'Studio'

    // 2. Email
    if (clientData?.email) {
      sendEmail({
        to: clientData.email,
        subject: `Your photography proposal from ${studioName} is ready`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h1 style="color: #333;">Proposal Ready</h1>
            <p>Dear ${proposal.client_name},</p>
            <p>Your proposal for <b>${proposal.booking_title}</b> is ready for review.</p>
            <p><b>Package Amount:</b> ₹${proposal.total_amount}</p>
            <p><b>Valid Until:</b> ${proposal.valid_until}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${proposalUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Proposal</a>
            </div>
            <p>Best regards,<br>${studioName}</p>
          </div>
        `,
        studioId,
      }).catch(() => {})
    }

    // 3. WhatsApp (Stub for now - log only)
    if (clientData?.whatsapp) {
      supabase.from('automation_log').insert({
        studio_id: studioId,
        booking_id: proposal.booking_id,
        client_id: proposal.client_id,
        automation_type: 'proposal_sent',
        channel: 'whatsapp',
        status: 'sent',
        recipient_phone: clientData.whatsapp,
        message_body: `Hi ${proposal.client_name}, your proposal from ${studioName} is ready: ${proposalUrl}`,
      }).then(() => {}).catch(() => {})
    }

    // 4. Activity Feed
    supabase.from('booking_activity_feed').insert({
      studio_id: studioId,
      booking_id: proposal.booking_id,
      event_type: 'proposal_sent',
      actor_id: userId,
      actor_type: 'member',
    }).then(() => {}).catch(() => {})
  },

  async viewProposal(supabase: SupabaseClient<Database>, token: string): Promise<PublicProposalView> {
    const proposal = await proposalRepo.getProposalByToken(supabase, token)
    if (!proposal) throw Errors.notFound('Proposal')

    // Mark viewed (fire-and-forget)
    proposalRepo.markProposalViewed(supabase, proposal.id).catch(() => {})

    const lineItems = await proposalRepo.getProposalLineItems(supabase, proposal.id)
    const isExpired =
      proposal.status === 'sent' &&
      proposal.valid_until &&
      new Date(proposal.valid_until) < new Date()

    return {
      id: proposal.id,
      status: proposal.status,
      subtotal: formatAmount(proposal.subtotal),
      cgst_amount: formatAmount(proposal.cgst_amount),
      sgst_amount: formatAmount(proposal.sgst_amount),
      igst_amount: formatAmount(proposal.igst_amount),
      total_amount: formatAmount(proposal.total_amount),
      valid_until: proposal.valid_until,
      is_expired: !!isExpired,
      notes: proposal.notes,
      line_items: (lineItems || []).map((item: any) => ({
        ...item,
        quantity: String(item.quantity),
        unit_price: formatAmount(item.unit_price),
        total_price: formatAmount(item.total_price),
      })),
      studio: proposal.studio,
      client_name: proposal.client_name,
      booking: proposal.booking,
    }
  },

  async acceptProposal(
    supabase: SupabaseClient<Database>,
    token: string,
    action: 'accept' | 'reject',
    reason?: string
  ) {
    const proposal = await proposalRepo.getProposalByToken(supabase, token)
    if (!proposal) throw Errors.notFound('Proposal')
    
    const isExpired =
      proposal.status === 'sent' &&
      proposal.valid_until &&
      new Date(proposal.valid_until) < new Date()

    if (proposal.status !== 'sent') {
      throw Errors.conflict(action === 'accept' ? 'This proposal is no longer available for acceptance' : 'This proposal cannot be rejected')
    }
    if (isExpired) {
      throw Errors.conflict('This proposal has expired. Please contact the studio for a new proposal.')
    }

    if (action === 'accept') {
      await proposalRepo.markProposalAccepted(supabase, proposal.id)
      
      // Update booking
      await supabase
        .from('bookings')
        .update({ status: 'contract_signed', updated_at: new Date().toISOString() })
        .eq('id', proposal.booking_id)

      // Activity Feed (Fire-and-forget)
      supabase.from('booking_activity_feed').insert({
        studio_id: proposal.studio_id,
        booking_id: proposal.booking_id,
        event_type: 'proposal_accepted',
        actor_type: 'client',
      }).then(() => {}).catch(() => {})
    } else {
      await proposalRepo.markProposalRejected(supabase, proposal.id, reason)
      
      // Activity Feed (Fire-and-forget)
      supabase.from('booking_activity_feed').insert({
        studio_id: proposal.studio_id,
        booking_id: proposal.booking_id,
        event_type: 'proposal_rejected',
        actor_type: 'client',
        metadata: { reason },
      }).then(() => {}).catch(() => {})
    }

    return { booking_id: proposal.booking_id }
  },
}

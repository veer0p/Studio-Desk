/**
 * PDF Service — Full implementation using @react-pdf/renderer.
 * Generates PDFs for invoices, contracts, and proposals server-side.
 */
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { Invoices, Proposals, Contracts } from '@/types/database'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 140,
    fontSize: 10,
    color: '#555',
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    fontSize: 9,
  },
  colItem: {
    flex: 2,
  },
  colQty: {
    flex: 1,
    textAlign: 'right' as const,
  },
  colPrice: {
    flex: 1,
    textAlign: 'right' as const,
  },
  colTotal: {
    flex: 1,
    textAlign: 'right' as const,
  },
  totals: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 10,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right' as const,
    marginRight: 8,
  },
  totalValue: {
    width: 80,
    textAlign: 'right' as const,
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999',
    textAlign: 'center' as const,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  notes: {
    marginTop: 12,
    fontSize: 9,
    color: '#555',
  },
  status: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  },
  statusDraft: { color: '#999' },
  statusSent: { color: '#2196F3' },
  statusPaid: { color: '#4CAF50' },
  statusSigned: { color: '#4CAF50' },
  statusAccepted: { color: '#4CAF50' },
  statusOverdue: { color: '#F44336' },
  statusRejected: { color: '#F44336' },
  statusCancelled: { color: '#999' },
  contractContent: {
    fontSize: 10,
    lineHeight: 1.5,
    whiteSpace: 'normal' as const,
  },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (num == null || isNaN(num)) return '₹0.00'
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getStatusStyle(status: string): { color: string } {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('paid') || statusLower.includes('signed') || statusLower.includes('accepted'))
    return { color: '#4CAF50' }
  if (statusLower.includes('sent')) return { color: '#2196F3' }
  if (statusLower.includes('overdue') || statusLower.includes('rejected'))
    return { color: '#F44336' }
  if (statusLower.includes('draft') || statusLower.includes('cancelled'))
    return { color: '#999' }
  return { color: '#333' }
}

// ---------------------------------------------------------------------------
// Invoice PDF Document
// ---------------------------------------------------------------------------

interface InvoicePdfDocProps {
  invoice: Invoices & {
    line_items?: Array<{
      name: string
      description?: string | null
      hsn_sac_code?: string | null
      quantity: number
      unit_price: number
      total_price: number
    }>
    client?: { full_name: string; email?: string | null; phone?: string | null; address?: string | null }
    studio?: { name: string; phone?: string | null; email?: string | null; address?: string | null; gstin?: string | null }
    booking?: { title: string; event_type: string; event_date: string; venue_address?: string | null }
  }
}

const InvoicePdfDocument: React.FC<InvoicePdfDocProps> = ({ invoice }) => {
  const lineItems = invoice.line_items || []
  const client = invoice.client
  const studio = invoice.studio

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>
            {invoice.invoice_number}
          </Text>
          <Text style={[styles.status, getStatusStyle(invoice.status)]}>
            {invoice.status}
          </Text>
        </View>

        {/* Studio & Client Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>From</Text>
              <Text style={{ fontWeight: 'bold' }}>{studio?.name || 'Studio'}</Text>
              {studio?.gstin && <Text>GSTIN: {studio.gstin}</Text>}
              {studio?.address && <Text>{studio.address}</Text>}
              {studio?.phone && <Text>{studio.phone}</Text>}
              {studio?.email && <Text>{studio.email}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bill To</Text>
              <Text style={{ fontWeight: 'bold' }}>{client?.full_name || 'Client'}</Text>
              {client?.address && <Text>{client.address}</Text>}
              {client?.phone && <Text>{client.phone}</Text>}
              {client?.email && <Text>{client.email}</Text>}
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Type:</Text>
            <Text style={styles.value}>{invoice.invoice_type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text style={styles.value}>{formatDate(invoice.created_at)}</Text>
          </View>
          {invoice.due_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(invoice.due_date)}</Text>
            </View>
          )}
          {invoice.booking && (
            <View style={styles.row}>
              <Text style={styles.label}>Event:</Text>
              <Text style={styles.value}>
                {invoice.booking.title} — {invoice.booking.event_type} on {formatDate(invoice.booking.event_date)}
              </Text>
            </View>
          )}
          {invoice.hsn_sac_code && (
            <View style={styles.row}>
              <Text style={styles.label}>HSN/SAC Code:</Text>
              <Text style={styles.value}>{invoice.hsn_sac_code}</Text>
            </View>
          )}
        </View>

        {/* Line Items Table */}
        {lineItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Line Items</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colItem}>Description</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colPrice}>Unit Price</Text>
                <Text style={styles.colTotal}>Total</Text>
              </View>
              {lineItems.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.colItem}>
                    {item.name}
                    {item.description ? ` — ${item.description}` : ''}
                  </Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                  <Text style={styles.colTotal}>{formatCurrency(item.total_price)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {invoice.gst_type === 'cgst_sgst' && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST ({invoice.cgst_rate}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.cgst_amount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST ({invoice.sgst_rate}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.sgst_amount)}</Text>
              </View>
            </>
          )}
          {invoice.gst_type === 'igst' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGST ({invoice.igst_rate}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.igst_amount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Paid:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.amount_paid)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Amount Due:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total_amount - invoice.amount_paid)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by StudioDesk • {new Date().toLocaleDateString('en-IN')}
        </Text>
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Proposal PDF Document
// ---------------------------------------------------------------------------

interface ProposalPdfDocProps {
  proposal: Proposals & {
    line_items?: Array<{
      name: string
      description?: string | null
      hsn_sac_code?: string | null
      quantity: number
      unit_price: number
      total_price: number
    }>
    client?: { full_name: string; email?: string | null; phone?: string | null }
    studio?: { name: string; phone?: string | null; email?: string | null; address?: string | null }
    booking?: { title: string; event_type: string; event_date: string; venue_address?: string | null }
  }
}

const ProposalPdfDocument: React.FC<ProposalPdfDocProps> = ({ proposal }) => {
  const lineItems = proposal.line_items || []
  const client = proposal.client
  const studio = proposal.studio

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROPOSAL</Text>
          <Text style={styles.subtitle}>
            {studio?.name || 'Studio'}
          </Text>
          <Text style={[styles.status, getStatusStyle(proposal.status)]}>
            {proposal.status}
          </Text>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Prepared For:</Text>
            <Text style={styles.value}>{client?.full_name || 'Client'}</Text>
          </View>
          {client?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{client.email}</Text>
            </View>
          )}
          {proposal.booking && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Event:</Text>
                <Text style={styles.value}>
                  {proposal.booking.title} — {proposal.booking.event_type}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatDate(proposal.booking.event_date)}</Text>
              </View>
            </>
          )}
          {proposal.valid_until && (
            <View style={styles.row}>
              <Text style={styles.label}>Valid Until:</Text>
              <Text style={styles.value}>{formatDate(proposal.valid_until)}</Text>
            </View>
          )}
        </View>

        {/* Line Items */}
        {lineItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services & Items</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colItem}>Description</Text>
                <Text style={styles.colQty}>Qty</Text>
                <Text style={styles.colPrice}>Unit Price</Text>
                <Text style={styles.colTotal}>Total</Text>
              </View>
              {lineItems.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.colItem}>
                    {item.name}
                    {item.description ? ` — ${item.description}` : ''}
                  </Text>
                  <Text style={styles.colQty}>{item.quantity}</Text>
                  <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                  <Text style={styles.colTotal}>{formatCurrency(item.total_price)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(proposal.subtotal)}</Text>
          </View>
          {proposal.gst_type === 'cgst_sgst' && (
            <>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST ({proposal.cgst_rate}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(proposal.cgst_amount)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST ({proposal.sgst_rate}%):</Text>
                <Text style={styles.totalValue}>{formatCurrency(proposal.sgst_amount)}</Text>
              </View>
            </>
          )}
          {proposal.gst_type === 'igst' && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGST ({proposal.igst_rate}%):</Text>
              <Text style={styles.totalValue}>{formatCurrency(proposal.igst_amount)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(proposal.total_amount)}</Text>
          </View>
        </View>

        {/* Notes */}
        {proposal.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notes:</Text>
            <Text>{proposal.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by StudioDesk • {new Date().toLocaleDateString('en-IN')}
        </Text>
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Contract PDF Document
// ---------------------------------------------------------------------------

interface ContractPdfDocProps {
  contract: Contracts & {
    client?: { full_name: string; email?: string | null; phone?: string | null; address?: string | null }
    studio?: { name: string; phone?: string | null; email?: string | null; address?: string | null }
    booking?: { title: string; event_type: string; event_date: string; venue_address?: string | null }
  }
}

const ContractPdfDocument: React.FC<ContractPdfDocProps> = ({ contract }) => {
  const client = contract.client
  const studio = contract.studio
  const booking = contract.booking

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CONTRACT</Text>
          <Text style={styles.subtitle}>
            {studio?.name || 'Studio'}
          </Text>
          <Text style={[styles.status, getStatusStyle(contract.status)]}>
            {contract.status}
          </Text>
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Studio:</Text>
            <Text style={styles.value}>{studio?.name || 'Studio'}</Text>
          </View>
          {studio?.address && (
            <View style={styles.row}>
              <Text style={styles.label}></Text>
              <Text style={styles.value}>{studio.address}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Client:</Text>
            <Text style={styles.value}>{client?.full_name || 'Client'}</Text>
          </View>
          {client?.address && (
            <View style={styles.row}>
              <Text style={styles.label}></Text>
              <Text style={styles.value}>{client.address}</Text>
            </View>
          )}
        </View>

        {/* Event Details */}
        {booking && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Event:</Text>
              <Text style={styles.value}>{booking.title}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{booking.event_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(booking.event_date)}</Text>
            </View>
            {booking.venue_address && (
              <View style={styles.row}>
                <Text style={styles.label}>Venue:</Text>
                <Text style={styles.value}>{booking.venue_address}</Text>
              </View>
            )}
          </View>
        )}

        {/* Contract Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text style={styles.contractContent}>
            {contract.content_html.replace(/<[^>]*>/g, '\n').replace(/\n{3,}/g, '\n\n').trim()}
          </Text>
        </View>

        {/* Notes */}
        {contract.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Notes:</Text>
            <Text>{contract.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by StudioDesk • {new Date().toLocaleDateString('en-IN')}
        </Text>
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// HTML-to-PDF Document (simple text rendering)
// ---------------------------------------------------------------------------

interface HtmlPdfDocProps {
  html: string
  title?: string
}

const HtmlPdfDocument: React.FC<HtmlPdfDocProps> = ({ html, title }) => {
  // Strip HTML tags for plain text rendering; basic newline handling
  const cleanText = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th)[^>]*>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.contractContent}>{cleanText}</Text>
        </View>
        <Text style={styles.footer}>
          Generated by StudioDesk • {new Date().toLocaleDateString('en-IN')}
        </Text>
      </Page>
    </Document>
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a PDF buffer from raw HTML content.
 */
export async function generateFromHtml(
  html: string,
  options?: { title?: string }
): Promise<Buffer> {
  const doc = React.createElement(HtmlPdfDocument, {
    html,
    title: options?.title,
  })
  const buffer = await renderToBuffer(doc as any)
  return Buffer.from(buffer)
}

/**
 * Generate an invoice PDF. Fetches related data from the database if only
 * an invoice ID (or object) is provided.
 */
export async function generateInvoice(
  invoice: Invoices | string,
  options?: { includeLineItems?: boolean; includeClient?: boolean; includeStudio?: boolean; includeBooking?: boolean }
): Promise<Buffer> {
  let fullInvoice: InvoicePdfDocProps['invoice']

  if (typeof invoice === 'string') {
    // Fetch from database
    const supabase = createAdminClient()
    const includeLineItems = options?.includeLineItems ?? true
    const includeClient = options?.includeClient ?? true
    const includeStudio = options?.includeStudio ?? true
    const includeBooking = options?.includeBooking ?? true

    let selectQuery = '*, '
    const relations: string[] = []
    if (includeLineItems) relations.push('invoice_line_items(name, description, hsn_sac_code, quantity, unit_price, total_price)')
    if (includeClient) relations.push('clients(full_name, email, phone, address)')
    if (includeStudio) relations.push('studios(name, phone, email, address, gstin)')
    if (includeBooking) relations.push('bookings(title, event_type, event_date, venue_address)')
    selectQuery += relations.join(', ')

    const { data, error } = await supabase
      .from('invoices')
      .select(selectQuery)
      .eq('id', invoice)
      .single()

    if (error || !data) {
      throw new Error(`Invoice not found: ${invoice}${error ? ` — ${error.message}` : ''}`)
    }

    const row = data as any

    fullInvoice = {
      id: row.id,
      studio_id: row.studio_id,
      booking_id: row.booking_id,
      client_id: row.client_id,
      invoice_number: row.invoice_number,
      invoice_type: row.invoice_type,
      status: row.status,
      subtotal: row.subtotal,
      gst_type: row.gst_type,
      cgst_rate: row.cgst_rate,
      sgst_rate: row.sgst_rate,
      igst_rate: row.igst_rate,
      cgst_amount: row.cgst_amount,
      sgst_amount: row.sgst_amount,
      igst_amount: row.igst_amount,
      total_amount: row.total_amount,
      amount_paid: row.amount_paid,
      amount_due: row.amount_due,
      hsn_sac_code: row.hsn_sac_code,
      place_of_supply: row.place_of_supply,
      place_of_supply_state_id: row.place_of_supply_state_id,
      credit_note_for: row.credit_note_for,
      due_date: row.due_date,
      paid_at: row.paid_at,
      razorpay_order_id: row.razorpay_order_id,
      razorpay_payment_link_id: row.razorpay_payment_link_id,
      payment_link_url: row.payment_link_url,
      payment_link_expires_at: row.payment_link_expires_at,
      sent_at: row.sent_at,
      viewed_at: row.viewed_at,
      access_token: row.access_token,
      pdf_url: row.pdf_url,
      pdf_generated_at: row.pdf_generated_at,
      notes: row.notes,
      internal_notes: row.internal_notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      line_items: includeLineItems ? row.invoice_line_items || [] : [],
      client: includeClient ? row.clients : undefined,
      studio: includeStudio ? row.studios : undefined,
      booking: includeBooking ? row.bookings : undefined,
    }
  } else {
    // Use the provided object directly
    fullInvoice = invoice as InvoicePdfDocProps['invoice']
  }

  const doc = React.createElement(InvoicePdfDocument, { invoice: fullInvoice })
  const buffer = await renderToBuffer(doc as any)
  return Buffer.from(buffer)
}

/**
 * Generate a proposal PDF.
 */
export async function generateProposal(
  proposal: Proposals | string,
  options?: { includeLineItems?: boolean; includeClient?: boolean; includeStudio?: boolean; includeBooking?: boolean }
): Promise<Buffer> {
  let fullProposal: ProposalPdfDocProps['proposal']

  if (typeof proposal === 'string') {
    const supabase = createAdminClient()
    const includeLineItems = options?.includeLineItems ?? true
    const includeClient = options?.includeClient ?? true
    const includeStudio = options?.includeStudio ?? true
    const includeBooking = options?.includeBooking ?? true

    let selectQuery = '*, '
    const relations: string[] = []
    if (includeLineItems) relations.push('proposal_line_items(name, description, hsn_sac_code, quantity, unit_price, total_price)')
    if (includeClient) relations.push('clients(full_name, email, phone)')
    if (includeStudio) relations.push('studios(name, phone, email, address)')
    if (includeBooking) relations.push('bookings(title, event_type, event_date, venue_address)')
    selectQuery += relations.join(', ')

    const { data, error } = await supabase
      .from('proposals')
      .select(selectQuery)
      .eq('id', proposal)
      .single()

    if (error || !data) {
      throw new Error(`Proposal not found: ${proposal}${error ? ` — ${error.message}` : ''}`)
    }

    const row = data as any

    fullProposal = {
      id: row.id,
      studio_id: row.studio_id,
      booking_id: row.booking_id,
      client_id: row.client_id,
      version: row.version,
      status: row.status,
      subtotal: row.subtotal,
      gst_type: row.gst_type,
      cgst_rate: row.cgst_rate,
      sgst_rate: row.sgst_rate,
      igst_rate: row.igst_rate,
      cgst_amount: row.cgst_amount,
      sgst_amount: row.sgst_amount,
      igst_amount: row.igst_amount,
      total_amount: row.total_amount,
      valid_until: row.valid_until,
      notes: row.notes,
      sent_at: row.sent_at,
      viewed_at: row.viewed_at,
      accepted_at: row.accepted_at,
      rejected_at: row.rejected_at,
      rejection_reason: row.rejection_reason,
      access_token: row.access_token,
      pdf_url: row.pdf_url,
      pdf_generated_at: row.pdf_generated_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      line_items: includeLineItems ? row.proposal_line_items || [] : [],
      client: includeClient ? row.clients : undefined,
      studio: includeStudio ? row.studios : undefined,
      booking: includeBooking ? row.bookings : undefined,
    }
  } else {
    fullProposal = proposal as ProposalPdfDocProps['proposal']
  }

  const doc = React.createElement(ProposalPdfDocument, { proposal: fullProposal })
  const buffer = await renderToBuffer(doc as any)
  return Buffer.from(buffer)
}

/**
 * Generate a contract PDF.
 */
export async function generateContract(
  contract: Contracts | string,
  options?: { includeClient?: boolean; includeStudio?: boolean; includeBooking?: boolean }
): Promise<Buffer> {
  let fullContract: ContractPdfDocProps['contract']

  if (typeof contract === 'string') {
    const supabase = createAdminClient()
    const includeClient = options?.includeClient ?? true
    const includeStudio = options?.includeStudio ?? true
    const includeBooking = options?.includeBooking ?? true

    let selectQuery = '*, '
    const relations: string[] = []
    if (includeClient) relations.push('clients(full_name, email, phone, address)')
    if (includeStudio) relations.push('studios(name, phone, email, address, gstin)')
    if (includeBooking) relations.push('bookings(title, event_type, event_date, venue_address)')
    selectQuery += relations.join(', ')

    const { data, error } = await supabase
      .from('contracts')
      .select(selectQuery)
      .eq('id', contract)
      .single()

    if (error || !data) {
      throw new Error(`Contract not found: ${contract}${error ? ` — ${error.message}` : ''}`)
    }

    const row = data as any

    fullContract = {
      id: row.id,
      studio_id: row.studio_id,
      booking_id: row.booking_id,
      client_id: row.client_id,
      template_id: row.template_id,
      status: row.status,
      content_html: row.content_html,
      signed_at: row.signed_at,
      signature_data: row.signature_data,
      signed_ip: row.signed_ip,
      signed_user_agent: row.signed_user_agent,
      studio_signed_at: row.studio_signed_at,
      studio_signature_data: row.studio_signature_data,
      sent_at: row.sent_at,
      viewed_at: row.viewed_at,
      reminder_sent_at: row.reminder_sent_at,
      access_token: row.access_token,
      signed_pdf_url: row.signed_pdf_url,
      pdf_generated_at: row.pdf_generated_at,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      client: includeClient ? row.clients : undefined,
      studio: includeStudio ? row.studios : undefined,
      booking: includeBooking ? row.bookings : undefined,
    }
  } else {
    fullContract = contract as ContractPdfDocProps['contract']
  }

  const doc = React.createElement(ContractPdfDocument, { contract: fullContract })
  const buffer = await renderToBuffer(doc as any)
  return Buffer.from(buffer)
}

/**
 * Legacy compatibility — generates a proposal PDF and returns a Buffer.
 */
export async function generateProposalPdf(proposalId: string): Promise<Buffer> {
  return generateProposal(proposalId)
}

/**
 * Exported object for backward compatibility with existing code that imports PdfService.
 */
export const PdfService = {
  generateFromHtml,
  generateInvoice,
  generateProposal,
  generateContract,
  generateProposalPdf,
}

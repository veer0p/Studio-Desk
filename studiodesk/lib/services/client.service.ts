import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { clientRepo } from '@/lib/repositories/client.repo'
import { Errors } from '@/lib/errors'
import type { CreateClientInput, UpdateClientInput } from '@/lib/validations/client.schema'

export interface ClientSummary {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null
  city: string | null
  state: string | null
  company_name: string | null
  gstin: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface ClientDetail {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  company_name: string | null
  gstin: string | null
  notes: string | null
  tags: string[] | null
  stats: { total_bookings: number; total_revenue: string; total_paid: string }
  bookings: Array<{
    id: string
    title: string
    event_type: string
    event_date: string
    status: string
    total_amount: string
    amount_paid: string
    amount_pending: string
  }>
  created_at: string
  updated_at: string
}

function toClientSummary(row: Record<string, unknown>): ClientSummary {
  const date = (v: unknown) => (v instanceof Date ? v.toISOString() : (v ? String(v) : ''))
  return {
    id: String(row.id),
    full_name: String(row.full_name ?? ''),
    email: row.email != null ? String(row.email) : null,
    phone: row.phone != null ? String(row.phone) : null,
    whatsapp: row.whatsapp != null ? String(row.whatsapp) : null,
    city: row.city != null ? String(row.city) : null,
    state: row.state != null ? String(row.state) : null,
    company_name: row.company_name != null ? String(row.company_name) : null,
    gstin: row.gstin != null ? String(row.gstin) : null,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : null,
    created_at: date(row.created_at),
    updated_at: date(row.updated_at),
  }
}

export const ClientService = {
  async getClients(
    supabase: SupabaseClient<Database>,
    studioId: string,
    params: { search?: string; page: number; pageSize: number }
  ) {
    const { data, count } = await clientRepo.getClients(supabase, studioId, params)
    return { data: data.map((r) => toClientSummary(r)), count }
  },

  async getClientDetail(
    supabase: SupabaseClient<Database>,
    clientId: string,
    studioId: string
  ): Promise<ClientDetail> {
    const [client, bookings, stats] = await Promise.all([
      clientRepo.getClientById(supabase, clientId, studioId),
      clientRepo.getClientBookingHistory(supabase, clientId, studioId),
      clientRepo.getClientStats(supabase, clientId, studioId),
    ])

    if (!client) throw Errors.notFound('Client')

    const c = client as Record<string, unknown>
    const date = (v: unknown) => (v instanceof Date ? v.toISOString() : (v ? String(v) : ''))
    const num = (v: unknown) => (v != null ? String(Number(v)) : '0.00')

    return {
      id: String(c.id),
      full_name: String(c.full_name ?? ''),
      phone: c.phone != null ? String(c.phone) : null,
      email: c.email != null ? String(c.email) : null,
      whatsapp: c.whatsapp != null ? String(c.whatsapp) : null,
      address: c.address != null ? String(c.address) : null,
      city: c.city != null ? String(c.city) : null,
      state: c.state != null ? String(c.state) : null,
      pincode: c.pincode != null ? String(c.pincode) : null,
      company_name: c.company_name != null ? String(c.company_name) : null,
      gstin: c.gstin != null ? String(c.gstin) : null,
      notes: c.notes != null ? String(c.notes) : null,
      tags: Array.isArray(c.tags) ? c.tags.map(String) : null,
      stats: {
        total_bookings: stats.total_bookings,
        total_revenue: stats.total_revenue.toFixed(2),
        total_paid: stats.total_paid.toFixed(2),
      },
      bookings: (bookings as Array<Record<string, unknown>>).map((b) => ({
        id: String(b.id),
        title: String(b.title ?? ''),
        event_type: String(b.event_type ?? ''),
        event_date: date(b.event_date),
        status: String(b.status ?? ''),
        total_amount: num(b.total_amount),
        amount_paid: num(b.amount_paid),
        amount_pending: num(b.amount_pending),
      })),
      created_at: date(c.created_at),
      updated_at: date(c.updated_at),
    }
  },

  async createClient(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: CreateClientInput
  ): Promise<ClientSummary> {
    const existing = await clientRepo.getClientByPhone(supabase, data.phone, studioId)
    if (existing) {
      throw Errors.conflict('A client with this phone number already exists')
    }
    const row = await clientRepo.createClient(supabase, studioId, {
      full_name: data.full_name,
      phone: data.phone,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      state_id: data.state_id ?? null,
      pincode: data.pincode ?? null,
      company_name: data.company_name ?? null,
      gstin: data.gstin ?? null,
      notes: data.notes ?? null,
      tags: data.tags ?? null,
    } as any)
    return toClientSummary(row)
  },

  async updateClient(
    supabase: SupabaseClient<Database>,
    clientId: string,
    studioId: string,
    data: UpdateClientInput
  ): Promise<ClientSummary> {
    if (data.phone != null) {
      const existing = await clientRepo.getClientByPhone(supabase, data.phone, studioId)
      if (existing && (existing as { id: string }).id !== clientId) {
        throw Errors.conflict('A client with this phone number already exists')
      }
    }
    const row = await clientRepo.updateClient(supabase, clientId, studioId, data as any)
    return toClientSummary(row)
  },

  async deleteClient(
    supabase: SupabaseClient<Database>,
    clientId: string,
    studioId: string
  ): Promise<void> {
    await clientRepo.softDeleteClient(supabase, clientId, studioId)
  },
}

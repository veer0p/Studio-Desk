import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { Errors } from '@/lib/errors'

type ServicePackagesRow = Database['public']['Tables']['service_packages']['Row']
type ServicePackagesInsert = Database['public']['Tables']['service_packages']['Insert']
type PackageAddonsRow = Database['public']['Tables']['package_addons']['Row']
type PackageAddonsInsert = Database['public']['Tables']['package_addons']['Insert']

const PACKAGE_COLUMNS =
  'id, name, event_type, description, base_price, hsn_sac_code, is_gst_applicable, deliverables, turnaround_days, line_items, is_active, sort_order, created_at, updated_at'

const ADDON_COLUMNS = 'id, name, description, price, unit, is_active, created_at, updated_at'

export const packageRepo = {
  async getPackages(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('service_packages')
      .select(PACKAGE_COLUMNS)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch packages')
    return (data ?? []) as Array<Record<string, unknown>>
  },

  async getPackageById(
    supabase: SupabaseClient<Database>,
    packageId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('service_packages')
      .select(PACKAGE_COLUMNS)
      .eq('id', packageId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch package')
    return data
  },

  /** Alias for onboarding: same as createPackage with adapted payload (base_price number, optional fields). */
  async create(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: {
      name: string
      event_type: string
      base_price?: number
      description?: string | null
      deliverables?: string[] | null
      turnaround_days?: number | null
      hsn_sac_code?: string | null
      is_gst_applicable?: boolean
      line_items?: unknown
    }
  ) {
    const sortOrder = await this.getNextSortOrder(supabase, studioId)
    return this.createPackage(supabase, studioId, {
      name: data.name,
      event_type: data.event_type as any,
      description: data.description ?? null,
      base_price: data.base_price != null ? String(data.base_price) : '0',
      hsn_sac_code: data.hsn_sac_code ?? '998389',
      is_gst_applicable: data.is_gst_applicable ?? true,
      deliverables: data.deliverables ?? [],
      turnaround_days: data.turnaround_days ?? 30,
      line_items: data.line_items ?? [],
      sort_order: sortOrder,
    } as any)
  },

  async createPackage(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: Omit<ServicePackagesInsert, 'id' | 'studio_id'>
  ) {
    const insert = {
      studio_id: studioId,
      ...data,
      base_price: typeof data.base_price === 'string' ? parseFloat(data.base_price) : (data.base_price ?? 0),
      deliverables: data.deliverables ?? [],
      line_items: data.line_items ?? null,
      is_active: true,
    } as ServicePackagesInsert
    const { data: row, error } = await supabase
      .from('service_packages')
      .insert(insert)
      .select(PACKAGE_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to create package')
    return row as Record<string, unknown>
  },

  async updatePackage(
    supabase: SupabaseClient<Database>,
    packageId: string,
    studioId: string,
    data: Partial<Omit<ServicePackagesInsert, 'id' | 'studio_id'>>
  ) {
    const existing = await this.getPackageById(supabase, packageId, studioId)
    if (!existing) throw Errors.notFound('Package')

    const update: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
    if (typeof data.base_price === 'string') update.base_price = parseFloat(data.base_price)

    const { data: row, error } = await supabase
      .from('service_packages')
      .update(update)
      .eq('id', packageId)
      .eq('studio_id', studioId)
      .select(PACKAGE_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to update package')
    return row as Record<string, unknown>
  },

  async softDeletePackage(
    supabase: SupabaseClient<Database>,
    packageId: string,
    studioId: string
  ) {
    const existing = await this.getPackageById(supabase, packageId, studioId)
    if (!existing) throw Errors.notFound('Package')

    const { data: rows, error: countError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('package_id', packageId)
      .is('deleted_at', null)

    if (countError) throw Errors.validation('Failed to check bookings')
    const hasActive = (rows ?? []).some((r: { status?: string }) => r.status !== 'closed' && r.status !== 'lost')
    if (hasActive) {
      throw Errors.conflict('Package is linked to active bookings and cannot be deleted. Deactivate instead.')
    }

    const { error } = await supabase
      .from('service_packages')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', packageId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete package')
  },

  async getNextSortOrder(supabase: SupabaseClient<Database>, studioId: string): Promise<number> {
    const { data, error } = await supabase
      .from('service_packages')
      .select('sort_order')
      .eq('studio_id', studioId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return 0
    const max = (data as { sort_order: number | null } | null)?.sort_order ?? -1
    return max + 1
  },

  async updateSortOrder(
    supabase: SupabaseClient<Database>,
    studioId: string,
    packageIds: string[]
  ) {
    await Promise.all(
      packageIds.map((id, i) =>
        supabase
          .from('service_packages')
          .update({ sort_order: i, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('studio_id', studioId)
      )
    )
  },

  async getAddons(supabase: SupabaseClient<Database>, studioId: string) {
    const { data, error } = await supabase
      .from('package_addons')
      .select(ADDON_COLUMNS)
      .eq('studio_id', studioId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw Errors.validation('Failed to fetch add-ons')
    return (data ?? []) as Array<Record<string, unknown>>
  },

  async getAddonById(
    supabase: SupabaseClient<Database>,
    addonId: string,
    studioId: string
  ) {
    const { data, error } = await supabase
      .from('package_addons')
      .select(ADDON_COLUMNS)
      .eq('id', addonId)
      .eq('studio_id', studioId)
      .maybeSingle()

    if (error) throw Errors.validation('Failed to fetch add-on')
    return data
  },

  async createAddon(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: Omit<PackageAddonsInsert, 'id' | 'studio_id'>
  ) {
    const insert = {
      studio_id: studioId,
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : (data.price ?? 0),
      is_active: true,
    } as PackageAddonsInsert
    const { data: row, error } = await supabase
      .from('package_addons')
      .insert(insert)
      .select(ADDON_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to create add-on')
    return row as Record<string, unknown>
  },

  async updateAddon(
    supabase: SupabaseClient<Database>,
    addonId: string,
    studioId: string,
    data: Partial<Omit<PackageAddonsInsert, 'id' | 'studio_id'>>
  ) {
    const update: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() }
    if (typeof data.price === 'string') update.price = parseFloat(data.price)

    const { data: row, error } = await supabase
      .from('package_addons')
      .update(update)
      .eq('id', addonId)
      .eq('studio_id', studioId)
      .select(ADDON_COLUMNS)
      .single()

    if (error) throw Errors.validation('Failed to update add-on')
    return row as Record<string, unknown>
  },

  async softDeleteAddon(
    supabase: SupabaseClient<Database>,
    addonId: string,
    studioId: string
  ) {
    const { error } = await supabase
      .from('package_addons')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', addonId)
      .eq('studio_id', studioId)

    if (error) throw Errors.validation('Failed to delete add-on')
  },
}

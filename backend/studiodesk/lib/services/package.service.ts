import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { packageRepo } from '@/lib/repositories/package.repo'
import { calculateGst } from '@/lib/gst/calculator'
import { Errors } from '@/lib/errors'
import { logError } from '@/lib/logger'
import type { CreatePackageInput, UpdatePackageInput, CreateAddonInput, UpdateAddonInput } from '@/lib/validations/package.schema'

const PACKAGE_TEMPLATES = [
  {
    id: 'tpl_wedding_full',
    name: 'Wedding Full Day',
    event_type: 'wedding',
    description: 'Complete wedding day coverage from morning prep to reception',
    base_price: '85000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['500+ edited photos', '1 highlights reel (3-5 mins)', 'Online gallery with AI delivery', 'USB drive with all photos'],
    turnaround_days: 30,
    line_items: [
      { name: 'Photography - Full Day', quantity: '1', unit_price: '60000.00' },
      { name: 'Videography - Full Day', quantity: '1', unit_price: '25000.00' },
    ],
  },
  {
    id: 'tpl_wedding_half',
    name: 'Wedding Half Day',
    event_type: 'wedding',
    description: 'Half day wedding coverage (up to 6 hours)',
    base_price: '50000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['300+ edited photos', '1 highlights reel (2-3 mins)', 'Online gallery'],
    turnaround_days: 21,
    line_items: [
      { name: 'Photography - Half Day', quantity: '1', unit_price: '35000.00' },
      { name: 'Videography - Half Day', quantity: '1', unit_price: '15000.00' },
    ],
  },
  {
    id: 'tpl_prewedding',
    name: 'Pre-Wedding Shoot',
    event_type: 'pre_wedding',
    description: 'Romantic pre-wedding shoot at a location of your choice',
    base_price: '35000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['150+ edited photos', '1 short film (1-2 mins)', 'Online gallery'],
    turnaround_days: 14,
    line_items: [
      { name: 'Photography', quantity: '1', unit_price: '25000.00' },
      { name: 'Videography', quantity: '1', unit_price: '10000.00' },
    ],
  },
  {
    id: 'tpl_corporate',
    name: 'Corporate Event',
    event_type: 'corporate',
    description: 'Professional corporate event coverage',
    base_price: '45000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['200+ edited photos', 'Same day delivery option', 'Online gallery'],
    turnaround_days: 7,
    line_items: [
      { name: 'Event Photography', quantity: '1', unit_price: '35000.00' },
      { name: 'Videography', quantity: '1', unit_price: '10000.00' },
    ],
  },
  {
    id: 'tpl_portrait',
    name: 'Portrait Session',
    event_type: 'portrait',
    description: 'Professional portrait photography session',
    base_price: '20000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['50+ edited photos', 'Online gallery', '2-hour session'],
    turnaround_days: 7,
    line_items: [{ name: 'Portrait Photography', quantity: '1', unit_price: '20000.00' }],
  },
  {
    id: 'tpl_birthday',
    name: 'Birthday Event',
    event_type: 'birthday',
    description: 'Birthday party photography and videography',
    base_price: '25000.00',
    hsn_sac_code: '998389',
    is_gst_applicable: true,
    deliverables: ['150+ edited photos', '1 highlight video (2 mins)', 'Online gallery'],
    turnaround_days: 10,
    line_items: [
      { name: 'Photography', quantity: '1', unit_price: '15000.00' },
      { name: 'Videography', quantity: '1', unit_price: '10000.00' },
    ],
  },
]

export interface LineItem {
  name: string
  description?: string
  hsn_sac_code?: string
  quantity: string
  unit_price: string
  total_price: string
}

export interface ServicePackage {
  id: string
  name: string
  event_type: string
  description: string | null
  base_price: string
  gst_amount: string
  total_with_gst: string
  hsn_sac_code: string
  is_gst_applicable: boolean
  deliverables: string[]
  turnaround_days: number
  line_items: LineItem[]
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PackageTemplate {
  id: string
  name: string
  event_type: string
  description: string
  base_price: string
  hsn_sac_code: string
  is_gst_applicable: boolean
  deliverables: string[]
  turnaround_days: number
  line_items: Array<{ name: string; quantity: string; unit_price: string }>
  is_template: true
}

export interface Addon {
  id: string
  name: string
  description: string | null
  price: string
  unit: 'flat' | 'per_hour' | 'per_day'
  is_active: boolean
  created_at: string
  updated_at: string
}

function mapLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item: Record<string, unknown>) => {
    const qty = String(item?.quantity ?? '1')
    const up = String(item?.unit_price ?? '0')
    const total = (parseFloat(qty) * parseFloat(up)).toFixed(2)
    return {
      name: String(item?.name ?? ''),
      description: item?.description != null ? String(item.description) : undefined,
      hsn_sac_code: item?.hsn_sac_code != null ? String(item.hsn_sac_code) : undefined,
      quantity: qty,
      unit_price: up,
      total_price: total,
    }
  })
}

function toServicePackage(row: Record<string, unknown>): ServicePackage {
  const basePrice = String(row.base_price ?? '0')
  const numPrice = parseFloat(basePrice)
  const gstTotal = row.is_gst_applicable
    ? (calculateGst(numPrice, 'cgst_sgst').total as number)
    : 0
  const gstAmount = row.is_gst_applicable ? gstTotal.toFixed(2) : '0.00'
  const totalWithGst = (numPrice + parseFloat(gstAmount)).toFixed(2)
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? '')
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at ?? '')
  return {
    id: String(row.id),
    name: String(row.name),
    event_type: String(row.event_type),
    description: row.description != null ? String(row.description) : null,
    base_price: basePrice,
    gst_amount: gstAmount,
    total_with_gst: totalWithGst,
    hsn_sac_code: String(row.hsn_sac_code ?? '998389'),
    is_gst_applicable: Boolean(row.is_gst_applicable),
    deliverables: Array.isArray(row.deliverables) ? row.deliverables.map(String) : [],
    turnaround_days: Number(row.turnaround_days ?? 0),
    line_items: mapLineItems(row.line_items),
    is_active: Boolean(row.is_active !== false),
    sort_order: Number(row.sort_order ?? 0),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function toAddon(row: Record<string, unknown>): Addon {
  const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? '')
  const updatedAt = row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at ?? '')
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description != null ? String(row.description) : null,
    price: String(row.price ?? '0'),
    unit: (row.unit === 'per_hour' || row.unit === 'per_day' ? row.unit : 'flat') as 'flat' | 'per_hour' | 'per_day',
    is_active: Boolean(row.is_active !== false),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function validateCreatePackage(data: CreatePackageInput) {
  if (parseFloat(data.base_price) <= 0) throw Errors.validation('base_price must be positive')
  const days = data.turnaround_days ?? 30
  if (days < 1 || days > 365) throw Errors.validation('turnaround_days must be 1-365')
  if ((data.deliverables?.length ?? 0) > 20) throw Errors.validation('deliverables max 20 items')
  if ((data.line_items?.length ?? 0) > 20) throw Errors.validation('line_items max 20 items')
  for (const li of data.line_items ?? []) {
    if (!li.name?.trim()) throw Errors.validation('line_item name required')
    if (parseFloat(li.quantity) <= 0) throw Errors.validation('line_item quantity must be positive')
    if (parseFloat(li.unit_price) <= 0) throw Errors.validation('line_item unit_price must be positive')
  }
  const lineTotal = (data.line_items ?? []).reduce(
    (sum, li) => sum + parseFloat(li.quantity) * parseFloat(li.unit_price),
    0
  )
  const baseNum = parseFloat(data.base_price)
  if (lineTotal > baseNum * 3) {
    logError({ message: '[PackageService] line_items sum exceeds base_price * 3', context: { lineTotal, baseNum } }).catch(() => {})
  }
}

function validateCreateAddon(data: CreateAddonInput) {
  if (parseFloat(data.price) <= 0) throw Errors.validation('price must be positive')
}

export const PackageService = {
  async getPackages(supabase: any, studioId: string): Promise<ServicePackage[]> {
    const rows = await packageRepo.getPackages(supabase, studioId)
    return rows.map((r) => toServicePackage(r as Record<string, unknown>))
  },

  async getPackageById(
    supabase: any,
    packageId: string,
    studioId: string
  ): Promise<ServicePackage> {
    const row = await packageRepo.getPackageById(supabase, packageId, studioId)
    if (!row) throw Errors.notFound('Package')
    return toServicePackage(row as Record<string, unknown>)
  },

  async createPackage(
    supabase: any,
    studioId: string,
    data: CreatePackageInput
  ): Promise<ServicePackage> {
    validateCreatePackage(data)
    const sortOrder = await packageRepo.getNextSortOrder(supabase, studioId)
    const row = await packageRepo.createPackage(supabase, studioId, {
      name: data.name,
      event_type: data.event_type,
      description: data.description ?? null,
      base_price: data.base_price,
      hsn_sac_code: data.hsn_sac_code ?? '998389',
      is_gst_applicable: data.is_gst_applicable ?? true,
      deliverables: data.deliverables ?? [],
      turnaround_days: data.turnaround_days ?? 30,
      line_items: data.line_items ?? [],
      sort_order: sortOrder,
    } as any)
    return toServicePackage(row as Record<string, unknown>)
  },

  async updatePackage(
    supabase: any,
    packageId: string,
    studioId: string,
    data: UpdatePackageInput,
    userId?: string
  ): Promise<ServicePackage> {
    await this.getPackageById(supabase, packageId, studioId)
    if (data.base_price != null && parseFloat(data.base_price) <= 0) throw Errors.validation('base_price must be positive')
    if (data.turnaround_days != null && (data.turnaround_days < 1 || data.turnaround_days > 365)) throw Errors.validation('turnaround_days must be 1-365')
    if (data.deliverables != null && data.deliverables.length > 20) throw Errors.validation('deliverables max 20 items')
    if (data.line_items != null && data.line_items.length > 20) throw Errors.validation('line_items max 20 items')
    if (data.line_items != null) {
      for (const li of data.line_items) {
        if (!li.name?.trim()) throw Errors.validation('line_item name required')
        if (parseFloat(li.quantity ?? '1') <= 0) throw Errors.validation('line_item quantity must be positive')
        if (parseFloat(li.unit_price) <= 0) throw Errors.validation('line_item unit_price must be positive')
      }
    }
    const row = await packageRepo.updatePackage(supabase, packageId, studioId, data as any)
    if (userId) {
      supabase
        .from('audit_logs')
        .insert({
          studio_id: studioId,
          user_id: userId,
          action: 'update',
          entity_type: 'service_packages',
          entity_id: packageId,
          entity_snapshot: { fields_changed: Object.keys(data) },
        })
        .then(({ error }: any) => {
          if (error) logError({ message: '[PackageService] audit_log insert failed', context: { error: String(error) } }).catch(() => {})
        })
    }
    return toServicePackage(row as Record<string, unknown>)
  },

  async deletePackage(
    supabase: any,
    packageId: string,
    studioId: string
  ): Promise<void> {
    await packageRepo.softDeletePackage(supabase, packageId, studioId)
  },

  getTemplates(): PackageTemplate[] {
    return PACKAGE_TEMPLATES.map((t) => ({
      ...t,
      is_template: true as const,
    }))
  },

  async getAddons(supabase: any, studioId: string): Promise<Addon[]> {
    const rows = await packageRepo.getAddons(supabase, studioId)
    return rows.map((r) => toAddon(r as Record<string, unknown>))
  },

  async createAddon(
    supabase: any,
    studioId: string,
    data: CreateAddonInput
  ): Promise<Addon> {
    validateCreateAddon(data)
    const row = await packageRepo.createAddon(supabase, studioId, {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      unit: data.unit ?? 'flat',
    } as any)
    return toAddon(row as Record<string, unknown>)
  },

  async updateAddon(
    supabase: any,
    addonId: string,
    studioId: string,
    data: UpdateAddonInput
  ): Promise<Addon> {
    if (data.price != null && parseFloat(data.price) <= 0) throw Errors.validation('price must be positive')
    if (data.unit != null && !['flat', 'per_hour', 'per_day'].includes(data.unit)) throw Errors.validation('unit must be flat, per_hour, or per_day')
    const row = await packageRepo.updateAddon(supabase, addonId, studioId, data as any)
    return toAddon(row as Record<string, unknown>)
  },

  async deleteAddon(
    supabase: any,
    addonId: string,
    studioId: string
  ): Promise<void> {
    await packageRepo.softDeleteAddon(supabase, addonId, studioId)
  },
}

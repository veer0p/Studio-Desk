import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { Errors } from '@/lib/errors'

type ServicePackagesRow = Database['public']['Tables']['service_packages']['Row']
type ServicePackagesInsert = Database['public']['Tables']['service_packages']['Insert']

export const packageRepo = {
  async create(
    supabase: SupabaseClient<Database>,
    studioId: string,
    data: {
      name: string
      event_type: string
      base_price: number
      description?: string | null
      hsn_sac_code?: string | null
      is_gst_applicable?: boolean
      deliverables?: string[] | null
      turnaround_days?: number | null
    }
  ): Promise<ServicePackagesRow> {
    const insert: ServicePackagesInsert = {
      studio_id: studioId,
      name: data.name,
      event_type: data.event_type as ServicePackagesInsert['event_type'],
      base_price: data.base_price,
      description: data.description ?? null,
      hsn_sac_code: data.hsn_sac_code ?? null,
      is_gst_applicable: data.is_gst_applicable ?? true,
      deliverables: data.deliverables ?? null,
      turnaround_days: data.turnaround_days ?? null,
      is_active: true,
      sort_order: null,
    }

    const { data: row, error } = await supabase
      .from('service_packages')
      .insert(insert)
      .select()
      .single()

    if (error || !row) throw Errors.validation('Failed to create service package')
    return row as ServicePackagesRow
  },
}

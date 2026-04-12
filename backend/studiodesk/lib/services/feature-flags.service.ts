import { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>

export interface FeatureFlagRow {
  id: string
  key: string
  label: string
  description: string
  is_enabled: boolean
  studio_id: string | null
  metadata: Record<string, unknown> | null
  updated_at: string
  created_at: string
}

export interface FeatureFlag {
  id: string
  key: string
  label: string
  description: string
  is_enabled: boolean
  category: string
  metadata: Record<string, unknown> | null
  updated_at: string
  created_at: string
}

const PLATFORM_DEFAULTS: Omit<FeatureFlag, 'id' | 'updated_at' | 'created_at'>[] = [
  // Communication
  { key: 'enable_whatsapp', label: 'WhatsApp Notifications', description: 'Send booking confirmations, reminders, and updates via WhatsApp', is_enabled: false, category: 'Communication', metadata: null },
  { key: 'enable_sms', label: 'SMS Notifications', description: 'Send SMS alerts for critical booking events', is_enabled: false, category: 'Communication', metadata: null },
  { key: 'enable_email_reminders', label: 'Email Reminders', description: 'Automatically send email reminders to clients before their shoot date', is_enabled: true, category: 'Communication', metadata: null },

  // Gallery
  { key: 'enable_gallery_videos', label: 'Video Galleries', description: 'Allow clients to view and download videos through the gallery portal', is_enabled: false, category: 'Gallery', metadata: null },
  { key: 'enable_face_recognition', label: 'Face Recognition', description: 'Enable AI-powered face grouping for easier photo selection', is_enabled: false, category: 'Gallery', metadata: null },
  { key: 'enable_gallery_customization', label: 'Gallery Customization', description: 'Allow custom branding and themes on client-facing galleries', is_enabled: false, category: 'Gallery', metadata: null },

  // Contracts
  { key: 'enable_contract_clauses', label: 'Custom Contract Clauses', description: 'Add custom clauses and terms to your contracts beyond the standard template', is_enabled: false, category: 'Contracts', metadata: null },
  { key: 'enable_e_signatures', label: 'E-Signatures', description: 'Allow clients to sign contracts digitally within StudioDesk', is_enabled: true, category: 'Contracts', metadata: null },

  // Analytics
  { key: 'enable_advanced_analytics', label: 'Advanced Analytics', description: 'Access detailed revenue trends, booking patterns, and client insights', is_enabled: false, category: 'Analytics', metadata: null },
  { key: 'enable_export_reports', label: 'Export Reports', description: 'Export financial and booking reports as CSV or PDF', is_enabled: true, category: 'Analytics', metadata: null },
]

async function getFlagsForStudio(supabase: Db, studioId: string): Promise<FeatureFlag[]> {
  // Fetch all platform-wide flags (studio_id IS NULL)
  const { data: platformFlags, error: platformError } = await supabase
    .from('feature_flags')
    .select('*')
    .is('studio_id', null)
    .order('key')

  if (platformError) {
    throw Errors.validation(`Failed to fetch platform flags: ${platformError.message}`)
  }

  // Fetch studio-specific overrides
  const { data: studioFlags, error: studioError } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('studio_id', studioId)

  if (studioError) {
    throw Errors.validation(`Failed to fetch studio flags: ${studioError.message}`)
  }

  // Build a map of studio overrides by key
  const studioOverrideMap = new Map<string, FeatureFlagRow>()
  for (const row of (studioFlags ?? [])) {
    studioOverrideMap.set(row.key, row)
  }

  // Merge platform defaults with studio overrides
  const results: FeatureFlag[] = []

  for (const platformFlag of (platformFlags ?? [])) {
    const override = studioOverrideMap.get(platformFlag.key)
    const merged: FeatureFlag = {
      id: override?.id ?? platformFlag.id,
      key: platformFlag.key,
      label: platformFlag.label,
      description: platformFlag.description,
      is_enabled: override?.is_enabled ?? platformFlag.is_enabled,
      category: (platformFlag.metadata as Record<string, unknown> | null)?.category as string ?? 'General',
      metadata: platformFlag.metadata,
      updated_at: override?.updated_at ?? platformFlag.updated_at,
      created_at: platformFlag.created_at,
    }
    results.push(merged)
  }

  // Also include any platform flags that only exist as studio overrides (not in platform defaults)
  const platformKeys = new Set((platformFlags ?? []).map(f => f.key))
  for (const [key, studioFlag] of studioOverrideMap) {
    if (!platformKeys.has(key)) {
      results.push({
        id: studioFlag.id,
        key: studioFlag.key,
        label: studioFlag.label,
        description: studioFlag.description,
        is_enabled: studioFlag.is_enabled,
        category: (studioFlag.metadata as Record<string, unknown> | null)?.category as string ?? 'General',
        metadata: studioFlag.metadata,
        updated_at: studioFlag.updated_at,
        created_at: studioFlag.created_at,
      })
    }
  }

  // Also add any hardcoded defaults that don't exist in the database yet
  const dbKeys = new Set(results.map(r => r.key))
  for (const defaultFlag of PLATFORM_DEFAULTS) {
    if (!dbKeys.has(defaultFlag.key)) {
      results.push({
        id: `default-${defaultFlag.key}`,
        key: defaultFlag.key,
        label: defaultFlag.label,
        description: defaultFlag.description,
        is_enabled: defaultFlag.is_enabled,
        category: defaultFlag.category,
        metadata: defaultFlag.metadata,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
    }
  }

  // Sort by category then label
  results.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label))

  return results
}

async function toggleFlag(
  supabase: Db,
  studioId: string,
  key: string,
  isEnabled: boolean
): Promise<FeatureFlag> {
  // First, check if the platform flag exists
  const { data: platformFlag, error: fetchError } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('key', key)
    .is('studio_id', null)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw Errors.validation(`Failed to fetch flag: ${fetchError.message}`)
  }

  if (!platformFlag) {
    throw Errors.notFound(`Feature flag "${key}"`)
  }

  // Check if a studio-specific override already exists
  const { data: existingOverride, error: existingError } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('key', key)
    .eq('studio_id', studioId)
    .single()

  if (existingError && existingError.code !== 'PGRST116') {
    throw Errors.validation(`Failed to check existing flag: ${existingError.message}`)
  }

  let result: FeatureFlagRow

  if (existingOverride) {
    // Update existing override
    const { data, error: updateError } = await supabase
      .from('feature_flags')
      .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
      .eq('id', existingOverride.id)
      .select()
      .single()

    if (updateError) {
      throw Errors.validation(`Failed to update flag: ${updateError.message}`)
    }
    result = data
  } else {
    // Create new studio-specific override
    const { data, error: insertError } = await supabase
      .from('feature_flags')
      .insert({
        key: platformFlag.key,
        label: platformFlag.label,
        description: platformFlag.description,
        is_enabled: isEnabled,
        studio_id: studioId,
        metadata: platformFlag.metadata,
      })
      .select()
      .single()

    if (insertError) {
      throw Errors.validation(`Failed to create flag override: ${insertError.message}`)
    }
    result = data
  }

  return {
    id: result.id,
    key: result.key,
    label: result.label,
    description: result.description,
    is_enabled: result.is_enabled,
    category: (result.metadata as Record<string, unknown> | null)?.category as string ?? 'General',
    metadata: result.metadata,
    updated_at: result.updated_at,
    created_at: result.created_at,
  }
}

export const FeatureFlagService = {
  getFlagsForStudio,
  toggleFlag,
}

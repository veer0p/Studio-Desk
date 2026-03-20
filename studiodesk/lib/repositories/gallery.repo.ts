import { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { Errors } from '@/lib/errors'

type Db = SupabaseClient<any>

const LIST_SELECT = `
  id, studio_id, booking_id, slug, immich_album_id, immich_library_id, status, total_photos, total_videos,
  published_at, expires_at, access_token, view_count, download_count, created_at, updated_at, is_published,
  booking:bookings!galleries_booking_id_fkey(title, event_type, event_date, client:clients!bookings_client_id_fkey(full_name))
`

const DETAIL_SELECT = `
  id, studio_id, booking_id, slug, immich_album_id, immich_library_id, status, total_photos, total_videos,
  total_size_mb, published_at, expires_at, access_token, view_count, download_count, created_at, updated_at,
  is_published, is_download_enabled, last_viewed_at,
  booking:bookings!galleries_booking_id_fkey(title, event_type, event_date, venue_name, client_id,
    client:clients!bookings_client_id_fkey(full_name, phone, email)),
  studio:studios!galleries_studio_id_fkey(name, logo_url, brand_color, phone, email)
`

function parseMeta(value: unknown) {
  if (typeof value !== 'string' || !value.trim().startsWith('{')) return {}
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return {}
  }
}

function stringifyMeta(value: Record<string, unknown>) {
  return JSON.stringify(value)
}

function apiStatus(row: any) {
  if (row.status === 'published' || row.is_published) return 'published'
  if (row.status === 'expired') return 'expired'
  if (row.status === 'archived') return 'archived'
  return 'draft'
}

function shapeGallery(row: any) {
  const meta = parseMeta(row.immich_library_id)
  return {
    id: row.id,
    studio_id: row.studio_id,
    booking_id: row.booking_id,
    name: String(meta.name ?? row.booking?.title ?? 'Gallery'),
    slug: row.slug,
    immich_album_id: row.immich_album_id,
    status: apiStatus(row),
    total_photos: row.total_photos ?? 0,
    total_videos: row.total_videos ?? 0,
    cover_photo_immich_id: meta.cover_photo_immich_id ?? null,
    published_at: row.published_at,
    expires_at: row.expires_at,
    share_link_url: meta.share_link_url ?? null,
    share_link_immich_id: meta.share_link_immich_id ?? null,
    qr_code_url: meta.qr_code_url ?? null,
    access_token: row.access_token,
    client_access_token: meta.client_access_token ?? null,
    views_count: row.view_count ?? 0,
    downloads_count: row.download_count ?? 0,
    processing_started_at: meta.processing_started_at ?? null,
    processing_completed_at: meta.processing_completed_at ?? null,
    booking_title: row.booking?.title ?? '',
    event_type: row.booking?.event_type ?? null,
    event_date: row.booking?.event_date ?? null,
    venue_name: row.booking?.venue_name ?? null,
    client_name: row.booking?.client?.full_name ?? '',
    client_phone: row.booking?.client?.phone ?? null,
    client_email: row.booking?.client?.email ?? null,
    studio_name: row.studio?.name ?? null,
    studio_logo_url: row.studio?.logo_url ?? null,
    studio_brand_color: row.studio?.brand_color ?? '#1A3C5E',
    studio_phone: row.studio?.phone ?? null,
    studio_email: row.studio?.email ?? null,
    total_size_mb: row.total_size_mb ?? 0,
    is_download_enabled: row.is_download_enabled ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

async function currentMeta(supabase: Db, galleryId: string) {
  const { data } = await supabase.from('galleries').select('immich_library_id').eq('id', galleryId).maybeSingle()
  return parseMeta(data?.immich_library_id)
}

function statusFilter(query: any, status?: string) {
  if (!status) return query
  if (status === 'draft') return query.in('status', ['processing', 'ready'])
  return query.eq('status', status)
}

export const galleryRepo = {
  async getGalleries(supabase: Db, studioId: string, params: any) {
    let query = supabase.from('galleries').select(LIST_SELECT, { count: 'exact' }).eq('studio_id', studioId)
    if (params.booking_id) query = query.eq('booking_id', params.booking_id)
    query = statusFilter(query, params.status)
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(params.page * params.pageSize, (params.page + 1) * params.pageSize - 1)
    if (error) throw Errors.validation('Failed to fetch galleries')
    return { data: (data ?? []).map(shapeGallery), count: count ?? 0 }
  },

  async getGalleryById(supabase: Db, galleryId: string, studioId: string) {
    const { data, error } = await supabase
      .from('galleries')
      .select(DETAIL_SELECT)
      .eq('id', galleryId)
      .eq('studio_id', studioId)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch gallery')
    return data ? shapeGallery(data) : null
  },

  async getGalleryBySlug(supabase: Db, slug: string) {
    const { data, error } = await supabase.from('galleries').select(DETAIL_SELECT).eq('slug', slug).maybeSingle()
    if (error) throw Errors.validation('Failed to fetch gallery')
    return data ? shapeGallery(data) : null
  },

  async createGallery(supabase: Db, data: Record<string, unknown>) {
    const meta = data.compat_meta as Record<string, unknown> | undefined
    const payload = { ...data, compat_meta: undefined, immich_library_id: stringifyMeta(meta ?? {}) }
    const { data: row, error } = await supabase.from('galleries').insert(payload).select('id').single()
    if (error || !row) throw Errors.validation('Failed to create gallery')
    return this.getGalleryById(supabase, row.id as string, data.studio_id as string)
  },

  async updateGallery(supabase: Db, galleryId: string, studioId: string, data: Record<string, unknown>) {
    const current = await this.getGalleryById(supabase, galleryId, studioId)
    if (!current) throw Errors.notFound('Gallery')
    const meta = { ...(await currentMeta(supabase, galleryId)), ...((data.compat_meta as object) ?? {}) }
    const payload = {
      ...data,
      compat_meta: undefined,
      immich_library_id: stringifyMeta(meta),
      updated_at: new Date().toISOString(),
    }
    const { data: row, error } = await supabase
      .from('galleries')
      .update(payload)
      .eq('id', galleryId)
      .eq('studio_id', studioId)
      .select('id')
      .single()
    if (error || !row) throw Errors.validation('Failed to update gallery')
    return this.getGalleryById(supabase, row.id as string, studioId)
  },

  async getFaceClusters(supabase: Db, galleryId: string, studioId: string) {
    const { data, error } = await supabase
      .from('face_clusters')
      .select('id, gallery_id, studio_id, immich_person_id, label, representative_photo_url, photo_count, is_labeled, created_at, updated_at')
      .eq('gallery_id', galleryId)
      .eq('studio_id', studioId)
      .order('photo_count', { ascending: false })
    if (error) throw Errors.validation('Failed to fetch face clusters')
    return (data ?? []).map((row: any) => ({
      id: row.id,
      gallery_id: row.gallery_id,
      studio_id: row.studio_id,
      immich_person_id: row.immich_person_id,
      label: row.label,
      thumbnail_url: row.representative_photo_url,
      face_count: row.photo_count ?? 0,
      is_labeled: row.is_labeled ?? false,
      is_hidden: false,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))
  },

  async upsertFaceCluster(supabase: Db, data: Record<string, unknown>) {
    const { data: existing } = await supabase
      .from('face_clusters')
      .select('id')
      .eq('gallery_id', data.gallery_id)
      .eq('studio_id', data.studio_id)
      .eq('immich_person_id', data.immich_person_id)
      .maybeSingle()
    if (existing?.id) {
      const { error } = await supabase
        .from('face_clusters')
        .update({
          label: data.label ?? null,
          photo_count: data.photo_count ?? 0,
          representative_photo_url: data.representative_photo_url ?? null,
          is_labeled: data.is_labeled ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (error) throw Errors.validation('Failed to sync face cluster')
      return existing
    }
    const { data: row, error } = await supabase
      .from('face_clusters')
      .insert({
        gallery_id: data.gallery_id,
        studio_id: data.studio_id,
        immich_person_id: data.immich_person_id,
        label: data.label ?? null,
        photo_count: data.photo_count ?? 0,
        representative_photo_url: data.representative_photo_url ?? null,
        is_labeled: data.is_labeled ?? false,
      })
      .select('id')
      .single()
    if (error || !row) throw Errors.validation('Failed to sync face cluster')
    return row
  },

  async updateFaceClusterLabel(supabase: Db, clusterId: string, galleryId: string, studioId: string, label: string) {
    const { data, error } = await supabase
      .from('face_clusters')
      .update({ label, is_labeled: true, updated_at: new Date().toISOString() })
      .eq('id', clusterId)
      .eq('gallery_id', galleryId)
      .eq('studio_id', studioId)
      .select('id, gallery_id, studio_id, immich_person_id, label, representative_photo_url, photo_count, is_labeled, created_at, updated_at')
      .maybeSingle()
    if (error) throw Errors.validation('Failed to update face cluster')
    if (!data) throw Errors.notFound('Face cluster')
    return {
      id: data.id,
      gallery_id: data.gallery_id,
      studio_id: data.studio_id,
      immich_person_id: data.immich_person_id,
      label: data.label,
      thumbnail_url: data.representative_photo_url,
      face_count: data.photo_count ?? 0,
      is_labeled: data.is_labeled ?? false,
      is_hidden: false,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }
  },

  async getUploadJob(supabase: Db, jobId: string, studioId: string) {
    const { data, error } = await supabase
      .from('file_upload_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('studio_id', studioId)
      .maybeSingle()
    if (error) throw Errors.validation('Failed to fetch upload job')
    return data
  },

  async createUploadJob(supabase: Db, data: Record<string, unknown>) {
    const { data: row, error } = await supabase.from('file_upload_jobs').insert(data).select('*').single()
    if (error || !row) throw Errors.validation('Failed to create upload job')
    return row
  },

  async updateUploadJob(supabase: Db, jobId: string, data: Record<string, unknown>) {
    const { error } = await supabase
      .from('file_upload_jobs')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', jobId)
    if (error) throw Errors.validation('Failed to update upload job')
  },

  async createGalleryPhoto(supabase: Db, data: Record<string, unknown>) {
    const { error } = await supabase.from('gallery_photos').insert(data)
    if (error) throw Errors.validation('Failed to save gallery photo')
  },

  async findPhotosByPersonIds(supabase: Db, galleryId: string, personIds: string[]) {
    if (!personIds.length) return []
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('immich_asset_id, filename, face_cluster_ids')
      .eq('gallery_id', galleryId)
      .overlaps('face_cluster_ids', personIds)
    if (error) throw Errors.validation('Failed to fetch gallery photos')
    return data ?? []
  },

  async incrementViews(supabase: Db, galleryId: string, currentViews: number) {
    await supabase
      .from('galleries')
      .update({
        view_count: currentViews + 1,
        last_viewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', galleryId)
  },

  async logGalleryAccess(
    supabase: Db,
    data: { studio_id: string; gallery_id: string; accessed_by_ip?: string; access_type: string; face_matched_person_id?: string }
  ) {
    supabase
      .from('gallery_share_logs')
      .insert({
        studio_id: data.studio_id,
        gallery_id: data.gallery_id,
        event_type: data.access_type,
        ip_address: data.accessed_by_ip ?? null,
        cluster_token: data.face_matched_person_id ?? null,
      })
      .then(() => {})
      .catch(() => {})
  },

  createAdmin() {
    return createAdminClient()
  },
}

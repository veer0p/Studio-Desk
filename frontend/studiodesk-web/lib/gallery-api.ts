import { verifyClientPin } from '@/lib/api'

export interface GalleryPhoto {
  id: string
  immich_asset_id: string
  filename: string
  mime_type: string
  taken_at?: string
  width: number
  height: number
  is_video: boolean
  thumb_url: string
  download_url: string
}

export interface GalleryMetadata {
  name: string
  status: string
  total_photos: number
  face_clusters: Array<{ label: string; face_count: number }>
  studio: {
    name: string
    logo_url: string | null
    brand_color: string | null
  }
  event: {
    event_type: string
    event_date: string
  }
}

export interface GalleryData {
  metadata: GalleryMetadata
  photos: GalleryPhoto[]
}

/**
 * Fetch public gallery metadata + first page of photos.
 */
export async function fetchPublicGallery(slug: string): Promise<GalleryData> {
  const res = await fetch(`/api/v1/gallery/${slug}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Gallery not found' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  const data = json.data as GalleryMetadata & { photos?: GalleryPhoto[] }

  return {
    metadata: {
      name: data.name,
      status: data.status,
      total_photos: data.total_photos,
      face_clusters: data.face_clusters || [],
      studio: data.studio,
      event: data.event,
    },
    photos: data.photos || [],
  }
}

/**
 * Fetch paginated photos for a public gallery.
 */
export async function fetchGalleryPhotos(slug: string, page = 0): Promise<{
  photos: GalleryPhoto[]
  total: number
  page: number
  totalPages: number
}> {
  const res = await fetch(`/api/v1/gallery/${slug}/photos?page=${page}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch photos')
  }

  const json = await res.json()
  return {
    photos: json.data || [],
    total: json.meta?.count || 0,
    page: json.meta?.page || 0,
    totalPages: json.meta?.totalPages || 0,
  }
}

export { verifyClientPin }

/**
 * Mark photos as favorites.
 */
export async function saveGalleryFavorites(slug: string, assetIds: string[]): Promise<{ saved: number }> {
  const res = await fetch(`/api/v1/gallery/${slug}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids: assetIds }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to save favorites' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as { saved: number }
}

/**
 * Get favorited asset IDs for a gallery.
 */
export async function fetchGalleryFavorites(slug: string): Promise<string[]> {
  const res = await fetch(`/api/v1/gallery/${slug}/favorites`)

  if (!res.ok) {
    return []
  }

  const json = await res.json()
  return json.data?.asset_ids || []
}

/**
 * Request bulk download of all gallery photos.
 */
export async function requestBulkDownload(slug: string): Promise<{
  download_url: string
  asset_count: number
  message: string
}> {
  const res = await fetch(`/api/v1/gallery/${slug}/download-all`, {
    method: 'POST',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to request download' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return json.data as { download_url: string; asset_count: number; message: string }
}

import { SupabaseClient } from '@supabase/supabase-js'
import { checkAndIncrementRateLimit } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateSecureToken } from '@/lib/crypto'
import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'
import { logError } from '@/lib/logger'
import { galleryRepo } from '@/lib/repositories/gallery.repo'
import { ImmichService } from '@/lib/services/immich.service'

type Db = SupabaseClient<any>
type UploadFile = { name: string; mimeType: string; size: number; data: string; taken_at?: string }

const pendingUploads = new Map<string, { files: UploadFile[]; studioId: string; galleryId: string; apiKey: string }>()

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'gallery'
}

function galleryName(title: string, name?: string) {
  return (name?.trim() || `${title} Gallery`).slice(0, 200)
}

function bytesToMb(size: number) {
  return Number((size / (1024 * 1024)).toFixed(4))
}

function ipOf(value: string) {
  return value.split(',')[0]?.trim() || '0.0.0.0'
}

function nowIso() {
  return new Date().toISOString()
}

function logInsert(supabase: Db, table: string, payload: Record<string, unknown>) {
  supabase.from(table).insert(payload).then(() => {}).catch(() => {})
}

function fireAndForget(task: Promise<unknown> | void) {
  Promise.resolve(task).catch(() => {})
}

async function getBooking(supabase: Db, bookingId: string, studioId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, title, event_date, event_type, client_id, studio_id, deleted_at')
    .eq('id', bookingId)
    .eq('studio_id', studioId)
    .maybeSingle()
  if (error) throw Errors.validation('Failed to fetch booking')
  if (!data || data.deleted_at) throw Errors.notFound('Booking')
  return data
}

async function checkQuota(supabase: Db, studioId: string, totalSizeGb: number) {
  const { data, error } = await supabase.from('studios').select('storage_used_gb, storage_limit_gb').eq('id', studioId).single()
  if (error || !data) throw Errors.notFound('Studio')
  if (Number(data.storage_used_gb ?? 0) + totalSizeGb > Number(data.storage_limit_gb ?? 0)) throw Errors.quotaExceeded()
}

async function syncFaceClusters(galleryId: string, studioId: string, apiKey: string) {
  const admin = createAdminClient()
  const people = await ImmichService.getPeople(apiKey)
  for (const person of people) {
    await galleryRepo.upsertFaceCluster(admin, {
      gallery_id: galleryId,
      studio_id: studioId,
      immich_person_id: person.id,
      label: person.name || null,
      photo_count: person.faces,
      representative_photo_url: person.thumbnailPath || null,
      is_labeled: Boolean(person.name),
    })
  }
}

async function processUploadJob(jobId: string) {
  const pending = pendingUploads.get(jobId)
  if (!pending) return
  const admin = createAdminClient()
  try {
    const gallery = await galleryRepo.getGalleryById(admin, pending.galleryId, pending.studioId)
    if (!gallery) throw Errors.notFound('Gallery')
    await galleryRepo.updateUploadJob(admin, jobId, { status: 'processing', started_at: nowIso() })
    let albumId = gallery.immich_album_id
    if (!albumId) {
      const album = await ImmichService.createAlbum(pending.apiKey, gallery.name, `Studio gallery for ${gallery.event_date ?? ''}`)
      albumId = album.id
      await galleryRepo.updateGallery(admin, gallery.id, gallery.studio_id, { immich_album_id: album.id })
    }
    let processed = 0
    let failed = 0
    let processedSize = 0
    let photosAdded = 0
    let videosAdded = 0
    const assetIds: string[] = []
    const errors: Array<{ file: string; error: string }> = []
    for (const file of pending.files) {
      try {
        const buffer = Buffer.from(file.data, 'base64')
        const uploaded = await ImmichService.uploadAsset(pending.apiKey, {
          fileBuffer: buffer,
          fileName: file.name,
          mimeType: file.mimeType,
          fileCreatedAt: file.taken_at ?? nowIso(),
          deviceAssetId: `${pending.studioId}:${pending.galleryId}:${file.name}:${processed + failed}`,
        })
        assetIds.push(uploaded.id)
        processed += 1
        processedSize += bytesToMb(file.size)
        if (file.mimeType.startsWith('video/')) {
          videosAdded += 1
          await admin.from('gallery_videos').insert({
            gallery_id: pending.galleryId,
            studio_id: pending.studioId,
            immich_asset_id: uploaded.id,
            filename: file.name,
            file_size_mb: bytesToMb(file.size),
            taken_at: file.taken_at ?? null,
          })
        } else {
          photosAdded += 1
          await galleryRepo.createGalleryPhoto(admin, {
            gallery_id: pending.galleryId,
            studio_id: pending.studioId,
            immich_asset_id: uploaded.id,
            filename: file.name,
            file_size_mb: bytesToMb(file.size),
            taken_at: file.taken_at ?? null,
          })
        }
      } catch (error) {
        failed += 1
        errors.push({ file: file.name, error: String(error) })
      }
      await galleryRepo.updateUploadJob(admin, jobId, {
        processed_files: processed,
        failed_files: failed,
        processed_size_mb: processedSize,
        error_log: errors,
      })
    }
    if (albumId && assetIds.length) await ImmichService.addAssetsToAlbum(pending.apiKey, albumId, assetIds)
    await galleryRepo.updateGallery(admin, pending.galleryId, pending.studioId, {
      total_photos: Number(gallery.total_photos ?? 0) + photosAdded,
      total_videos: Number(gallery.total_videos ?? 0) + videosAdded,
      total_size_mb: Number(gallery.total_size_mb ?? 0) + processedSize,
      status: gallery.status === 'published' ? 'published' : 'ready',
      compat_meta: {
        processing_completed_at: nowIso(),
        cover_photo_immich_id: assetIds[0] ?? gallery.cover_photo_immich_id,
      },
    })
    await galleryRepo.updateUploadJob(admin, jobId, {
      status: failed === pending.files.length ? 'failed' : 'completed',
      completed_at: nowIso(),
    })
    logInsert(admin, 'booking_activity_feed', {
      studio_id: pending.studioId,
      booking_id: gallery.booking_id,
      event_type: 'photos_uploaded',
      actor_type: 'system',
      metadata: { processed_files: processed, failed_files: failed },
    })
    fireAndForget(syncFaceClusters(pending.galleryId, pending.studioId, pending.apiKey))
  } catch (error) {
    await galleryRepo.updateUploadJob(admin, jobId, { status: 'failed', completed_at: nowIso(), error_log: [{ error: String(error) }] }).catch(() => {})
    await logError({ message: 'gallery_upload_job_failed', context: { jobId, error: String(error) } })
  } finally {
    pendingUploads.delete(jobId)
  }
}

export const GalleryService = {
  async getGalleries(supabase: Db, studioId: string, params: any) {
    return galleryRepo.getGalleries(supabase, studioId, params)
  },

  async getGalleryById(supabase: Db, galleryId: string, studioId: string) {
    const [gallery, clusters] = await Promise.all([
      galleryRepo.getGalleryById(supabase, galleryId, studioId),
      galleryRepo.getFaceClusters(supabase, galleryId, studioId),
    ])
    if (!gallery) throw Errors.notFound('Gallery')
    return { ...gallery, face_clusters: clusters }
  },

  async createGallery(supabase: Db, studioId: string, data: any, _userId: string) {
    const booking = await getBooking(supabase, data.booking_id, studioId)
    const existing = await galleryRepo.getGalleries(supabase, studioId, {
      booking_id: data.booking_id,
      page: 0,
      pageSize: 1,
    })
    if (existing.count > 0) throw Errors.conflict('A gallery already exists for this booking')
    const name = galleryName(booking.title, data.name)
    let albumId: string | null = null
    try {
      const creds = await ImmichService.getStudioImmichCredentials(supabase, studioId)
      albumId = (await ImmichService.createAlbum(creds.apiKey, name, `Studio gallery for ${booking.event_date ?? ''}`)).id
    } catch (error) {
      await logError({ message: 'gallery_album_create_failed', studioId, context: { bookingId: booking.id, error: String(error) } })
    }
    const slug = `${slugify(name)}-${generateSecureToken(4)}`
    const gallery = await galleryRepo.createGallery(supabase, {
      studio_id: studioId,
      booking_id: booking.id,
      immich_album_id: albumId,
      status: 'ready',
      slug,
      compat_meta: { name },
    })
    return this.getGalleryById(supabase, gallery!.id, studioId)
  },

  async updateGallery(supabase: Db, galleryId: string, studioId: string, data: any) {
    const current = await galleryRepo.getGalleryById(supabase, galleryId, studioId)
    if (!current) throw Errors.notFound('Gallery')
    await galleryRepo.updateGallery(supabase, galleryId, studioId, { compat_meta: { name: data.name } })
    return this.getGalleryById(supabase, galleryId, studioId)
  },

  async queuePhotoUpload(supabase: Db, galleryId: string, studioId: string, files: UploadFile[], _userId: string) {
    const gallery = await galleryRepo.getGalleryById(supabase, galleryId, studioId)
    if (!gallery) throw Errors.notFound('Gallery')
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
    await checkQuota(supabase, studioId, totalBytes / (1024 * 1024 * 1024))
    const { apiKey } = await ImmichService.getStudioImmichCredentials(supabase, studioId)
    const job = await galleryRepo.createUploadJob(supabase, {
      studio_id: studioId,
      gallery_id: galleryId,
      status: 'queued',
      total_files: files.length,
      processed_files: 0,
      failed_files: 0,
      total_size_mb: bytesToMb(totalBytes),
      processed_size_mb: 0,
      error_log: [],
    })
    pendingUploads.set(job.id, { files, studioId, galleryId, apiKey })
    fireAndForget(galleryRepo.updateGallery(supabase, galleryId, studioId, { compat_meta: { processing_started_at: nowIso() } }))
    if (env.NODE_ENV !== 'test') setTimeout(() => processUploadJob(job.id).catch(() => {}), 0)
    return { job_id: job.id }
  },

  async getUploadStatus(supabase: Db, jobId: string, studioId: string) {
    const job = await galleryRepo.getUploadJob(supabase, jobId, studioId)
    if (!job) throw Errors.notFound('Upload job')
    return {
      job_id: job.id,
      status: job.status,
      total_files: job.total_files,
      processed_files: job.processed_files,
      failed_files: job.failed_files,
      progress_pct: job.total_files ? Number((((job.processed_files + job.failed_files) / job.total_files) * 100).toFixed(1)) : 0,
      started_at: job.started_at,
      completed_at: job.completed_at,
    }
  },

  async getFaceClusters(supabase: Db, galleryId: string, studioId: string) {
    const clusters = await galleryRepo.getFaceClusters(supabase, galleryId, studioId)
    ImmichService.getStudioImmichCredentials(supabase, studioId)
      .then(({ apiKey }) => syncFaceClusters(galleryId, studioId, apiKey))
      .catch(() => {})
    return clusters
  },

  async labelFaceCluster(supabase: Db, galleryId: string, studioId: string, clusterId: string, label: string) {
    const cluster = (await galleryRepo.getFaceClusters(supabase, galleryId, studioId)).find((row) => row.id === clusterId)
    if (!cluster || !cluster.immich_person_id) throw Errors.notFound('Face cluster')
    const { apiKey } = await ImmichService.getStudioImmichCredentials(supabase, studioId)
    await ImmichService.labelPerson(apiKey, cluster.immich_person_id, label)
    return galleryRepo.updateFaceClusterLabel(supabase, clusterId, galleryId, studioId, label)
  },

  async publishGallery(supabase: Db, galleryId: string, studioId: string, params: any, userId: string) {
    const gallery = await galleryRepo.getGalleryById(supabase, galleryId, studioId)
    if (!gallery) throw Errors.notFound('Gallery')
    if (gallery.status === 'published') throw Errors.conflict('Gallery is already published')
    if ((gallery.total_photos ?? 0) === 0) throw Errors.validation('Cannot publish empty gallery. Upload photos first.')
    const { apiKey } = await ImmichService.getStudioImmichCredentials(supabase, studioId)
    let albumId = gallery.immich_album_id
    if (!albumId) albumId = (await ImmichService.createAlbum(apiKey, gallery.name, `Studio gallery for ${gallery.event_date ?? ''}`)).id
    const link = await ImmichService.createShareLink(apiKey, albumId, {
      expiresAt: params.expires_at,
      allowDownload: params.allow_download ?? true,
    })
    await galleryRepo.updateGallery(supabase, galleryId, studioId, {
      immich_album_id: albumId,
      status: 'published',
      is_published: true,
      published_at: nowIso(),
      expires_at: params.expires_at ?? gallery.expires_at,
      is_download_enabled: params.allow_download ?? true,
      compat_meta: {
        share_link_url: link.url,
        share_link_immich_id: link.id,
        qr_code_url: `${env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`,
      },
    })
    logInsert(supabase, 'booking_activity_feed', {
      studio_id: studioId,
      booking_id: gallery.booking_id,
      event_type: 'gallery_published',
      actor_id: userId,
      actor_type: 'member',
    })
    logInsert(supabase, 'automation_log', {
      studio_id: studioId,
      booking_id: gallery.booking_id,
      automation_type: 'gallery_ready',
      channel: 'whatsapp',
      status: 'sent',
      message_body: `Gallery ready: ${env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`,
    })
    return this.getGalleryById(supabase, galleryId, studioId)
  },

  async getShareInfo(supabase: Db, galleryId: string, studioId: string) {
    const gallery = await this.getGalleryById(supabase, galleryId, studioId)
    return {
      slug: gallery.slug,
      share_link_url: gallery.share_link_url,
      qr_code_url: gallery.qr_code_url,
      access_token: gallery.access_token,
      published_at: gallery.published_at,
      expires_at: gallery.expires_at,
      views_count: gallery.views_count,
      total_photos: gallery.total_photos,
      gallery_public_url: `${env.NEXT_PUBLIC_APP_URL}/gallery/${gallery.slug}`,
    }
  },

  async getPublicGallery(slug: string, ipAddress: string) {
    const admin = createAdminClient()
    const gallery = await galleryRepo.getGalleryBySlug(admin, slug)
    if (!gallery) throw Errors.notFound('Gallery')
    if (gallery.status !== 'published') throw Errors.forbidden()
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) throw Errors.conflict('Gallery has expired')
    fireAndForget(galleryRepo.incrementViews(admin, gallery.id, gallery.views_count ?? 0))
    fireAndForget(
      galleryRepo.logGalleryAccess(admin, {
        studio_id: gallery.studio_id,
        gallery_id: gallery.id,
        accessed_by_ip: ipOf(ipAddress),
        access_type: 'view',
      })
    )
    const face_clusters = (await galleryRepo.getFaceClusters(admin, gallery.id, gallery.studio_id))
      .filter((row) => row.is_labeled)
      .map((row) => ({ label: row.label, face_count: row.face_count }))
    return {
      name: gallery.name,
      status: gallery.status,
      total_photos: gallery.total_photos,
      share_link_url: gallery.share_link_url,
      face_clusters,
      studio: {
        name: gallery.studio_name,
        logo_url: gallery.studio_logo_url,
        brand_color: gallery.studio_brand_color,
      },
      event: {
        event_type: gallery.event_type,
        event_date: gallery.event_date,
      },
    }
  },

  async guestSelfieLookup(slug: string, selfieBuffer: Buffer, fileName: string, ipAddress: string) {
    const admin = createAdminClient()
    const gallery = await galleryRepo.getGalleryBySlug(admin, slug)
    if (!gallery || gallery.status !== 'published') throw Errors.forbidden()
    if (gallery.expires_at && new Date(gallery.expires_at) < new Date()) throw Errors.forbidden()
    await checkAndIncrementRateLimit(`gallery_lookup:${slug}:${ipOf(ipAddress)}`)
    const { apiKey } = await ImmichService.getStudioImmichCredentials(admin, gallery.studio_id)
    let tempAssetId: string | null = null
    try {
      const tempAsset = await ImmichService.uploadAsset(apiKey, {
        fileBuffer: selfieBuffer,
        fileName: `temp-${Date.now()}-${fileName}`,
        mimeType: 'image/jpeg',
        fileCreatedAt: nowIso(),
        deviceAssetId: `selfie:${ipOf(ipAddress)}:${Date.now()}`,
      })
      tempAssetId = tempAsset.id
      if (!(await ImmichService.waitForFaceDetection(apiKey, 60000))) {
        return { matched: false, photo_count: 0, photos: [], message: 'Face detection timed out. Please try again.' }
      }
      const faces = await ImmichService.getFacesForAsset(apiKey, tempAsset.id)
      if (!faces.length) {
        return { matched: false, photo_count: 0, photos: [], message: 'No face detected in your photo. Please try with a clearer selfie.' }
      }
      const personIds = Array.from(new Set(faces.map((row) => row.personId).filter(Boolean))) as string[]
      if (!personIds.length) {
        return { matched: false, photo_count: 0, photos: [], message: 'We could not find you in this gallery. Try a clearer photo.' }
      }
      const photos = await galleryRepo.findPhotosByPersonIds(admin, gallery.id, personIds)
      if (!photos.length) {
        return { matched: false, photo_count: 0, photos: [], message: 'We could not find you in this gallery. Try a clearer photo.' }
      }
      const cluster = (await galleryRepo.getFaceClusters(admin, gallery.id, gallery.studio_id)).find((row) => row.immich_person_id === personIds[0])
      fireAndForget(
        galleryRepo.logGalleryAccess(admin, {
          studio_id: gallery.studio_id,
          gallery_id: gallery.id,
          accessed_by_ip: ipOf(ipAddress),
          access_type: 'selfie_lookup',
          face_matched_person_id: personIds[0],
        })
      )
      return {
        matched: true,
        matched_person_label: cluster?.label ?? null,
        photo_count: photos.length,
        photos: photos.map((row: any) => ({
          immich_asset_id: row.immich_asset_id,
          thumbnail_url: `${env.NEXT_PUBLIC_APP_URL}/api/v1/gallery/${slug}/photos/${row.immich_asset_id}/thumb`,
          download_url: `${env.NEXT_PUBLIC_APP_URL}/api/v1/gallery/${slug}/photos/${row.immich_asset_id}/original`,
        })),
      }
    } finally {
      if (tempAssetId) fireAndForget(ImmichService.deleteAssets(apiKey, [tempAssetId]))
    }
  },
}

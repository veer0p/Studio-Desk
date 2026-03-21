import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GalleryService } from '@/lib/services/gallery.service'
import { galleryRepo } from '@/lib/repositories/gallery.repo'
import { ImmichService } from '@/lib/services/immich.service'
import { checkAndIncrementRateLimit } from '@/lib/rate-limit'

vi.mock('@/lib/repositories/gallery.repo', () => ({
  galleryRepo: {
    getGalleries: vi.fn(),
    getGalleryById: vi.fn(),
    getGalleryBySlug: vi.fn(),
    createGallery: vi.fn(),
    updateGallery: vi.fn(),
    getFaceClusters: vi.fn(),
    upsertFaceCluster: vi.fn(),
    updateFaceClusterLabel: vi.fn(),
    getUploadJob: vi.fn(),
    createUploadJob: vi.fn(),
    updateUploadJob: vi.fn(),
    createGalleryPhoto: vi.fn(),
    findPhotosByPersonIds: vi.fn(),
    incrementViews: vi.fn(),
    logGalleryAccess: vi.fn(),
  },
}))

vi.mock('@/lib/services/immich.service', () => ({
  ImmichService: {
    getStudioImmichCredentials: vi.fn(),
    createAlbum: vi.fn(),
    createShareLink: vi.fn(),
    uploadAsset: vi.fn(),
    getPeople: vi.fn(),
    labelPerson: vi.fn(),
    waitForFaceDetection: vi.fn(),
    getFacesForAsset: vi.fn(),
    deleteAssets: vi.fn(),
  },
}))

vi.mock('@/lib/rate-limit', () => ({ checkAndIncrementRateLimit: vi.fn() }))
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) }) }))

function chain(result: any) {
  const self: any = {
    eq: vi.fn(() => self),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
    select: vi.fn(() => self),
  }
  return self
}

function createSupabase(config: { booking?: any; studio?: any }) {
  return {
    from: vi.fn((table: string) => {
      if (table === 'bookings') return { select: vi.fn(() => chain({ data: config.booking ?? null, error: null })) }
      if (table === 'studios') return { select: vi.fn(() => chain({ data: config.studio ?? null, error: null })) }
      return { insert: vi.fn(() => Promise.resolve({ error: null })) }
    }),
  } as any
}

describe('GalleryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createGallery rejects missing bookings and duplicate galleries', async () => {
    vi.mocked(galleryRepo.getFaceClusters).mockResolvedValue([] as any)
    await expect(GalleryService.createGallery(createSupabase({}), 's1', { booking_id: 'b1' }, 'u1')).rejects.toMatchObject({ code: 'NOT_FOUND' })

    vi.mocked(galleryRepo.getGalleries).mockResolvedValue({ data: [], count: 1 } as any)
    await expect(
      GalleryService.createGallery(createSupabase({ booking: { id: 'b1', title: 'Wedding' } }), 's1', { booking_id: 'b1' }, 'u1')
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('createGallery degrades gracefully when album creation fails', async () => {
    vi.mocked(galleryRepo.getGalleries).mockResolvedValue({ data: [], count: 0 } as any)
    vi.mocked(ImmichService.getStudioImmichCredentials).mockResolvedValue({ apiKey: 'key', userId: 'compat:s1' } as any)
    vi.mocked(ImmichService.createAlbum).mockRejectedValue(new Error('boom'))
    vi.mocked(galleryRepo.createGallery).mockResolvedValue({ id: 'g1' } as any)
    vi.mocked(galleryRepo.getGalleryById).mockResolvedValue({ id: 'g1', slug: 'gallery-1' } as any)
    const result = await GalleryService.createGallery(createSupabase({ booking: { id: 'b1', title: 'Wedding' } }), 's1', { booking_id: 'b1' }, 'u1')
    expect(result).toMatchObject({ id: 'g1' })
    expect((vi.mocked(galleryRepo.createGallery).mock.calls[0][1] as any).immich_album_id).toBeNull()
  })

  it('queuePhotoUpload validates quota/config and never uploads inline', async () => {
    vi.mocked(galleryRepo.getGalleryById).mockResolvedValue({ id: 'g1' } as any)
    await expect(
      GalleryService.queuePhotoUpload(createSupabase({ studio: { storage_used_gb: 9.9, storage_limit_gb: 10 } }), 'g1', 's1', [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 200 * 1024 * 1024, data: 'abc' }], 'u1')
    ).rejects.toMatchObject({ code: 'QUOTA_EXCEEDED' })

    vi.mocked(ImmichService.getStudioImmichCredentials).mockRejectedValueOnce({ code: 'VALIDATION_ERROR', status: 400, message: 'no immich' })
    await expect(
      GalleryService.queuePhotoUpload(createSupabase({ studio: { storage_used_gb: 1, storage_limit_gb: 10 } }), 'g1', 's1', [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 1024, data: 'abc' }], 'u1')
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })

    vi.mocked(ImmichService.getStudioImmichCredentials).mockResolvedValue({ apiKey: 'key', userId: 'compat:s1' } as any)
    vi.mocked(galleryRepo.createUploadJob).mockResolvedValue({ id: 'job-1' } as any)
    await expect(
      GalleryService.queuePhotoUpload(createSupabase({ studio: { storage_used_gb: 1, storage_limit_gb: 10 } }), 'g1', 's1', [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 1024, data: 'abc' }], 'u1')
    ).resolves.toEqual({ job_id: 'job-1' })
    expect(ImmichService.uploadAsset).not.toHaveBeenCalled()
  })

  it('labelFaceCluster validates ownership, updates Immich, and returns DB state', async () => {
    vi.mocked(galleryRepo.getFaceClusters).mockResolvedValue([{ id: 'c1', immich_person_id: 'person-1' }] as any)
    vi.mocked(ImmichService.getStudioImmichCredentials).mockResolvedValue({ apiKey: 'key', userId: 'compat:s1' } as any)
    vi.mocked(galleryRepo.updateFaceClusterLabel).mockResolvedValue({ id: 'c1', label: 'Bride - Priya' } as any)
    await expect(GalleryService.labelFaceCluster({} as any, 'g1', 's1', 'bad', 'Bride')).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(GalleryService.labelFaceCluster({} as any, 'g1', 's1', 'c1', 'Bride - Priya')).resolves.toMatchObject({ id: 'c1' })
    expect(ImmichService.labelPerson).toHaveBeenCalledWith('key', 'person-1', 'Bride - Priya')
  })

  it('publishGallery enforces rules and logs success', async () => {
    vi.mocked(galleryRepo.getGalleryById)
      .mockResolvedValueOnce({ id: 'g1', status: 'draft', total_photos: 0 } as any)
      .mockResolvedValueOnce({ id: 'g1', status: 'published', total_photos: 1 } as any)
      .mockResolvedValueOnce({ id: 'g1', status: 'draft', total_photos: 2, slug: 'gallery-1', booking_id: 'b1', studio_id: 's1', name: 'Gallery' } as any)
      .mockResolvedValueOnce({ id: 'g1', status: 'published', slug: 'gallery-1' } as any)
    await expect(GalleryService.publishGallery({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any, 'g1', 's1', {}, 'u1')).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(GalleryService.publishGallery({ from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any, 'g1', 's1', {}, 'u1')).rejects.toMatchObject({ code: 'CONFLICT' })
    vi.mocked(ImmichService.getStudioImmichCredentials).mockResolvedValue({ apiKey: 'key', userId: 'compat:s1' } as any)
    vi.mocked(ImmichService.createAlbum).mockResolvedValue({ id: 'alb-1' } as any)
    vi.mocked(ImmichService.createShareLink).mockResolvedValue({ id: 'sl-1', url: 'https://share.test', key: 'k' } as any)
    vi.mocked(galleryRepo.updateGallery).mockResolvedValue({ id: 'g1' } as any)
    const supabase = { from: vi.fn(() => ({ insert: vi.fn(() => Promise.resolve({ error: null })) })) } as any
    await expect(GalleryService.publishGallery(supabase, 'g1', 's1', {}, 'u1')).resolves.toMatchObject({ id: 'g1' })
    expect(supabase.from).toHaveBeenCalledWith('booking_activity_feed')
  })

  it('guestSelfieLookup enforces state/rate limit, handles no face, returns matches, and always deletes', async () => {
    vi.mocked(galleryRepo.getGalleryBySlug).mockResolvedValue({ id: 'g1', studio_id: 's1', status: 'draft' } as any)
    await expect(GalleryService.guestSelfieLookup('slug', Buffer.from('a'), 'selfie.jpg', '1.2.3.4')).rejects.toMatchObject({ code: 'FORBIDDEN' })

    vi.mocked(galleryRepo.getGalleryBySlug).mockResolvedValue({ id: 'g1', studio_id: 's1', status: 'published' } as any)
    vi.mocked(checkAndIncrementRateLimit).mockRejectedValueOnce({ code: 'RATE_LIMITED', status: 429, message: 'Too many requests' } as any)
    await expect(GalleryService.guestSelfieLookup('slug', Buffer.from('a'), 'selfie.jpg', '1.2.3.4')).rejects.toMatchObject({ code: 'RATE_LIMITED' })

    vi.mocked(checkAndIncrementRateLimit).mockResolvedValue(undefined as any)
    vi.mocked(ImmichService.getStudioImmichCredentials).mockResolvedValue({ apiKey: 'key', userId: 'compat:s1' } as any)
    vi.mocked(ImmichService.uploadAsset).mockResolvedValue({ id: 'temp-1', status: 'created' } as any)
    vi.mocked(ImmichService.waitForFaceDetection).mockResolvedValue(true)
    vi.mocked(ImmichService.getFacesForAsset).mockResolvedValue([] as any)
    await expect(GalleryService.guestSelfieLookup('slug', Buffer.from('a'), 'selfie.jpg', '1.2.3.4')).resolves.toMatchObject({ matched: false })
    expect(ImmichService.deleteAssets).toHaveBeenCalledWith('key', ['temp-1'])

    vi.mocked(ImmichService.uploadAsset).mockResolvedValue({ id: 'temp-2', status: 'created' } as any)
    vi.mocked(ImmichService.getFacesForAsset).mockResolvedValue([{ id: 'f1', personId: 'person-1', boundingBox: {} }] as any)
    vi.mocked(galleryRepo.findPhotosByPersonIds).mockResolvedValue([{ immich_asset_id: 'asset-1' }] as any)
    vi.mocked(galleryRepo.getFaceClusters).mockResolvedValue([{ immich_person_id: 'person-1', label: 'Bride - Priya' }] as any)
    await expect(GalleryService.guestSelfieLookup('slug', Buffer.from('a'), 'selfie.jpg', '1.2.3.4')).resolves.toMatchObject({
      matched: true,
      matched_person_label: 'Bride - Priya',
      photo_count: 1,
    })
    expect(galleryRepo.logGalleryAccess).toHaveBeenCalled()
    expect(ImmichService.deleteAssets).toHaveBeenLastCalledWith('key', ['temp-2'])
  })
})

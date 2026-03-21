import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminClient } from '@/lib/supabase/admin'
import { makeRequest } from '../helpers/request'
import { getOutsiderToken, getOwnerToken, getPhotographerToken, type AuthToken } from '../helpers/auth'
import {
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_GALLERY_B_ID,
  BOOKING_INVOICE_NEW_ID,
  FACE_CLUSTER_BRIDE_ID,
  GALLERY_DRAFT_ID,
  GALLERY_PUBLISHED_ID,
  GALLERY_STUDIO_B_ID,
  IMMICH_PERSON_BRIDE_ID,
  STUDIO_A_ID,
  UPLOAD_JOB_PROCESSING_ID,
} from '../../supabase/seed'
import { resetGalleryFixtures } from './helpers/gallery-fixtures'

const immichMock = {
  getStudioImmichCredentials: vi.fn(),
  createAlbum: vi.fn(),
  createShareLink: vi.fn(),
  uploadAsset: vi.fn(),
  getPeople: vi.fn(),
  labelPerson: vi.fn(),
  waitForFaceDetection: vi.fn(),
  getFacesForAsset: vi.fn(),
  deleteAssets: vi.fn(),
}

vi.mock('@/lib/services/immich.service', () => ({ ImmichService: immichMock }))

async function waitForCount(query: () => Promise<number>, expectedMin = 1) {
  for (let i = 0; i < 10; i += 1) {
    const count = await query()
    if (count >= expectedMin) return count
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  return query()
}

describe('Gallery API Integration', () => {
  let owner: AuthToken
  let photographer: AuthToken
  let outsider: AuthToken

  beforeAll(async () => {
    owner = await getOwnerToken()
    photographer = await getPhotographerToken()
    outsider = await getOutsiderToken()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    await resetGalleryFixtures()
    immichMock.getStudioImmichCredentials.mockResolvedValue({ apiKey: 'test-key', userId: 'compat:studio-a' } as any)
    immichMock.createAlbum.mockResolvedValue({ id: 'album-1' } as any)
    immichMock.createShareLink.mockResolvedValue({ id: 'share-1', key: 'k1', url: 'https://test.immich.app/share/1' } as any)
    immichMock.uploadAsset.mockResolvedValue({ id: 'temp-asset-1', status: 'created' } as any)
    immichMock.getPeople.mockResolvedValue([])
    immichMock.labelPerson.mockResolvedValue(undefined)
    immichMock.waitForFaceDetection.mockResolvedValue(true)
    immichMock.getFacesForAsset.mockResolvedValue([{ id: 'face-1', personId: IMMICH_PERSON_BRIDE_ID, boundingBox: {} }])
    immichMock.deleteAssets.mockResolvedValue(undefined)
  })

  it('GET /galleries handles auth, pagination, and studio isolation', async () => {
    expect((await makeRequest('GET', '/api/v1/galleries')).status).toBe(401)
    const res = await makeRequest('GET', '/api/v1/galleries?page=0&pageSize=1', { token: owner.access_token })
    expect(res.status).toBe(200)
    expect((res.body as any).meta.pageSize).toBe(1)
    expect(((res.body as any).data as any[]).length).toBe(1)
    expect(((res.body as any).data as any[])[0].name).toBeTruthy()
    const outsiderRes = await makeRequest('GET', '/api/v1/galleries', { token: outsider.access_token })
    expect(((outsiderRes.body as any).data as any[]).every((row) => row.id !== GALLERY_PUBLISHED_ID)).toBe(true)
  })

  it('POST /galleries enforces role, booking scope, duplication, and slug generation', async () => {
    expect((await makeRequest('POST', '/api/v1/galleries', { body: { booking_id: BOOKING_INVOICE_NEW_ID } })).status).toBe(401)
    expect((await makeRequest('POST', '/api/v1/galleries', { token: photographer.access_token, body: { booking_id: BOOKING_INVOICE_NEW_ID } })).status).toBe(403)
    expect((await makeRequest('POST', '/api/v1/galleries', { token: owner.access_token, body: { booking_id: BOOKING_GALLERY_B_ID } })).status).toBe(404)
    expect((await makeRequest('POST', '/api/v1/galleries', { token: owner.access_token, body: { booking_id: GALLERY_DRAFT_ID } })).status).toBe(404)
    expect((await makeRequest('POST', '/api/v1/galleries', { token: owner.access_token, body: { booking_id: BOOKING_CONTRACT_SIGNED_ID } })).status).toBe(409)

    const created = await makeRequest('POST', '/api/v1/galleries', {
      token: owner.access_token,
      body: { booking_id: BOOKING_INVOICE_NEW_ID, name: 'Meera Portrait Gallery' },
    })
    expect(created.status).toBe(201)
    expect((created.body as any).data.slug).toMatch(/^[a-z0-9-]+$/)
    const second = await makeRequest('POST', '/api/v1/galleries', {
      token: owner.access_token,
      body: { booking_id: BOOKING_INVOICE_NEW_ID, name: 'Meera Portrait Gallery' },
    })
    expect(second.status).toBe(409)
  })

  it('POST /galleries/:id/upload and GET upload-status validate scope, quota, config, and job progress', async () => {
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload`, { body: { files: [] } })).status).toBe(401)
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_STUDIO_B_ID}/upload`, { token: owner.access_token, body: { files: [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' }] } })).status).toBe(404)

    await createAdminClient().from('studios').update({ storage_used_gb: 99.99, storage_limit_gb: 100 }).eq('id', STUDIO_A_ID)
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload`, { token: owner.access_token, body: { files: [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 20 * 1024 * 1024, data: 'YQ==' }] } })).status).toBe(422)
    await createAdminClient().from('studios').update({ storage_used_gb: 2.5, storage_limit_gb: 100 }).eq('id', STUDIO_A_ID)

    immichMock.getStudioImmichCredentials.mockRejectedValueOnce({ status: 400, code: 'VALIDATION_ERROR', message: 'Immich not configured for this studio. Please set up photo delivery in Settings.' })
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload`, { token: owner.access_token, body: { files: [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' }] } })).status).toBe(400)

    const queued = await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload`, {
      token: owner.access_token,
      body: { files: [{ name: 'a.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' }] },
    })
    expect(queued.status).toBe(200)
    const jobId = (queued.body as any).data.job_id
    const saved = await createAdminClient().from('file_upload_jobs').select('id').eq('id', jobId).maybeSingle()
    expect(saved.data?.id).toBe(jobId)

    expect((await makeRequest('GET', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload-status?job_id=00000000-0000-4000-8000-000000000999`, { token: owner.access_token })).status).toBe(404)
    const status = await makeRequest('GET', `/api/v1/galleries/${GALLERY_DRAFT_ID}/upload-status?job_id=${UPLOAD_JOB_PROCESSING_ID}`, { token: owner.access_token })
    expect(status.status).toBe(200)
    expect((status.body as any).data.progress_pct).toBe(60)
  })

  it('GET/PATCH clusters return DB rows and persist labels', async () => {
    expect((await makeRequest('GET', `/api/v1/galleries/${GALLERY_PUBLISHED_ID}/clusters`)).status).toBe(401)
    const clusters = await makeRequest('GET', `/api/v1/galleries/${GALLERY_PUBLISHED_ID}/clusters`, { token: owner.access_token })
    expect(clusters.status).toBe(200)
    expect(((clusters.body as any).data as any[]).length).toBeGreaterThanOrEqual(3)

    expect((await makeRequest('PATCH', `/api/v1/galleries/${GALLERY_PUBLISHED_ID}/clusters/00000000-0000-4000-8000-000000000999`, { token: owner.access_token, body: { label: 'Guest' } })).status).toBe(404)
    const labeled = await makeRequest('PATCH', `/api/v1/galleries/${GALLERY_PUBLISHED_ID}/clusters/${FACE_CLUSTER_BRIDE_ID}`, {
      token: owner.access_token,
      body: { label: 'Bride - Priya Updated' },
    })
    expect(labeled.status).toBe(200)
    const dbRow = await createAdminClient().from('face_clusters').select('label').eq('id', FACE_CLUSTER_BRIDE_ID).maybeSingle()
    expect(dbRow.data?.label).toBe('Bride - Priya Updated')
    expect(immichMock.labelPerson).toHaveBeenCalled()
  })

  it('POST /galleries/:id/publish enforces role and state rules', async () => {
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/publish`, { token: photographer.access_token, body: {} })).status).toBe(403)
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/publish`, { token: owner.access_token, body: {} })).status).toBe(400)
    expect((await makeRequest('POST', `/api/v1/galleries/${GALLERY_PUBLISHED_ID}/publish`, { token: owner.access_token, body: {} })).status).toBe(409)

    await createAdminClient().from('galleries').update({ total_photos: 5 }).eq('id', GALLERY_DRAFT_ID)
    const published = await makeRequest('POST', `/api/v1/galleries/${GALLERY_DRAFT_ID}/publish`, { token: owner.access_token, body: {} })
    expect(published.status).toBe(200)
    expect((published.body as any).data.status).toBe('published')
  })

  it('GET /gallery/:slug returns public data only and increments views', async () => {
    expect((await makeRequest('GET', '/api/v1/gallery/unknown-slug')).status).toBe(404)
    expect((await makeRequest('GET', '/api/v1/gallery/priya-wedding-gallery-draft')).status).toBe(403)
    const before = await createAdminClient().from('galleries').select('view_count').eq('id', GALLERY_PUBLISHED_ID).maybeSingle()
    const res = await makeRequest('GET', '/api/v1/gallery/sharma-wedding-gallery-test', { headers: { 'X-Forwarded-For': '2.2.2.2' } })
    expect(res.status).toBe(200)
    expect((res.body as any).data).not.toHaveProperty('id')
    expect((res.body as any).data).not.toHaveProperty('studio_id')
    const afterCount = await waitForCount(async () => {
      const row = await createAdminClient().from('galleries').select('view_count').eq('id', GALLERY_PUBLISHED_ID).maybeSingle()
      return Number(row.data?.view_count ?? 0)
    }, Number(before.data?.view_count ?? 0) + 1)
    expect(afterCount).toBeGreaterThan(Number(before.data?.view_count ?? 0))
  })

  it('POST /gallery/:slug/lookup handles rate limiting, no-face, matched results, deletion, and logging', async () => {
    for (let i = 0; i < 10; i += 1) {
      const res = await makeRequest('POST', '/api/v1/gallery/sharma-wedding-gallery-test/lookup', {
        headers: { 'X-Forwarded-For': '9.9.9.9' },
        body: { selfie: { name: 'selfie.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' } },
      })
      expect(res.status).toBe(200)
    }
    expect((await makeRequest('POST', '/api/v1/gallery/sharma-wedding-gallery-test/lookup', {
      headers: { 'X-Forwarded-For': '9.9.9.9' },
      body: { selfie: { name: 'selfie.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' } },
    })).status).toBe(429)

    immichMock.getFacesForAsset.mockResolvedValueOnce([])
    const noFace = await makeRequest('POST', '/api/v1/gallery/sharma-wedding-gallery-test/lookup', {
      headers: { 'X-Forwarded-For': '8.8.8.8' },
      body: { selfie: { name: 'selfie.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' } },
    })
    expect(noFace.status).toBe(200)
    expect((noFace.body as any).data.matched).toBe(false)

    const matched = await makeRequest('POST', '/api/v1/gallery/sharma-wedding-gallery-test/lookup', {
      headers: { 'X-Forwarded-For': '7.7.7.7' },
      body: { selfie: { name: 'selfie.jpg', mimeType: 'image/jpeg', size: 100, data: 'YQ==' } },
    })
    expect(matched.status).toBe(200)
    expect((matched.body as any).data.matched).toBe(true)
    expect(((matched.body as any).data.photos as any[]).length).toBeGreaterThan(0)
    expect(immichMock.deleteAssets).toHaveBeenCalled()
    const logCount = await waitForCount(async () => {
      const rows = await createAdminClient().from('gallery_share_logs').select('id').eq('gallery_id', GALLERY_PUBLISHED_ID).eq('event_type', 'selfie_lookup')
      return rows.data?.length ?? 0
    })
    expect(logCount).toBeGreaterThan(0)
  })
})

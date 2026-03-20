import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImmichService } from '@/lib/services/immich.service'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({ insert: () => Promise.resolve({}) }),
  }),
}))

describe('ImmichService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('createAlbum sends the album payload and returns an id', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'alb-1' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(ImmichService.createAlbum('key', 'Wedding Gallery', 'desc')).resolves.toEqual({ id: 'alb-1' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/albums'), expect.objectContaining({ method: 'POST' }))
  })

  it('createAlbum maps network failures to external errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(ImmichService.createAlbum('key', 'Wedding Gallery')).rejects.toMatchObject({ code: 'EXTERNAL_ERROR' })
  })

  it('uploadAsset posts multipart data and handles duplicate responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'asset-1', status: 'duplicate' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      ImmichService.uploadAsset('key', {
        fileBuffer: Buffer.from('abc'),
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        fileCreatedAt: '2026-03-20T00:00:00.000Z',
        deviceAssetId: 'studio:file',
      })
    ).resolves.toEqual({ id: 'asset-1', status: 'duplicate' })
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'POST' })
  })

  it('addAssetsToAlbum batches requests at 100', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await ImmichService.addAssetsToAlbum('key', 'alb-1', Array.from({ length: 150 }, (_, i) => `id-${i}`))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('waitForFaceDetection polls until jobs drain or timeout', async () => {
    vi.useFakeTimers()
    const statusSpy = vi.spyOn(ImmichService, 'getJobStatus')
      .mockResolvedValueOnce({ facialRecognition: { waiting: 1, active: 0 } })
      .mockResolvedValueOnce({ facialRecognition: { waiting: 0, active: 0 } })
    const donePromise = ImmichService.waitForFaceDetection('key', 15000)
    await vi.advanceTimersByTimeAsync(5000)
    await expect(donePromise).resolves.toBe(true)
    expect(statusSpy).toHaveBeenCalledTimes(2)

    statusSpy.mockReset().mockResolvedValue({ facialRecognition: { waiting: 1, active: 0 } })
    const timeoutPromise = ImmichService.waitForFaceDetection('key', 5000)
    await vi.advanceTimersByTimeAsync(10000)
    await expect(timeoutPromise).resolves.toBe(false)
    vi.useRealTimers()
  })

  it('deleteAssets batches deletes at 100', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await ImmichService.deleteAssets('key', Array.from({ length: 150 }, (_, i) => `id-${i}`))
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'DELETE' })
  })
})

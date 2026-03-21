import { decrypt } from '@/lib/crypto'
import { env } from '@/lib/env'
import { Errors } from '@/lib/errors'
import { createAdminClient } from '@/lib/supabase/admin'

const API_ROOT = `${env.IMMICH_BASE_URL.replace(/\/+$/, '')}/api`
const REQUEST_TIMEOUT_MS = 30000
const BATCH_SIZE = 100
const POLL_MS = 5000

function baseHeaders(apiKey: string, studioId?: string) {
  return {
    'x-api-key': apiKey,
    ...(studioId ? { 'x-studiodesk-studio-id': studioId } : {}),
  }
}

function jsonHeaders(apiKey: string, studioId?: string) {
  return { ...baseHeaders(apiKey, studioId), 'Content-Type': 'application/json' }
}

function studioIdFrom(options: RequestInit) {
  return new Headers(options.headers).get('x-studiodesk-studio-id') ?? undefined
}

function cleanedOptions(apiKey: string, options: RequestInit) {
  const headers = new Headers(options.headers)
  headers.delete('x-studiodesk-studio-id')
  headers.set('x-api-key', apiKey)
  return { ...options, headers }
}

function logImmichCall(studioId: string | undefined, operation: string, status: 'completed' | 'failed', response?: unknown, error?: string) {
  if (!studioId) return
  createAdminClient()
    .from('immich_sync_jobs')
    .insert({
      studio_id: studioId,
      operation,
      status,
      response_data: response ?? null,
      error_message: error ?? null,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .then(() => {})
    // @ts-expect-error: residual strict constraint
    .catch(() => {})
}

async function readJson<T>(res: Response) {
  const text = await res.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

function isEncrypted(value: string) {
  return value.includes(':')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const ImmichService = {
  async immichRequest(path: string, options: RequestInit, apiKey: string) {
    const studioId = studioIdFrom(options)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(`${API_ROOT}${path}`, {
        ...cleanedOptions(apiKey, options),
        signal: controller.signal,
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        logImmichCall(studioId, path, 'failed', body, `HTTP ${res.status}`)
        throw Errors.external('Immich')
      }
      logImmichCall(studioId, path, 'completed', { ok: true })
      return res
    } catch {
      logImmichCall(studioId, path, 'failed', null, 'Network error')
      throw Errors.external('Immich')
    } finally {
      clearTimeout(timeout)
    }
  },

  async createImmichUser(adminApiKey: string, params: { email: string; password: string; name: string }) {
    const res = await this.immichRequest(
      '/admin/users',
      { method: 'POST', headers: jsonHeaders(adminApiKey), body: JSON.stringify(params) },
      adminApiKey
    )
    return readJson<{ id: string; email: string }>(res)
  },

  async createImmichApiKey(userApiKey: string, name: string) {
    const res = await this.immichRequest(
      '/api-keys',
      {
        method: 'POST',
        headers: jsonHeaders(userApiKey),
        body: JSON.stringify({ name, permissions: ['all'] }),
      },
      userApiKey
    )
    return readJson<{ id: string; secret: string }>(res)
  },

  async createAlbum(apiKey: string, albumName: string, description?: string) {
    const res = await this.immichRequest(
      '/albums',
      {
        method: 'POST',
        headers: jsonHeaders(apiKey),
        body: JSON.stringify({ albumName, description: description ?? '' }),
      },
      apiKey
    )
    const data = await readJson<{ id: string }>(res)
    return { id: data.id }
  },

  async uploadAsset(
    apiKey: string,
    params: { fileBuffer: Buffer; fileName: string; mimeType: string; fileCreatedAt: string; deviceAssetId: string }
  ) {
    const form = new FormData()
    form.append('assetData', new Blob([new Uint8Array(params.fileBuffer)], { type: params.mimeType }), params.fileName)
    form.append('deviceAssetId', params.deviceAssetId)
    form.append('deviceId', 'studiodesk-server')
    form.append('fileCreatedAt', params.fileCreatedAt)
    form.append('fileModifiedAt', params.fileCreatedAt)
    const res = await this.immichRequest('/assets', { method: 'POST', body: form }, apiKey)
    return readJson<{ id: string; status: string }>(res)
  },

  async addAssetsToAlbum(apiKey: string, albumId: string, assetIds: string[]) {
    for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
      await this.immichRequest(
        `/albums/${albumId}/assets`,
        {
          method: 'PUT',
          headers: jsonHeaders(apiKey),
          body: JSON.stringify({ ids: assetIds.slice(i, i + BATCH_SIZE) }),
        },
        apiKey
      )
    }
  },

  async getJobStatus(apiKey: string) {
    const res = await this.immichRequest('/jobs', { method: 'GET', headers: baseHeaders(apiKey) }, apiKey)
    const data = await readJson<any>(res)
    return {
      facialRecognition: {
        waiting: Number(data?.facialRecognition?.waiting ?? 0),
        active: Number(data?.facialRecognition?.active ?? 0),
      },
    }
  },

  async waitForFaceDetection(apiKey: string, maxWaitMs = 300000) {
    const started = Date.now()
    while (Date.now() - started <= maxWaitMs) {
      const jobs = await this.getJobStatus(apiKey)
      if ((jobs.facialRecognition.waiting ?? 0) + (jobs.facialRecognition.active ?? 0) === 0) return true
      await sleep(POLL_MS)
    }
    return false
  },

  async getPeople(apiKey: string) {
    const res = await this.immichRequest('/people', { method: 'GET', headers: baseHeaders(apiKey) }, apiKey)
    const data = await readJson<any>(res)
    const people = Array.isArray(data) ? data : data?.people ?? []
    return people.map((row: any) => ({
      id: row.id,
      name: row.name ?? '',
      thumbnailPath: row.thumbnailPath ?? '',
      faces: Number(row.faces ?? 0),
    }))
  },

  async labelPerson(apiKey: string, personId: string, name: string) {
    await this.immichRequest(
      `/people/${personId}`,
      { method: 'PUT', headers: jsonHeaders(apiKey), body: JSON.stringify({ name }) },
      apiKey
    )
  },

  async getFacesForAsset(apiKey: string, assetId: string) {
    const res = await this.immichRequest(
      `/faces?assetId=${encodeURIComponent(assetId)}`,
      { method: 'GET', headers: baseHeaders(apiKey) },
      apiKey
    )
    return readJson<Array<{ id: string; personId: string | null; boundingBox: object }>>(res)
  },

  async createShareLink(apiKey: string, albumId: string, params: { expiresAt?: string; allowDownload: boolean }) {
    const res = await this.immichRequest(
      '/shared-links',
      {
        method: 'POST',
        headers: jsonHeaders(apiKey),
        body: JSON.stringify({
          type: 'ALBUM',
          albumId,
          expiresAt: params.expiresAt,
          allowDownload: params.allowDownload,
          showMetadata: false,
        }),
      },
      apiKey
    )
    return readJson<{ id: string; url: string; key: string }>(res)
  },

  async deleteAssets(apiKey: string, assetIds: string[]) {
    for (let i = 0; i < assetIds.length; i += BATCH_SIZE) {
      await this.immichRequest(
        '/assets',
        {
          method: 'DELETE',
          headers: jsonHeaders(apiKey),
          body: JSON.stringify({ ids: assetIds.slice(i, i + BATCH_SIZE), force: true }),
        },
        apiKey
      )
    }
  },

  async getStudioImmichCredentials(supabase: any, studioId: string) {
    const { data: studio, error } = await supabase.from('studios').select('id, name').eq('id', studioId).maybeSingle()
    if (error || !studio) throw Errors.notFound('Studio')
    const rawKey = process.env.IMMICH_API_KEY || env.IMMICH_API_KEY
    if (!rawKey) {
      throw Errors.validation('Immich not configured for this studio. Please set up photo delivery in Settings.')
    }
    return {
      apiKey: isEncrypted(rawKey) ? decrypt(rawKey) : rawKey,
      userId: `compat:${studioId}`,
    }
  },
}

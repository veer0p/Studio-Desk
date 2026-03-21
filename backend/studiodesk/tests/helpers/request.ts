import { testApiHandler } from 'next-test-api-route-handler'
import { loadAppRoute } from './resolve-route'

export type MakeRequestOptions = {
  token?: string
  body?: object
  query?: Record<string, string>
  /** Extra headers (e.g. X-Forwarded-For for rate limit tests) */
  headers?: Record<string, string>
}

export type MakeRequestResult = { status: number; body: unknown; headers: Headers }

/**
 * Run a real App Router handler via next-test-api-route-handler.
 * `path` is pathname + optional query, e.g. `/api/v1/inquiry?studio=foo` or use `query` option.
 */
export async function makeRequest(
  method: string,
  path: string,
  options?: MakeRequestOptions
): Promise<MakeRequestResult> {
  const [rawPath, existingQs] = path.split('?')
  const qs = new URLSearchParams(existingQs ?? '')
  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) qs.set(k, v)
  }
  const queryStr = qs.toString()
  const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const fullUrl = `http://localhost:3000${pathname}${queryStr ? `?${queryStr}` : ''}`

  const { appHandler, params } = await loadAppRoute(pathname)

  let result!: MakeRequestResult

  await testApiHandler({
    appHandler,
    url: fullUrl,
    params,
    async test({ fetch }) {
      const headers: Record<string, string> = { ...options?.headers }
      const writeBody =
        options?.body !== undefined &&
        method !== 'GET' &&
        method !== 'HEAD' &&
        method !== 'DELETE'
      if (writeBody) {
        headers['Content-Type'] = 'application/json'
      }
      if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`
      }
      const init: RequestInit = { method, headers }
      if (writeBody) {
        init.body = JSON.stringify(options!.body)
      }
      const res = await fetch(init)
      const text = await res.text()
      let body: unknown = null
      if (text) {
        try {
          body = JSON.parse(text) as unknown
        } catch {
          body = text
        }
      }
      result = { status: res.status, body, headers: res.headers }
    },
  })

  return result!
}

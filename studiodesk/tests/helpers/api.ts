import { testApiHandler } from 'next-test-api-route-handler'
import { loadAppRoute } from './resolve-route'

type ApiOptions = {
  token?: string | null
  body?: object
  query?: Record<string, string>
  contentType?: string
  headers?: Record<string, string>
}

type ApiResult = {
  status: number
  body: unknown
  headers: Headers
}

export async function api(method: string, path: string, options?: ApiOptions): Promise<ApiResult> {
  const [rawPath, existingQs] = path.split('?')
  const params = new URLSearchParams(existingQs ?? '')
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      params.set(key, value)
    }
  }

  const pathname = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
  const url = `http://localhost:3000${pathname}${params.toString() ? `?${params.toString()}` : ''}`
  const { appHandler, params: routeParams } = await loadAppRoute(pathname)

  let result: ApiResult = { status: 500, body: null, headers: new Headers() }

  await testApiHandler({
    appHandler,
    url,
    params: routeParams,
    async test({ fetch }) {
      const headers: Record<string, string> = { ...(options?.headers ?? {}) }

      if (options?.token) {
        headers.Authorization = `Bearer ${options.token}`
      }

      const hasBody = options?.body !== undefined && !['GET', 'HEAD', 'DELETE'].includes(method.toUpperCase())
      if (hasBody) {
        headers['Content-Type'] = options?.contentType ?? 'application/json'
      }

      const res = await fetch({
        method,
        headers,
        body: hasBody ? JSON.stringify(options?.body) : undefined,
      })

      const text = await res.text()
      let parsed: unknown = null
      if (text) {
        try {
          parsed = JSON.parse(text)
        } catch {
          parsed = text
        }
      }

      result = { status: res.status, body: parsed, headers: res.headers }
    },
  })

  return result
}

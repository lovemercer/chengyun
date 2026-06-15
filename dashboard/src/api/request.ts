const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const APP_KEY = import.meta.env.VITE_APP_KEY || ''
const APP_SECRET = import.meta.env.VITE_APP_SECRET || ''

interface ApiResponse<T = unknown> {
  code: number | string
  msg: string
  data: T
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.pathname + url.search
}

async function request<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  opts?: {
    query?: Record<string, string | number | boolean | undefined>
    body?: Record<string, unknown>
  },
): Promise<ApiResponse<T>> {
  const url = buildUrl(path, opts?.query)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-app-key': APP_KEY,
    'x-app-secret': APP_SECRET,
  }

  const fetchOpts: RequestInit = {
    method,
    headers,
  }

  if (opts?.body && method === 'POST') {
    fetchOpts.body = JSON.stringify(opts.body)
  }

  const response = await fetch(url, fetchOpts)

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const json = await response.json()

  if (json.code !== 0 && json.code !== '0') {
    throw new Error(`API Error [${json.code}]: ${json.msg}`)
  }

  return json
}

export function get<T = unknown>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<ApiResponse<T>> {
  return request<T>('GET', path, { query })
}

export function post<T = unknown>(
  path: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  return request<T>('POST', path, { body })
}

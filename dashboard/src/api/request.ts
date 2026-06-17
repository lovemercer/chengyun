const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const APP_KEY = import.meta.env.VITE_APP_KEY || ''
const APP_SECRET = import.meta.env.VITE_APP_SECRET || ''

// ============================================================
// 海康 Artemis OpenAPI 签名工具
// 参考：OpenApi签名生成工具使用说明.pdf
// 核心公式：Base64(HmacSHA256(appSecret, signString))
// 使用 Web Crypto API，与博客中 14 种语言实现等效
// ============================================================

/** ArrayBuffer → Base64 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

/**
 * 生成 HMAC-SHA256 + Base64 签名
 * 等效于：Base64(HmacSHA256(secret, message))
 */
async function generateSignature(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return bufferToBase64(sig)
}

/**
 * 构建待签名字符串（根据网关报错返回的真实格式）
 *
 * 网关期望格式:
 *   {method}\n
 *   {accept}\n
 *   {content-type}\n
 *   {custom-headers key:value 按字典序}\n
 *   {url 含查询参数}
 *
 * 示例:
 *   POST\n
 *   application/json\n
 *   application/json\n
 *   x-ca-key:25358576\n
 *   /artemis/api/v1/...?filterNoEventTask=false
 */
function buildSignString(
  method: string,
  accept: string,
  contentType: string,
  customHeaders: Record<string, string>,
  url: string,
): string {
  const lines: string[] = [method, accept, contentType]

  // 自定义头按 key 字典序排列
  Object.entries(customHeaders)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([k, v]) => lines.push(`${k}:${v}`))

  lines.push(url)
  return lines.join('\n')
}

// ============================================================
// 鉴权拦截器：为每个请求构建海康 Artemis 签名头
// ============================================================

async function buildAuthHeaders(
  method: string,
  builtUrl: string,
): Promise<Record<string, string>> {
  const accept = '*/*'
  const contentType = 'application/json'

  // 网关路径：/artemis + 请求路径（含查询参数）
  // builtUrl 如 /api/v1/...?filterNoEventTask=false
  const signPath = `/artemis${builtUrl}`

  // 只 x-ca-key 参与签名
  const customHeaders: Record<string, string> = {
    'x-ca-key': APP_KEY,
  }

  const signStr = buildSignString(method, accept, contentType, customHeaders, signPath)
  const signature = await generateSignature(APP_SECRET, signStr)

  return {
    Accept: accept,
    'Content-Type': contentType,
    'x-ca-key': APP_KEY,
    'x-ca-signature-headers': 'x-ca-key',
    'x-ca-signature': signature,
  }
}

// ============================================================
// HTTP 请求封装
// ============================================================

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

  // 鉴权拦截器：注入签名头（传入 method + 完整URL含查询参数）
  const authHeaders = await buildAuthHeaders(method, url)

  const fetchOpts: RequestInit = {
    method,
    headers: authHeaders,
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

export { request }

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

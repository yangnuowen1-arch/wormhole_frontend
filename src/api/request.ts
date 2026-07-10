import type { ApiResponse } from './types'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.31.28:8081/api/v1'
).replace(/\/$/, '')

export class ApiError extends Error {
  readonly code?: number
  readonly status?: number
  readonly response?: ApiResponse<unknown>

  constructor(message: string, options?: { code?: number; status?: number; response?: ApiResponse<unknown> }) {
    super(message)
    this.name = 'ApiError'
    this.code = options?.code
    this.status = options?.status
    this.response = options?.response
  }
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init.headers,
    },
    ...init,
  })

  let body: ApiResponse<T> | undefined

  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError(response.statusText || '接口响应格式错误', {
      status: response.status,
    })
  }

  if (!response.ok || body.code !== 0) {
    throw new ApiError(body.message || body.error || '接口请求失败', {
      code: body.code,
      status: response.status,
      response: body as ApiResponse<unknown>,
    })
  }

  return body.data
}

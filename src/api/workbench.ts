import { apiRequest } from './request'

function withQuery(path: string, params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })

  const query = search.toString()
  return query ? `${path}?${query}` : path
}

function jsonRequest(path: string, method: string, body: unknown) {
  return apiRequest<unknown>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export function getQuickEntries() {
  return apiRequest<unknown>('/quick-entries')
}

export function getCarouselSlides() {
  return apiRequest<unknown>('/carousel-slides')
}

export function getRecommendations() {
  return apiRequest<unknown>('/recommendations')
}

export function getResourceCategories() {
  return apiRequest<unknown>('/resource-categories')
}

export function getResources(params: {
  categoryCode?: string
  featured?: boolean
  page?: number
  pageSize?: number
} = {}) {
  return apiRequest<unknown>(
    withQuery('/resources', {
      category_code: params.categoryCode,
      featured: params.featured,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
    }),
  )
}

export function searchResources(query: string, pageSize = 20) {
  return apiRequest<unknown>(
    withQuery('/resources/search', {
      q: query,
      page: 1,
      pageSize,
    }),
  )
}

export function getCommonTools() {
  return apiRequest<unknown>('/common-tools')
}

export function addCommonTool(resourceId: number, sortOrder: number) {
  return jsonRequest('/common-tools', 'POST', { resourceId, sortOrder })
}

export function removeCommonTool(resourceId: number) {
  return apiRequest<unknown>(`/common-tools/${resourceId}`, { method: 'DELETE' })
}

export function sortCommonTools(items: Array<{ resourceId: number; sortOrder: number }>) {
  return jsonRequest('/common-tools/sort', 'PUT', { items })
}

export function getRecentSearchHistory(limit = 4) {
  return apiRequest<unknown>(withQuery('/search-history/recent', { limit }))
}

export function recordSearchHistory(query: string, lastResultCount: number) {
  return jsonRequest('/search-history', 'POST', { query, lastResultCount })
}

export function sortAdminCarouselSlides(items: Array<{ id: number; sortOrder: number }>) {
  return jsonRequest('/admin/carousel-slides/sort', 'PUT', { items })
}

export function sortAdminQuickEntries(items: Array<{ id: number; sortOrder: number }>) {
  return jsonRequest('/admin/quick-entries/sort', 'PUT', { items })
}

export function sortAdminRecommendations(items: Array<{ id: number; sortOrder: number }>) {
  return jsonRequest('/admin/recommendations/sort', 'PUT', { items })
}

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

function jsonRequest<T = unknown>(path: string, method: string, body: unknown) {
  return apiRequest<T>(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export interface UpdateAdminQuickEntryPayload {
  code?: string
  description?: string
  iconText?: string
  iconUrl?: string
  sortOrder?: number
  status?: number
  targetUrl?: string
  title?: string
  visibleRoleCodes?: string[]
}

export interface UpdateAdminCarouselSlidePayload {
  buttonText?: string
  code?: string
  description?: string
  endsAt?: string
  sortOrder?: number
  startsAt?: string
  status?: number
  subtitle?: string
  targetUrl?: string
  title?: string
  visibleRoleCodes?: string[]
}

export interface CreateAdminCarouselSlidePayload
  extends UpdateAdminCarouselSlidePayload {
  code: string
  title: string
}

export interface UpdateAdminRecommendationPayload {
  iconText?: string
  iconUrl?: string
  publishedAt?: string
  resourceId?: number
  sortOrder?: number
  sourceName?: string
  sourceUrl?: string
  status?: number
  subtitle?: string
  targetUrl?: string
  title?: string
  visibleRoleCodes?: string[]
}

export interface CreateAdminRecommendationPayload
  extends UpdateAdminRecommendationPayload {
  title: string
}

export interface AdminAnnouncementPayload {
  content: string
  expiresAt?: string
  isPinned?: boolean
  publishedAt?: string
  status?: number
  title: string
}

export interface UpdateAdminResourceCategoryPayload {
  code?: string
  description?: string
  name?: string
  sortOrder?: number
  status?: number
}

export interface CreateAdminResourceCategoryPayload
  extends UpdateAdminResourceCategoryPayload {
  code: string
  name: string
}

export interface UpdateAdminResourcePayload {
  categoryId?: number
  badge?: string
  description?: string
  followerCount?: number
  iconText?: string
  iconUrl?: string
  isFeatured?: boolean
  metadata?: Record<string, unknown>
  modelCount?: number
  name?: string
  provider?: string
  resourceType?: string
  sortOrder?: number
  slug?: string
  summary?: string
  tags?: string[]
  websiteUrl?: string
}

export interface CreateAdminResourcePayload extends UpdateAdminResourcePayload {
  categoryId: number
  name: string
  slug: string
}

export function getQuickEntries() {
  return apiRequest<unknown>('/quick-entries')
}

export function getAnnouncements() {
  return apiRequest<unknown>('/announcements')
}

export function getAdminAnnouncements(params: { status?: number } = {}) {
  return apiRequest<unknown>(
    withQuery('/admin/announcements', { status: params.status }),
  )
}

export function createAdminAnnouncement(body: AdminAnnouncementPayload) {
  return jsonRequest('/admin/announcements', 'POST', body)
}

export function updateAdminAnnouncement(
  id: number,
  body: Partial<AdminAnnouncementPayload>,
) {
  return jsonRequest(`/admin/announcements/${id}`, 'PATCH', body)
}

export function updateAdminAnnouncementStatus(id: number, status: number) {
  return jsonRequest(`/admin/announcements/${id}/status`, 'PATCH', { status })
}

export function getCarouselSlides() {
  return apiRequest<unknown>('/carousel-slides')
}

export function getAdminCarouselSlides(params: { status?: number } = {}) {
  return apiRequest<unknown>(
    withQuery('/admin/carousel-slides', { status: params.status }),
  )
}

export function getRecommendations() {
  return apiRequest<unknown>('/recommendations')
}

export function getAdminRecommendations(params: { status?: number } = {}) {
  return apiRequest<unknown>(
    withQuery('/admin/recommendations', { status: params.status }),
  )
}

export function getResourceCategories() {
  return apiRequest<unknown>('/resource-categories')
}

export function createAdminResourceCategory(
  body: CreateAdminResourceCategoryPayload,
) {
  return jsonRequest('/admin/resource-categories', 'POST', body)
}

export function updateAdminResourceCategory(
  id: number,
  body: UpdateAdminResourceCategoryPayload,
) {
  return jsonRequest(`/admin/resource-categories/${id}`, 'PATCH', body)
}

export function deleteAdminResourceCategory(id: number) {
  return apiRequest<{ deleted: boolean }>(`/admin/resource-categories/${id}`, {
    method: 'DELETE',
  })
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

export function createAdminResource(body: CreateAdminResourcePayload) {
  return jsonRequest('/admin/resources', 'POST', body)
}

export function updateAdminResource(
  id: number,
  body: UpdateAdminResourcePayload,
) {
  return jsonRequest(`/admin/resources/${id}`, 'PATCH', body)
}

export function deleteAdminResource(id: number) {
  return apiRequest<{ deleted: boolean }>(`/admin/resources/${id}`, {
    method: 'DELETE',
  })
}

export function searchResources(
  query: string,
  params: { page?: number; pageSize?: number } = {},
) {
  return apiRequest<unknown>(
    withQuery('/resources/search', {
      q: query,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 100,
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

export function createAdminCarouselSlide(
  body: CreateAdminCarouselSlidePayload,
) {
  return jsonRequest('/admin/carousel-slides', 'POST', body)
}

export function sortAdminQuickEntries(items: Array<{ id: number; sortOrder: number }>) {
  return jsonRequest('/admin/quick-entries/sort', 'PUT', { items })
}

export function sortAdminRecommendations(items: Array<{ id: number; sortOrder: number }>) {
  return jsonRequest('/admin/recommendations/sort', 'PUT', { items })
}

export function createAdminRecommendation(
  body: CreateAdminRecommendationPayload,
) {
  return jsonRequest('/admin/recommendations', 'POST', body)
}

export function updateAdminQuickEntry(
  id: number,
  body: UpdateAdminQuickEntryPayload,
) {
  return jsonRequest(`/admin/quick-entries/${id}`, 'PATCH', body)
}

export function updateAdminCarouselSlide(
  id: number,
  body: UpdateAdminCarouselSlidePayload,
) {
  return jsonRequest(`/admin/carousel-slides/${id}`, 'PATCH', body)
}

export function updateAdminRecommendation(
  id: number,
  body: UpdateAdminRecommendationPayload,
) {
  return jsonRequest(`/admin/recommendations/${id}`, 'PATCH', body)
}

export function updateAdminRecommendationStatus(id: number, status: number) {
  return jsonRequest(`/admin/recommendations/${id}/status`, 'PATCH', { status })
}

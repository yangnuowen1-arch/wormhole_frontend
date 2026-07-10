import { apiRequest } from './request'
import type { CurrentUser } from './types'

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/users/me')
}

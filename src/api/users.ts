import { apiRequest } from './request'
import type { AdminUser, CurrentUser } from './types'

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/users/me')
}

export function getAdminUsers() {
  return apiRequest<AdminUser[]>('/admin/users')
}

export function updateUserRoles(
  userId: number,
  roleCodes: string[]
) {
  return apiRequest<AdminUser>(
    `/admin/users/${userId}/roles`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ roleCodes })
    }
  )
}

/** 后端统一响应结构 */
export interface ApiResponse<T> {
  code: number
  data: T
  error: string
  message: string
  requestId: string
  timestamp: string
}

export interface CurrentUser {
  avatar?: string
  createdAt?: string
  email: string
  id: number
  keycloakId?: string
  lastLoginAt?: string
  nickname: string
  roles?: UserRole[]
  status?: number
  updatedAt?: string
  username: string
}

export type AdminUser = CurrentUser

export interface UserRole {
  code: string
  description?: string
  id?: number
  name?: string
}

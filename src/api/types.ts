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
  email: string
  id: number
  nickname: string
  username: string
}

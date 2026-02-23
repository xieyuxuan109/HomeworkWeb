// API 响应类型定义

// 登录响应
export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: UserInfo
}

// 用户信息
export interface UserInfo {
  id: number
  username: string
  nickname: string
  email?: string
  subject: string
  subject_label?: string
  role: 'student' | 'teacher'
  created_at?: string
  updated_at?: string
}

// 作业信息
export interface Homework {
  id: number
  title: string
  description: string
  subject: string
  subject_label: string
  department?: string
  department_label?: string
  deadline: string
  allow_late: boolean
  attachment_url?: string
  submission_count: number
  submitted_count?: number
  total_count?: number
  created_by?: number
  created_at?: string
  updated_at?: string
}

// 提交信息
export interface Submission {
  id: number
  homework_id: number
  student_id: number
  student_name?: string
  content: string
  file_url?: string
  score?: number
  comment?: string
  submitted_at: string
  reviewed_at?: string
  created_at?: string
  updated_at?: string
}

// 通用 API 响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 列表响应
export interface ListResponse<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import type { LoginResponse, UserInfo, Homework, Submission, ListResponse } from '@/types/api'

// API 基础配置

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// 响应拦截器 - 直接返回 data 字段
api.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0) {
      return data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 用户相关 API
export const userAPI = {
  // 用户注册 - POST /user/register
  register: (data: {
    username: string
    password: string
    nickname: string
    department: string
    role: string
  }): Promise<any> => api.post('/user/register', data),

  // 用户登录 - POST /user/login
  login: (data: { username: string; password: string }): Promise<LoginResponse> =>
    api.post('/user/login', data),

  // 刷新 Token - POST /user/refresh
  refreshToken: (refreshToken: string): Promise<LoginResponse> =>
    api.post('/user/refresh', { refresh_token: refreshToken }),

  // 获取当前用户信息 - GET /user/profile
  getCurrentUser: (): Promise<UserInfo> => api.get('/user/profile'),

  // 注销账号 - DELETE /user/account
  deleteAccount: (password: string): Promise<any> =>
    api.delete('/user/account', { data: { password } }),
}

// 作业相关 API
export const homeworkAPI = {
  // 发布作业 - POST /homework
  create: (data: {
    title: string
    description: string
    department: string
    deadline: string
    allow_late?: boolean
  }): Promise<Homework> => api.post('/homeworks', data),

  // 获取作业列表 - GET /homework
  getList: (params?: {
    department?: string
    page?: number
    page_size?: number
  }): Promise<ListResponse<Homework>> =>
    api.get('/homeworks', { params }),

  // 获取作业详情 - GET /homework/:id
  getDetail: (id: string | number): Promise<Homework> =>
    api.get(`/homeworks/${id}`),

  // 修改作业 - PUT /homework/:id
  update: (id: number, data: {
    title?: string
    description?: string
    deadline?: string
    allow_late?: boolean
  }): Promise<Homework> =>
    api.put(`/homeworks/${id}`, data),

  // 删除作业 - DELETE /homework/:id
  delete: (id: number): Promise<any> =>
    api.delete(`/homeworks/${id}`),
}

// 提交相关 API
export const submissionAPI = {
  // 提交作业 - POST /submission
  submit: (data: {
    homework_id: number
    content: string
    file_url?: string
  }): Promise<Submission> =>
    api.post('/submissions', data),

  // 获取我的提交列表 - GET /submission/my
  getMySubmissions: (params?: {
    page?: number
    page_size?: number
  }): Promise<ListResponse<Submission>> =>
    api.get('/submissions/my', { params }),

  // 获取我的提交列表 - GET /submission
  getSubmissions: (params?: {
    sortName?: string
    sort?: string
    submission?: string
    tag?: boolean
    page?: number
    page_size?: number
  }): Promise<ListResponse<Submission>> =>
    api.get('/submissions', { params }),

  // 获取作业的所有提交 - GET /submission/homework/:homework_id
  getByHomework: (submissionId: string | number): Promise<ListResponse<Submission>> =>
    api.get(`/submissions/${submissionId}`),

  // 批改作业 - POST /submission/:id/review
  review: (submissionId: number, data: {
    score?: number
    comment?: string
    is_excellent?: boolean
  }): Promise<Submission> =>
    api.put(`/submissions/${submissionId}/review`, data),
}

export default api

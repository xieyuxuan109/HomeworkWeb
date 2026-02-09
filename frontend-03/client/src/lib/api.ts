import axios, { AxiosResponse } from 'axios';

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 获取 API 基础 URL，从环境变量或使用默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 添加响应拦截器，处理错误
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => response.data as any,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期，清除本地存储并重定向到登录页
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ 用户模块 ============

export const userAPI = {
  // 用户注册
  register: (data: {
    username: string;
    password: string;
    nickname: string;
    department: string;
  }) => apiClient.post('/user/register', data),

  // 用户登录
  login: (data: { username: string; password: string }) =>
    apiClient.post('/user/login', data),

  // 刷新 Token
  refresh: (refreshToken: string) =>
    apiClient.post('/user/refresh', { refresh_token: refreshToken }),

  // 获取当前用户信息
  getProfile: () => apiClient.get('/user/profile'),

  // 注销账号
  deleteAccount: (password: string) =>
    apiClient.delete('/user/account', { data: { password } }),

  // 绑定邮箱
  bindEmail: (email: string) =>
    apiClient.post('/user/bindEmail', { email }),
};

// ============ 作业模块 ============

export const homeworkAPI = {
  // 发布作业
  create: (data: {
    title: string;
    description: string;
    department: string;
    deadline: string;
    allow_late: boolean;
  }) => apiClient.post('/homework', data),

  // 获取作业列表
  getList: (params?: { department?: string; page?: number; page_size?: number }) =>
    apiClient.get('/homework', { params }),

  // 获取作业详情
  getDetail: (id: number) => apiClient.get(`/homework/${id}`),

  // 修改作业
  update: (id: number, data: {
    title?: string;
    description?: string;
    deadline?: string;
    allow_late?: boolean;
  }) => apiClient.put(`/homework/${id}`, data),

  // 删除作业
  delete: (id: number) => apiClient.delete(`/homework/${id}`),
};

// ============ 提交模块 ============

export const submissionAPI = {
  // 提交作业
  submit: (data: {
    homework_id: number;
    content: string;
    file_url?: string;
  }) => apiClient.post('/submission', data),

  // 获取我的提交列表
  getMySubmissions: (params?: { page?: number; page_size?: number }) =>
    apiClient.get('/submission/my', { params }),

  // 获取作业的所有提交
  getHomeworkSubmissions: (homeworkId: number, params?: {
    page?: number;
    page_size?: number;
  }) => apiClient.get(`/submission/homework/${homeworkId}`, { params }),

  // 批改作业
  review: (submissionId: number, data: {
    score?: number;
    comment: string;
    is_excellent?: boolean;
  }) => apiClient.put(`/submission/${submissionId}/review`, data),

  // 标记/取消优秀作业
  markExcellent: (submissionId: number, isExcellent: boolean) =>
    apiClient.put(`/submission/${submissionId}/excellent`, { is_excellent: isExcellent }),

  // 获取优秀作业列表
  getExcellent: (params?: {
    department?: string;
    page?: number;
    page_size?: number;
  }) => apiClient.get('/submission/excellent', { params }),

  // AI 作业评价
  aiReview: (submissionId: number) =>
    apiClient.post(`/submission/${submissionId}/aiReview`, {}),
};

export default apiClient;

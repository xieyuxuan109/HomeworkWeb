import { create } from 'zustand';

export interface User {
  id: number;
  username: string;
  nickname: string;
  role: 'student' | 'admin';
  department: string;
  department_label: string;
  email?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 设置用户信息
  setUser: (user: User | null) => void;
  // 设置 tokens
  setTokens: (accessToken: string, refreshToken: string) => void;
  // 登出
  logout: () => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置错误
  setError: (error: string | null) => void;
  // 从本地存储恢复
  restoreFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  restoreFromStorage: () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    if (accessToken && refreshToken) {
      set({ accessToken, refreshToken });
    }
  },
}));

// ============ 作业数据 Store ============

export interface Homework {
  id: number;
  title: string;
  description: string;
  department: string;
  department_label: string;
  creator: {
    id: number;
    nickname: string;
  };
  deadline: string;
  allow_late: boolean;
  submission_count: number;
}

export interface HomeworkDetail extends Homework {
  my_submission?: {
    id: number;
    score?: number;
    is_excellent: boolean;
  };
}

export interface HomeworkState {
  homeworks: Homework[];
  currentHomework: HomeworkDetail | null;
  isLoading: boolean;
  error: string | null;

  setHomeworks: (homeworks: Homework[]) => void;
  setCurrentHomework: (homework: HomeworkDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useHomeworkStore = create<HomeworkState>((set) => ({
  homeworks: [],
  currentHomework: null,
  isLoading: false,
  error: null,

  setHomeworks: (homeworks) => set({ homeworks }),
  setCurrentHomework: (homework) => set({ currentHomework: homework }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

// ============ 提交数据 Store ============

export interface Submission {
  id: number;
  homework: {
    id: number;
    title: string;
    department: string;
    department_label: string;
  };
  student: {
    id: number;
    nickname: string;
    department: string;
    department_label: string;
  };
  score?: number;
  comment?: string;
  is_excellent: boolean;
  submitted_at: string;
}

export interface SubmissionState {
  submissions: Submission[];
  currentSubmission: Submission | null;
  isLoading: boolean;
  error: string | null;

  setSubmissions: (submissions: Submission[]) => void;
  setCurrentSubmission: (submission: Submission | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  currentSubmission: null,
  isLoading: false,
  error: null,

  setSubmissions: (submissions) => set({ submissions }),
  setCurrentSubmission: (submission) => set({ currentSubmission: submission }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

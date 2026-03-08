import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userAPI } from '@/utils/api'
import type { UserInfo } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const login = async (data: {
    username: string
    password: string
  }): Promise<boolean> => {
    try {
      const response = await userAPI.login(data)
      token.value = response.access_token
      refreshToken.value = response.refresh_token
      user.value = response.user

      // 保存到本地存储
      localStorage.setItem('access_token', token.value)
      localStorage.setItem('refresh_token', refreshToken.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 注册
  const register = async (data: {
    username: string
    password: string
    nickname: string
    department: string
    role: string
  }): Promise<boolean> => {
    try {
      await userAPI.register(data)
      return true
    } catch (error) {
      console.error('注册失败:', error)
      return false
    }
  }

  // 获取用户信息
  const fetchUserProfile = async (): Promise<boolean> => {
    try {
      const response = await userAPI.getCurrentUser()
      user.value = response
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return false
    }
  }

  // 退出登录
  const logout = (): void => {
    user.value = null
    token.value = ''
    refreshToken.value = ''
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  // 从本地存储恢复
  const restoreFromStorage = (): void => {
    const storedToken = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) {
      token.value = storedToken
      refreshToken.value = localStorage.getItem('refresh_token') || ''
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  }

  return {
    user,
    token,
    refreshToken,
    isLoggedIn,
    login,
    register,
    fetchUserProfile,
    logout,
    restoreFromStorage,
  }
})

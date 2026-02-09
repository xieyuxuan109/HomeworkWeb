<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decor">
      <div class="decor-item decor-1"></div>
      <div class="decor-item decor-2"></div>
      <div class="decor-item decor-3"></div>
    </div>

    <!-- 品牌信息 -->
    <div class="brand-section">
      <div class="brand-logo">
        <svg viewBox="0 0 200 200" class="geometric-shape">
          <polygon points="100,20 180,80 180,140 100,180 20,140 20,80" fill="none" stroke="rgba(255,255,255,0.1)"
            stroke-width="2" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <path d="M 50 60 Q 100 30 150 60" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
        </svg>
      </div>
      <h1 class="brand-title">作业管理系统</h1>
      <p class="brand-subtitle">高效的作业管理平台</p>
    </div>

    <!-- 表单容器 - 居中显示 -->
    <div class="form-center-wrapper">
      <div class="form-card">
        <div class="form-header">
          <h2>{{ isLogin ? '登录' : '注册' }}</h2>
          <p>{{ isLogin ? '欢迎回来，请登录您的账户' : '创建新账户' }}</p>
        </div>

        <el-form ref="formRef" :model="formData" :rules="rules" @submit.prevent="handleSubmit">
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input v-model="formData.username" :placeholder="isLogin ? '用户名' : '用户名'" prefix-icon="User" size="large"
              clearable />
          </el-form-item>

          <!-- 注册时的角色选择 -->
          <el-form-item v-if="!isLogin" prop="role">
            <el-select v-model="formData.role" placeholder="先选择角色" size="large" clearable @change="handleRoleChange">
              <el-option label="学生" value="student" />
              <el-option label="老师" value="admin" />
            </el-select>
          </el-form-item>

          <!-- 注册时的部门选择 - 根据角色显示不同的部门选项 -->
          <el-form-item v-if="!isLogin && formData.role" prop="department">
            <el-select v-model="formData.department" :placeholder="departmentPlaceholder" size="large" clearable>
              <template v-if="formData.role === 'student' || 'teacher'">
                <el-option label="后端" value="backend" />
                <el-option label="前端" value="frontend" />
                <el-option label="SRE" value="sre" />
                <el-option label="产品" value="product" />
                <el-option label="视觉设计" value="design" />
                <el-option label="Android" value="android" />
                <el-option label="iOS" value="ios" />
              </template>
            </el-select>
          </el-form-item>

          <!-- 注册时的昵称 -->
          <el-form-item v-if="!isLogin" prop="nickname">
            <el-input v-model="formData.nickname" placeholder="昵称" prefix-icon="User" size="large" clearable />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input v-model="formData.password" type="password" placeholder="密码" prefix-icon="Lock" size="large"
              clearable show-password />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item v-if="!isLogin" prop="confirmPassword">
            <el-input v-model="formData.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock"
              size="large" clearable show-password />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleSubmit">
              {{ isLogin ? '登录' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 切换登录/注册 -->
        <div class="form-footer">
          <span v-if="isLogin">
            还没有账户？
            <el-button type="primary" link @click="switchToRegister">
              立即注册
            </el-button>
          </span>
          <span v-else>
            已有账户？
            <el-button type="primary" link @click="switchToLogin">
              立即登录
            </el-button>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const isLogin = ref(true)
const loading = ref(false)

const formData = ref({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  department: '',
  role: '',
})

// 计算部门选择框的占位符
const departmentPlaceholder = computed(() => {
  if (!formData.value.role) {
    return '请先选择角色'
  }
  return formData.value.role === 'student' ? '选择部门' : '选择管理部门'
})

// 切换为注册模式
const switchToRegister = () => {
  isLogin.value = false
  // 重置表单数据，但保留用户名（方便用户注册）
  formData.value = {
    username: formData.value.username,
    nickname: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: '',
  }
}

// 切换为登录模式
const switchToLogin = () => {
  isLogin.value = true
  formData.value = {
    username: formData.value.username,
    nickname: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: '',
  }
}

// 处理角色变化
const handleRoleChange = () => {
  // 角色变化时清空部门选择
  formData.value.department = ''
}

const validatePassword = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (formData.value.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [{ required: true, validator: validatePassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
})

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isLogin.value) {
      // 登录
      await userStore.login({
        username: formData.value.username,
        password: formData.value.password,
      })
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      // 注册
      await userStore.register({
        username: formData.value.username,
        password: formData.value.password,
        nickname: formData.value.nickname,
        department: formData.value.department,
        role: formData.value.role,
      })
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      formData.value = {
        username: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        department: '',
        role: '',
      }
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;

  // 背景装饰元素
  .background-decor {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;

    .decor-item {
      position: absolute;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
    }

    .decor-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      left: -100px;
    }

    .decor-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      right: -50px;
    }

    .decor-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: 10%;
      transform: translateY(-50%);
    }
  }

  // 品牌信息部分
  .brand-section {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;

    .brand-logo {
      margin-bottom: 20px;

      .geometric-shape {
        width: 80px;
        height: 80px;
        color: #10b981;
        animation: rotate 20s linear infinite;
      }

      @keyframes rotate {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }
    }

    .brand-title {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
      font-weight: 400;
    }
  }

  // 居中表单容器
  .form-center-wrapper {
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 40px 32px;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
      }

      .form-header {
        margin-bottom: 32px;
        text-align: center;

        h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
      }

      // 表单项样式
      :deep(.el-form-item) {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      // 角色和部门选择器样式
      :deep(.el-select) {
        width: 100%;
      }

      // 提交按钮样式
      .submit-btn {
        width: 100%;
        height: 44px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border: none;
        margin-top: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        &:active {
          transform: translateY(0);
        }
      }

      // 底部链接样式
      .form-footer {
        text-align: center;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
        font-size: 14px;
        color: #6b7280;

        :deep(.el-button--link) {
          color: #10b981;
          padding: 0 4px;
          font-weight: 500;

          &:hover {
            color: #059669;
          }
        }
      }
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    padding: 16px;

    .brand-section {
      margin-bottom: 32px;

      .brand-title {
        font-size: 28px;
      }

      .brand-subtitle {
        font-size: 14px;
      }
    }

    .form-center-wrapper {
      .form-card {
        padding: 32px 24px;
      }
    }
  }

  @media (max-width: 480px) {
    .brand-section {
      .brand-title {
        font-size: 24px;
      }

      .brand-logo {
        .geometric-shape {
          width: 60px;
          height: 60px;
        }
      }
    }

    .form-center-wrapper {
      .form-card {
        padding: 24px 20px;

        .form-header {
          h2 {
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>
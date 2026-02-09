<template>
  <div class="publish-homework">
    <!-- 顶部导航 -->
    <el-header class="app-header">
      <div class="header-left">
        <el-button type="primary" link @click="$router.back()">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userStore.user?.nickname }}
            <el-icon class="el-icon--right">
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push('/profile')">
                个人资料
              </el-dropdown-item>
              <el-dropdown-item @click="handleLogout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="container">
        <el-card class="publish-card">
          <template #header>
            <span>发布新作业</span>
          </template>

          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="作业标题" prop="title">
              <el-input v-model="form.title" placeholder="例如：第一周作业：实现简单的 HTTP 服务器" />
            </el-form-item>

            <el-form-item label="作业描述" prop="description">
              <el-input v-model="form.description" type="textarea" rows="6" placeholder="详细描述作业要求、提交格式等..." />
            </el-form-item>

            <el-form-item label="所属部门" prop="department">
              <el-select v-model="form.department" placeholder="选择部门">
                <el-option label="后端" value="backend" />
                <el-option label="前端" value="frontend" />
                <el-option label="SRE" value="sre" />
                <el-option label="产品" value="product" />
                <el-option label="视觉设计" value="design" />
                <el-option label="Android" value="android" />
                <el-option label="iOS" value="ios" />
              </el-select>
            </el-form-item>

            <el-form-item label="截止时间" prop="deadline">
              <el-date-picker v-model="form.deadline" type="datetime" placeholder="选择截止时间" format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ssZ" />
            </el-form-item>

            <el-form-item label="允许迟交">
              <el-switch v-model="form.allow_late" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handlePublish" :loading="publishing">
                发布作业
              </el-button>
              <el-button @click="$router.back()">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { ArrowLeft, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { homeworkAPI } from '@/utils/api'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()

const publishing = ref(false)
const form = ref({
  title: '',
  description: '',
  department: 'backend',
  deadline: '',
  allow_late: false,
})

const rules = {
  title: [{ required: true, message: '请输入作业标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入作业描述', trigger: 'blur' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }],
}

const handlePublish = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      publishing.value = true
      try {
        await homeworkAPI.create(form.value)
        ElMessage.success('作业发布成功')
        router.push('/')
      } catch (error) {
        ElMessage.error('发布失败')
      } finally {
        publishing.value = false
      }
    }
  })
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.publish-homework {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #10b981;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .header-left {
    :deep(.el-button) {
      color: white;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .header-right {
    .el-dropdown-link {
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.publish-card {
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 20px;
    }
  }
}
</style>

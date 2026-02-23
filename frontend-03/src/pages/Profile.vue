<template>
  <div class="profile">
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
        <el-row :gutter="20">
          <!-- 个人信息 -->
          <el-col :xs="24" :md="16">
            <el-card class="profile-card">
              <template #header>
                <span>个人信息</span>
              </template>

              <el-form label-width="100px">
                <el-form-item label="用户名">
                  <el-input :model-value="userStore.user?.username" disabled />
                </el-form-item>

                <el-form-item label="昵称">
                  <el-input :model-value="userStore.user?.nickname" disabled />
                </el-form-item>

                <el-form-item label="学科">
                  <el-input :model-value="userStore.user?.subject_label" disabled />
                </el-form-item>

                <el-form-item label="角色">
                  <el-tag :type="userStore.user?.role === 'teacher' ? 'warning' : 'info'">
                    {{ userStore.user?.role === 'teacher' ? '教师' : '学生' }}
                  </el-tag>
                </el-form-item>

                <el-form-item v-if="userStore.user?.email" label="邮箱">
                  <el-input :model-value="userStore.user?.email" disabled />
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <!-- 操作 -->
          <el-col :xs="24" :md="8">
            <el-card class="action-card">
              <template #header>
                <span>账户操作</span>
              </template>

              <div class="actions">
                <el-button type="primary" @click="handleLogout" class="full-width">
                  <el-icon>
                    <SwitchButton />
                  </el-icon>
                  退出登录
                </el-button>
              </div>
            </el-card>

            <!-- 统计信息 -->
            <el-card class="stats-card" v-if="userStore.user?.role === 'student'">
              <template #header>
                <span>我的统计</span>
              </template>

              <div class="stats">
                <div class="stat-item">
                  <span class="label">已提交</span>
                  <span class="value">{{ stats.submitted }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">已批改</span>
                  <span class="value">{{ stats.graded }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">平均分</span>
                  <span class="value">{{ stats.average }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const stats = ref({
  submitted: 0,
  graded: 0,
  average: 0,
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  // 这里可以加载用户的统计数据
  // 暂时使用默认值
})
</script>

<style scoped lang="scss">
.profile {
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
  max-width: 1200px;
  margin: 0 auto;
}

.profile-card {
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 20px;
    }

    .el-input__wrapper {
      background-color: #f5f7fa;
    }
  }
}

.action-card {
  margin-bottom: 20px;

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .full-width {
      width: 100%;
    }
  }
}

.stats-card {
  .stats {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 6px;

      .label {
        color: #6b7280;
        font-size: 14px;
      }

      .value {
        color: #10b981;
        font-weight: 600;
        font-size: 18px;
      }
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
}
</style>
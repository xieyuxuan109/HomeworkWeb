<template>
  <div class="excellent-submissions">
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
        <div class="page-header">
          <h2>优秀作业展示</h2>
          <p>展示所有被标记为优秀的作业提交</p>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <el-skeleton :rows="5" animated />
        </div>

        <!-- 优秀作业列表 -->
        <div v-else class="submissions-list">
          <el-empty v-if="submissions.length === 0" description="暂无优秀作业" />

          <el-row :gutter="20">
            <el-col v-for="submission in submissions" :key="submission.id" :xs="24" :sm="12" :md="8">
              <el-card class="submission-card">
                <template #header>
                  <div class="card-header">
                    <span class="title">{{ submission.homework?.title }}</span>
                    <el-tag type="warning">
                      <el-icon>
                        <Star />
                      </el-icon>
                      优秀
                    </el-tag>
                  </div>
                </template>

                <div class="card-content">
                  <div class="student-info">
                    <span class="label">学生：</span>
                    <span class="value">{{ submission.student?.nickname }}</span>
                  </div>

                  <div class="info-row">
                    <span class="label">部门：</span>
                    <span class="value">{{ submission.homework?.department_label }}</span>
                  </div>

                  <div class="info-row">
                    <span class="label">成绩：</span>
                    <span class="score">{{ submission.score }}分</span>
                  </div>

                  <div class="info-row">
                    <span class="label">提交时间：</span>
                    <span class="value">{{ formatDate(submission.submitted_at) }}</span>
                  </div>

                  <div v-if="submission.comment" class="comment">
                    <p class="comment-title">教师评语</p>
                    <p class="comment-text">{{ submission.comment }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowDown, Star } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { submissionAPI } from '@/utils/api'

const router = useRouter()
const userStore = useUserStore()

const submissions = ref<any[]>([])
const loading = ref(false)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const fetchExcellentSubmissions = async () => {
  loading.value = true
  try {
    const data = await submissionAPI.getExcellent()
    submissions.value = data.list || []
  } catch (error) {
    ElMessage.error('获取优秀作业失败')
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchExcellentSubmissions()
})
</script>

<style scoped lang="scss">
.excellent-submissions {
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

.page-header {
  margin-bottom: 30px;

  h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #1f2937;
  }

  p {
    margin: 0;
    color: #6b7280;
  }
}

.loading {
  padding: 20px;
}

.submissions-list {
  .submission-card {
    cursor: pointer;
    transition: all 0.3s ease;
    height: 100%;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transform: translateY(-4px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;

      .title {
        font-weight: 600;
        color: #1f2937;
        flex: 1;
      }
    }

    .card-content {

      .student-info,
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;

        .label {
          color: #9ca3af;
        }

        .value {
          color: #1f2937;
          font-weight: 500;
        }

        .score {
          color: #10b981;
          font-weight: 600;
          font-size: 16px;
        }
      }

      .comment {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;

        .comment-title {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: #9ca3af;
          font-weight: 600;
        }

        .comment-text {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.5;
        }
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

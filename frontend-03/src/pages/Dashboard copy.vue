<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="header-title">作业提交系统</h1>
        <el-input v-model="searchQuery" placeholder="搜索作业..." prefix-icon="Search" class="search-input" clearable />
      </div>
      <div class="header-right">
        <el-dropdown>
          <div class="user-info">
            <el-avatar :size="32" icon="User" />
            <span class="username">{{ userStore.user?.nickname }}</span>
          </div>
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
    </header>

    <div class="dashboard-content">
      <!-- 左侧菜单 -->
      <aside class="dashboard-sidebar">
        <nav class="sidebar-nav">
          <div class="nav-item" :class="{ active: activeMenu === 'all' }" @click="activeMenu = 'all'">
            <el-icon>
              <House />
            </el-icon>
            <span>首页</span>
          </div>
          <div class="nav-item" :class="{ active: activeMenu === 'my' }" @click="activeMenu = 'my'">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            <span>我的作业</span>
          </div>
          <div v-if="userStore.user?.role === 'teacher'" class="nav-item" :class="{ active: activeMenu === 'publish' }"
            @click="$router.push('/publish')">
            <el-icon>
              <Edit />
            </el-icon>
            <span>发布作业</span>
          </div>
          <div class="nav-item" :class="{ active: activeMenu === 'excellent' }" @click="activeMenu = 'excellent'">
            <el-icon>
              <Star />
            </el-icon>
            <span>优秀作业</span>
          </div>
          <div v-if="userStore.user?.role === 'teacher'" class="nav-item"
            :class="{ active: activeMenu === 'submissions' }" @click="activeMenu = 'submissions'">
            <el-icon>
              <Check />
            </el-icon>
            <span>待批改</span>
          </div>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="dashboard-main">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2>{{ pageTitle }}</h2>
          <div class="header-actions" v-if="activeMenu === 'all'">
            activeMenu
            <el-select v-model="selectedDepartment" placeholder="选择学科" clearable class="filter-select">
              <el-option label="全部学科" value="" />
              <el-option label="语文" value="chinese" />
              <el-option label="数学" value="math" />
              <el-option label="英语" value="english" />
              <el-option label="物理" value="physics" />
              <el-option label="化学" value="chemistry" />
              <el-option label="生物" value="biology" />
              <el-option label="历史" value="history" />
              <el-option label="地理" value="geography" />
              <el-option label="政治" value="politics" />
            </el-select>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="page-content">
          <!-- 首页 -->
          <div v-if="activeMenu === 'all'" class="content-section">
            <div class="homework-grid">
              <div v-for="homework in filteredHomeworks" :key="homework.id" class="homework-card"
                @click="$router.push(`/homework/${homework.id}`)">
                <div class="card-header">
                  <h3>{{ homework.title }}</h3>
                  <el-tag :type="getStatusType(homework)">
                    {{ getStatusText(homework) }}
                  </el-tag>
                </div>
                <p class="card-description">{{ homework.description }}</p>
                <div class="card-footer">
                  <span class="subject">{{ homework.subject_label }}</span>
                  <span class="deadline">{{ formatDate(homework.deadline) }}</span>
                </div>
                <div class="card-progress">
                  <el-progress :percentage="getProgressPercentage(homework)" :color="getProgressColor(homework)" />
                </div>
              </div>
            </div>
            <el-empty v-if="filteredHomeworks.length === 0" description="暂无作业" />
          </div>

          <!-- 我的作业 -->
          <div v-if="activeMenu === 'my'" class="content-section">
            <div class="homework-grid">
              <div v-for="homework in myHomeworks" :key="homework.id" class="homework-card"
                @click="$router.push(`/homework/${homework.id}`)">
                <div class="card-header">
                  <h3>{{ homework.title }}</h3>
                  <el-tag :type="getMySubmissionStatus(homework)">
                    {{ getMySubmissionText(homework) }}
                  </el-tag>
                </div>
                <p class="card-description">{{ homework.description }}</p>
                <div class="card-footer">
                  <span class="subject">{{ homework.subject_label }}</span>
                  <span class="deadline">{{ formatDate(homework.deadline) }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="myHomeworks.length === 0" description="暂无作业" />
          </div>

          <!-- 优秀作业 -->
          <div v-if="activeMenu === 'excellent'" class="content-section">
            <div class="homework-grid">
              <div v-for="submission in excellentSubmissions" :key="submission.id" class="homework-card"
                @click="$router.push(`/homework/${submission.homework.id}`)">
                <div class="card-header">
                  <h3>{{ submission.homework.title }}</h3>
                  <el-tag type="success">优秀</el-tag>
                </div>
                <p class="card-description">
                  提交者：{{ submission.student.nickname }}
                </p>
                <div class="card-footer">
                  <span class="subject">{{ submission.homework.subject_label }}</span>
                  <span class="score">得分：{{ submission.score }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="excellentSubmissions.length === 0" description="暂无优秀作业" />
          </div>

          <!-- 待批改 -->
          <div v-if="activeMenu === 'submissions'" class="content-section">
            <el-table :data="pendingSubmissions" stripe>
              <el-table-column prop="homework.title" label="作业标题" />
              <el-table-column prop="student.nickname" label="学生姓名" />
              <el-table-column label="提交时间">
                <template #default="{ row }">
                  {{ formatDate(row.submitted_at) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="$router.push(`/review/${row.id}`)">
                    批改
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-if="pendingSubmissions.length === 0" description="暂无待批改作业" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { homeworkAPI, submissionAPI } from '@/utils/api'
import { House, DocumentCopy, Edit, Star, Check } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref('all')
const Query = ref('')
const selectedDepartment = ref('chinese')
const homeworks = ref<any[]>([])
const myHomeworks = ref<any[]>([])
const excellentSubmissions = ref<any[]>([])
const pendingSubmissions = ref<any[]>([])

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    all: '所有作业',
    my: '我的作业',
    excellent: '优秀作业',
    submissions: '待批改作业',
  }
  return titles[activeMenu.value] || '所有作业'
})

const filteredHomeworks = computed(() => {
  return homeworks.value.filter((hw) => {
    const matchDept = !selectedDepartment.value || hw.subject === selectedDepartment.value
    const matchSearch = !searchQuery.value || hw.title.includes(searchQuery.value)
    return matchDept && matchSearch
  })
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getStatusType = (homework: any) => {
  const now = new Date()
  const deadline = new Date(homework.deadline)
  if (now > deadline) return 'info'
  return 'success'
}

const getStatusText = (homework: any) => {
  const now = new Date()
  const deadline = new Date(homework.deadline)
  if (now > deadline) return '已截止'
  return '进行中'
}

const getProgressPercentage = (homework: any) => {
  if (!homework.submission_count) return 0
  return Math.min(100, Math.round((homework.submission_count / 30) * 100))
}

const getProgressColor = (homework: any) => {
  const percentage = getProgressPercentage(homework)
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}

const getMySubmissionStatus = (homework: any) => {
  if (homework.my_submission?.score !== undefined) return 'success'
  if (homework.my_submission) return 'warning'
  return 'info'
}

const getMySubmissionText = (homework: any) => {
  if (homework.my_submission?.score !== undefined) return '已批改'
  if (homework.my_submission) return '已提交'
  return '未提交'
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const loadData = async () => {
  try {
    // 加载作业列表
    const hwRes = await homeworkAPI.getList()
    homeworks.value = hwRes.list || []

    // 加载优秀作业
    const excRes = await submissionAPI.getByHomework(0)
    excellentSubmissions.value = excRes.list || []

    // 如果是学生，加载我的作业
    if (userStore.user?.role === 'student') {
      const myRes = await submissionAPI.getMySubmissions()
      myHomeworks.value = myRes.list || []
    }

    // 如果是老师，加载待批改
    if (userStore.user?.role === 'teacher') {
      const pendRes = await submissionAPI.getByHomework(0)
      pendingSubmissions.value = pendRes.list || []
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;

  .dashboard-header {
    height: 64px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    color: white;

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;

      .header-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0;
        white-space: nowrap;
      }

      .search-input {
        width: 200px;

        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.2);
          border: none;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }

        :deep(.el-input__inner) {
          color: white;

          &::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .username {
          font-size: 14px;
        }
      }
    }
  }

  .dashboard-content {
    display: flex;
    flex: 1;
    overflow: hidden;

    .dashboard-sidebar {
      width: 200px;
      background: white;
      border-right: 1px solid #e5e7eb;
      overflow-y: auto;

      .sidebar-nav {
        padding: 16px 0;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.3s;
          font-size: 14px;

          &:hover {
            background: #f3f4f6;
            color: #10b981;
          }

          &.active {
            background: #f0fdf4;
            color: #10b981;
            border-right: 3px solid #10b981;
          }

          :deep(.el-icon) {
            font-size: 18px;
          }
        }
      }
    }

    .dashboard-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        background: white;
        border-bottom: 1px solid #e5e7eb;

        h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        .header-actions {
          display: flex;
          gap: 12px;

          .filter-select {
            width: 150px;
          }
        }
      }

      .page-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;

        .content-section {
          max-width: 1200px;
          margin: 0 auto;

          .homework-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;

            .homework-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
              cursor: pointer;
              transition: all 0.3s;
              border-top: 3px solid #10b981;

              &:hover {
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
                transform: translateY(-4px);
              }

              .card-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;

                h3 {
                  font-size: 16px;
                  font-weight: 600;
                  margin: 0;
                  color: #1f2937;
                  flex: 1;
                }

                :deep(.el-tag) {
                  margin-left: 8px;
                }
              }

              .card-description {
                font-size: 13px;
                color: #6b7280;
                margin: 12px 0;
                line-height: 1.5;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .card-footer {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: #9ca3af;
                margin-bottom: 12px;
              }

              .card-progress {
                margin-top: 12px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    .dashboard-content {
      .dashboard-sidebar {
        width: 80px;

        .sidebar-nav .nav-item {
          flex-direction: column;
          padding: 8px;
          font-size: 12px;

          span {
            text-align: center;
          }
        }
      }
    }
  }
}
</style>

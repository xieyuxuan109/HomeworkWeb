<template>
  <div class="homework-detail">
    <!-- 顶部导航 -->
    <header class="detail-header">
      <div class="header-left">
        <el-button type="primary" link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">{{ homework?.title }}</h1>
      </div>
      <div class="header-right">
        <el-dropdown>
          <div class="user-info">
            <el-avatar :size="32" icon="User" />
            <span>{{ userStore.user?.nickname }}</span>
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

    <div class="detail-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 主内容 -->
      <div v-else class="detail-content">
        <!-- 左侧：作业信息 -->
        <div class="left-panel">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">作业信息</span>
            </template>

            <div class="info-section">
              <div class="info-item">
                <span class="label">部门：</span>
                <span class="value">{{ homework?.department_label }}</span>
              </div>
              <div class="info-item">
                <span class="label">截止时间：</span>
                <span class="value">{{ formatDateTime(homework?.deadline) }}</span>
              </div>
              <div class="info-item">
                <span class="label">描述：</span>
                <p class="value-text">{{ homework?.description }}</p>
              </div>
              <div v-if="homework?.attachment_url" class="info-item">
                <span class="label">附件：</span>
                <el-link type="primary" :href="homework.attachment_url" target="_blank">
                  <el-icon><Download /></el-icon>
                  下载文件
                </el-link>
              </div>
            </div>
          </el-card>

          <!-- 学生提交列表（教师视图） -->
          <el-card v-if="userStore.user?.role === 'admin'" class="submissions-card">
            <template #header>
              <span class="card-title">学生提交</span>
            </template>

            <el-table :data="submissions" stripe>
              <el-table-column prop="student_name" label="学生" width="120" />
              <el-table-column prop="submitted_at" label="提交时间" width="160">
                <template #default="{ row }">
                  {{ formatDateTime(row.submitted_at) }}
                </template>
              </el-table-column>
              <el-table-column prop="score" label="成绩" width="80">
                <template #default="{ row }">
                  <el-tag v-if="row.score" type="success">{{ row.score }}</el-tag>
                  <el-tag v-else type="warning">待批改</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    text
                    size="small"
                    @click="handleReview(row)"
                  >
                    {{ row.score ? '重新批改' : '批改' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 右侧：提交详情或批改表单 -->
        <div class="right-panel">
          <!-- 学生提交详情 -->
          <el-card v-if="userStore.user?.role === 'student'" class="submission-card">
            <template #header>
              <span class="card-title">我的提交</span>
            </template>

            <div v-if="mySubmission" class="submission-content">
              <div class="submission-info">
                <div class="info-item">
                  <span class="label">提交时间：</span>
                  <span class="value">{{ formatDateTime(mySubmission.submitted_at) }}</span>
                </div>
                <div v-if="mySubmission.score" class="info-item">
                  <span class="label">成绩：</span>
                  <span class="value score">{{ mySubmission.score }}分</span>
                </div>
              </div>

              <div v-if="mySubmission.content" class="submission-preview">
                <p class="preview-title">提交内容</p>
                <div class="preview-content">{{ mySubmission.content }}</div>
              </div>

              <div v-if="mySubmission.comment" class="teacher-comment">
                <p class="comment-title">教师评语</p>
                <div class="comment-content">{{ mySubmission.comment }}</div>
              </div>

              <div class="action-buttons">
                <el-button type="primary" @click="handleSubmit">
                  重新提交
                </el-button>
              </div>
            </div>

            <div v-else class="empty-submission">
              <el-empty description="暂未提交" />
              <el-button type="primary" @click="handleSubmit">
                立即提交
              </el-button>
            </div>
          </el-card>

          <!-- 批改表单（教师视图） -->
          <el-card v-if="showReviewForm" class="review-card">
            <template #header>
              <span class="card-title">批改作业</span>
            </template>

            <el-form :model="reviewForm" label-width="100px">
              <el-form-item label="学生">
                <span>{{ selectedSubmission?.student_name }}</span>
              </el-form-item>

              <el-form-item label="提交时间">
                <span>{{ formatDateTime(selectedSubmission?.submitted_at) }}</span>
              </el-form-item>

              <el-form-item label="提交内容">
                <div class="submission-preview">
                  {{ selectedSubmission?.content }}
                </div>
              </el-form-item>

              <el-form-item label="成绩" prop="score">
                <el-input-number
                  v-model="reviewForm.score"
                  :min="0"
                  :max="100"
                  placeholder="请输入成绩"
                />
              </el-form-item>

              <el-form-item label="评语" prop="comment">
                <el-input
                  v-model="reviewForm.comment"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入评语"
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handleSubmitReview">
                  提交批改
                </el-button>
                <el-button @click="showReviewForm = false">
                  取消
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Download } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { homeworkAPI, submissionAPI } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const homework = ref<any>(null)
const submissions = ref<any[]>([])
const mySubmission = ref<any>(null)
const loading = ref(false)
const showReviewForm = ref(false)
const selectedSubmission = ref<any>(null)

const reviewForm = ref({
  score: 0,
  comment: '',
})

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const fetchHomeworkDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const data = await homeworkAPI.getDetail(id)
    homework.value = data

    if (userStore.user?.role === 'admin') {
      const submissionsData = await submissionAPI.getByHomework(id)
      submissions.value = submissionsData.list || []
    } else {
      const myData = await submissionAPI.getMySubmission(id)
      mySubmission.value = myData
    }
  } catch (error) {
    ElMessage.error('获取作业详情失败')
  } finally {
    loading.value = false
  }
}

const handleReview = (submission: any) => {
  selectedSubmission.value = submission
  reviewForm.value = {
    score: submission.score || 0,
    comment: submission.comment || '',
  }
  showReviewForm.value = true
}

const handleSubmitReview = async () => {
  try {
    await submissionAPI.review(selectedSubmission.value.id, {
      score: reviewForm.value.score,
      comment: reviewForm.value.comment,
    })
    ElMessage.success('批改成功')
    showReviewForm.value = false
    fetchHomeworkDetail()
  } catch (error) {
    ElMessage.error('批改失败')
  }
}

const handleSubmit = () => {
  router.push(`/homework/${route.params.id}/submit`)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchHomeworkDetail()
})
</script>

<style scoped lang="scss">
.homework-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

// 顶部导航
.detail-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;

    :deep(.el-button) {
      color: white;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.detail-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading {
  padding: 20px;
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.submissions-card,
.submission-card,
.review-card {
  border-top: 4px solid #10b981;
  border-radius: 12px;

  :deep(.el-card__header) {
    border-bottom: 1px solid #e5e7eb;
  }
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;

  .label {
    color: #9ca3af;
    font-weight: 500;
    min-width: 80px;
  }

  .value {
    color: #1f2937;
    flex: 1;
  }

  .value-text {
    margin: 0;
    color: #1f2937;
    line-height: 1.6;
  }

  .score {
    color: #10b981;
    font-weight: 600;
    font-size: 16px;
  }
}

.submission-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.submission-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.submission-preview {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #10b981;

  .preview-title,
  .comment-title {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }

  .preview-content,
  .comment-content {
    margin: 0;
    color: #6b7280;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.teacher-comment {
  padding: 16px;
  background-color: #f0fdf4;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.empty-submission {
  text-align: center;
  padding: 40px 20px;

  :deep(.el-empty) {
    margin-bottom: 20px;
  }
}

:deep(.el-table) {
  .el-table__header {
    background-color: #f9fafb;
  }

  .el-table__row {
    &:hover {
      background-color: #f3f4f6;
    }
  }
}

:deep(.el-form) {
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-input__wrapper {
    background-color: #f5f7fa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;

    &:focus-within {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
  }
}
</style>

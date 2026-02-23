<template>
    <div class="submit-homework-container">
        <!-- 背景装饰 -->
        <div class="background-decor">
            <div class="decor-item decor-1"></div>
            <div class="decor-item decor-2"></div>
            <div class="decor-item decor-3"></div>
        </div>

        <!-- 页面头部 -->
        <div class="page-header">
            <h1 class="page-title">提交作业</h1>
            <p class="page-subtitle">请仔细阅读作业要求并按时提交</p>
        </div>

        <!-- 主体卡片 -->
        <div class="main-card-wrapper">
            <div class="main-card">
                <div class="card-header">
                    <h2>{{ homework?.title || '加载中...' }}</h2>
                    <div class="homework-meta" v-if="homework">
                        <el-tag type="info" size="small">学科: {{ homework.subject_label }}</el-tag>
                        <el-tag type="warning" size="small">截止: {{ formatDeadline(homework.deadline) }}</el-tag>
                        <el-tag :type="isLate ? 'danger' : 'success'" size="small">
                            {{ isLate ? '已截止' : '进行中' }}
                        </el-tag>
                    </div>
                </div>

                <div class="homework-description" v-if="homework">
                    <h3>作业要求</h3>
                    <p>{{ homework.description || '暂无描述' }}</p>
                </div>

                <el-divider />

                <el-form ref="formRef" :model="formData" :rules="rules" @submit.prevent>
                    <!-- 作业内容输入 -->
                    <el-form-item prop="content" label="作业内容">
                        <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入作业内容（可以是文字、链接等）"
                            maxlength="2000" show-word-limit />
                    </el-form-item>

                    <!-- 文件链接输入 -->
                    <el-form-item prop="file_url" label="附件链接 (可选)">
                        <el-input v-model="formData.file_url" placeholder="请输入文件的网络链接（例如 GitHub、网盘等）" clearable />
                        <template #description>
                            <div class="input-description">
                                如果你的作业包含文件（如 PDF、压缩包等），请提供其网络链接。
                            </div>
                        </template>
                    </el-form-item>

                    <!-- 提交按钮 -->
                    <el-form-item>
                        <el-button type="primary" size="large" class="submit-btn" :loading="submitting"
                            :disabled="isLate" @click="handleSubmit">
                            {{ isLate ? '已截止，无法提交' : '提交作业' }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { submissionAPI, homeworkAPI } from '@/utils/api'
import type { Homework, Submission } from '@/types/api'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

// 从路由参数获取作业 ID
const homeworkId = computed(() => route.params.id as string)

// 数据
const homework = ref<Homework | null>(null)
const submitting = ref(false)

// 表单数据
const formData = ref({
    content: '',
    file_url: '' // 存储用户输入的文件链接
})

// 计算属性
const isLate = computed(() => {
    if (!homework.value) return true
    return new Date() > new Date(homework.value.deadline)
})

// 表单校验规则
const rules = ref({
    content: [
        { required: true, message: '请输入作业内容', trigger: 'blur' },
        { min: 10, message: '作业内容不能少于10个字符', trigger: 'blur' }
    ],
    file_url: [
        { type: 'url', message: '请输入有效的 URL 地址', trigger: 'blur' }
    ]
})

// 格式化截止时间
const formatDeadline = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
}

// 加载作业详情
const loadHomeworkDetail = async () => {
    try {
        const data = await homeworkAPI.getDetail(homeworkId.value)
        homework.value = data
    } catch (error) {
        console.error('加载作业详情失败:', error)
        ElMessage.error('加载作业详情失败')
        router.push('/homework') // 返回列表页
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return

    if (isLate.value) {
        ElMessage.warning('该作业已截止，无法提交！')
        return
    }

    try {
        await formRef.value.validate()

        if (submitting.value) return // 防止重复提交

        submitting.value = true

        // 准备提交数据
        const submitData = {
            homework_id: parseInt(homeworkId.value),
            content: formData.value.content.trim(),
            ...(formData.value.file_url && { file_url: formData.value.file_url }) // 如果有链接才带上
        }

        // 调用提交 API
        const response: Submission = await submissionAPI.submit(submitData)

        ElMessage.success('作业提交成功！')

        // 提交成功后，可以选择跳转到我的提交列表或作业详情页
        router.push('/mysubmissions')

    } catch (error: any) {
        console.error('提交失败:', error)
        if (error.message) {
            ElMessage.error(error.message)
        } else {
            ElMessage.error('提交失败，请稍后重试')
        }
    } finally {
        submitting.value = false
    }
}

// 初始化
onMounted(() => {
    if (!homeworkId.value) {
        ElMessage.error('无效的作业ID')
        router.push('/homework')
        return
    }
    loadHomeworkDetail()
})
</script>

<style scoped lang="scss">
.submit-homework-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    position: relative;
    overflow-x: hidden;

    .background-decor {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 0;

        .decor-item {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
        }

        .decor-1 {
            width: 250px;
            height: 250px;
            top: -80px;
            left: -80px;
        }

        .decor-2 {
            width: 180px;
            height: 180px;
            bottom: -40px;
            right: -40px;
        }

        .decor-3 {
            width: 120px;
            height: 120px;
            top: 20%;
            right: 15%;
        }
    }

    .page-header {
        text-align: center;
        margin-bottom: 30px;
        z-index: 1;

        .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .page-subtitle {
            font-size: 14px;
            color: #64748b;
            margin: 0;
            font-weight: 400;
        }
    }

    .main-card-wrapper {
        width: 100%;
        max-width: 700px;
        position: relative;
        z-index: 1;

        .main-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
            padding: 32px;
            transition: all 0.3s ease;

            &:hover {
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
            }

            .card-header {
                margin-bottom: 24px;

                h2 {
                    font-size: 22px;
                    font-weight: 600;
                    color: #1e293b;
                    margin: 0 0 12px 0;
                }

                .homework-meta {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
            }

            .homework-description {
                margin-bottom: 24px;

                h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #334155;
                    margin: 0 0 8px 0;
                }

                p {
                    font-size: 14px;
                    color: #64748b;
                    line-height: 1.6;
                    white-space: pre-wrap; // 保持换行
                }
            }

            :deep(.el-form-item__label) {
                font-weight: 500;
                color: #334155;
            }

            .input-description {
                font-size: 12px;
                color: #94a3b8;
                margin-top: 4px;
            }

            .submit-btn {
                width: 100%;
                height: 44px;
                font-size: 16px;
                font-weight: 600;
                border-radius: 8px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                border: none;
                transition: all 0.3s ease;

                &:hover:not(:disabled) {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                &:active:not(:disabled) {
                    transform: translateY(0);
                }

                &:disabled {
                    background: #cbd5e1;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
            }
        }
    }

    @media (max-width: 768px) {
        padding: 16px;

        .page-header {
            margin-bottom: 24px;

            .page-title {
                font-size: 24px;
            }
        }

        .main-card-wrapper {
            .main-card {
                padding: 24px 20px;
            }
        }
    }
}
</style>
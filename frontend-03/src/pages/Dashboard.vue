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
          <div class="nav-item" :class="{ active: activeMenu === 'all' }" @click="handleMenuClick('all')">
            <el-icon>
              <House />
            </el-icon>
            <span>首页</span>
          </div>
          <div class="nav-item" :class="{ active: activeMenu === 'my' }" @click="handleMenuClick('my')">
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
          <div class="nav-item" :class="{ active: activeMenu === 'excellent' }" @click="handleMenuClick('excellent')">
            <el-icon>
              <Star />
            </el-icon>
            <span>优秀作业</span>
          </div>
          <div v-if="userStore.user?.role === 'teacher'" class="nav-item"
            :class="{ active: activeMenu === 'submissions' }" @click="handleMenuClick('submissions')">
            <el-icon>
              <Check />
            </el-icon>
            <span>所有的作业提交</span>
          </div>

        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="dashboard-main">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2>{{ pageTitle }}</h2>
          <div class="header-actions" v-if="activeMenu === 'all'">
            <el-select v-model="selectedDepartment" placeholder="请选择学科" class="filter-select"
              @change="handleHomework(selectedDepartment)">
              <el-option label="全部学科" value="all" />
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
        <div class="content">
          <el-dialog v-model="dialogFormVisible" :title="currentTitle" width="700" style="height: 600px;" <
            :model="formData" label-width="70px">
            <el-form-item label="ID" :label-width="70">
              <el-input v-model="formData.id" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业标题" :label-width="70" style="text-align: right;">
              <el-input v-model="formData.title" autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业内容" :label-width="70" style="text-align: right;">
              <el-input type="textarea" v-model="formData.description" autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="截止时间" prop="deadline">
              <el-date-picker v-model="formData.deadline" type="datetime" placeholder="选择截止时间" format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ssZ" />
            </el-form-item>

            <el-form-item label="允许迟交">
              <el-switch v-model="formData.allow_late" />
            </el-form-item>

            <el-form-item label="学科" :label-width="70">
              <el-select v-model="formData.subject" placeholder="请选择学科" style="width: 100%;">
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
            </el-form-item>


            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmEdit">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
          <el-dialog v-model="dialogFormVisible1" :title="currentTitle1" width="1200" style="height: 1200px;" <
            :model="formData1" label-width="70px">
            <el-form-item label="ID" :label-width="70">
              <el-input v-model="formData1.id" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业标题" :label-width="70" style="text-align: right;">
              <el-input v-model="formData1.homework.title" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业内容" :label-width="70" disabled style="text-align: right;">
              <el-input type="textarea" v-model="formData1.homework.description" disabled autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="学生姓名">
              <el-input v-model="formData1.student.nickname" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="提交内容" :label-width="70" style="text-align: right;">
              <el-input type="textarea" v-model="formData1.content" disabled autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="附件地址" :label-width="70">
              <el-input v-model="formData1.file_url" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="评语" :label-width="70" disabled style="text-align: right;">
              <el-input type="textarea" v-model="formData1.comment" autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="成绩" :label-width="70">
              <el-input v-model="formData1.score" autocomplete="off" />
            </el-form-item>
            <el-form-item label="是否为优秀作业">
              <el-switch v-model="formData1.is_excellent" />
            </el-form-item>


            <el-form-item label="学科" :label-width="70">
              <el-select v-model="formData.subject" placeholder="请选择学科" style="width: 100%;">
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
            </el-form-item>
            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogFormVisible1 = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmEdit1">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
          <el-dialog v-model="dialogFormVisibleStu" :title="currentTitleStu" width="1200" style="height: 850px;" <
            :model="formDataStu" label-width="70px">
            <el-form-item label="ID" :label-width="70">
              <el-input v-model="formDataStu.id" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业标题" :label-width="70" style="text-align: right;">
              <el-input v-model="formDataStu.title" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="作业内容" :label-width="70" disabled style="text-align: right;">
              <el-input type="textarea" v-model="formDataStu.description" disabled autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="发布教师">
              <el-input v-model="formDataStu.creator.nickname" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="截止时间">
              <el-input v-model="formDataStu.deadline" disabled autocomplete="off" />
            </el-form-item>
            <el-form-item label="提交内容" :label-width="70" style="text-align: right;">
              <el-input type="textarea" v-model="formDataStu.content" autocomplete="off" :rows="10"
                :style="{ width: '100%', minHeight: '180px' }" resize="vertical" />
            </el-form-item>
            <el-form-item label="附件地址" :label-width="70">
              <el-input v-model="formDataStu.file_url" autocomplete="off" />
            </el-form-item>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="dialogFormVisibleStu = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmEditStu">
                  确定
                </el-button>
              </div>
            </template>
          </el-dialog>
          <el-table :data="filterTableData" :key="tableKey1" v-if="showHomeworkTable" stripe style="width: 100%"
            height="500">
            <el-table-column fixed label="ID" prop="id" width="80" />
            <el-table-column fixed label="题目" show-overflow-tooltip="true" prop="title">
            </el-table-column>
            <el-table-column fixed label="内容详情" show-overflow-tooltip="true" prop="description" />
            <el-table-column fixed label="发布者" prop="creator.nickname" />
            <el-table-column fixed label="发布者ID" prop="creator.id" />
            <el-table-column fixed label="截止日期" prop="deadline" />
            <el-table-column fixed label="学科" prop="subject_label" />
            <el-table-column fixed label="是否允许迟交" prop="allow_late">
              <template #default="scope">
                <span :style="{ color: scope.row.allow_late ? '#67C23A' : '#F56C6C' }">
                  {{ scope.row.allow_late ? '是' : '否' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="right">
              <template #header>
                <el-input v-model="search" size="small" placeholder="请输入需要搜索的作业题目" />
              </template>
              <template #default="scope">

                <el-button size="small" v-if="userStore.user?.role === 'teacher' ? true : false"
                  @click="handleEdit(scope.$index, scope.row)">
                  修改

                </el-button>
                <el-button size="small" v-if="userStore.user?.role === 'student' ? true : false"
                  @click="handleEditStu(scope.$index, scope.row)">
                  提交作业

                </el-button>
                <el-button size="small" v-if="userStore.user?.role === 'teacher' ? true : false" type="danger"
                  @click="handleDelete(scope.$index, scope.row)">
                  删除
                </el-button>

              </template>
            </el-table-column>
          </el-table>

          <el-table :data="filterSubmissionData" :key="tableKey2" v-if="showSubmissionTable" stripe style="width: 100%"
            height="520">
            submissions.values
            <el-table-column fixed label="ID" prop="id" width="40" />
            <el-table-column fixed label="作业题目" prop="homework.title" show-overflow-tooltip="true" width="150" />
            <el-table-column fixed label="学生姓名" prop="student.nickname" width="80" />
            <el-table-column fixed label="内容" prop="content" show-overflow-tooltip="true" width="150">
            </el-table-column>
            <el-table-column fixed label="附件地址" prop="file_url" show-overflow-tooltip="true" width="150" />
            <el-table-column fixed label="是否晚交" prop="is_late" width="80">
              <template #default="scope">
                <span :style="{ color: scope.row.is_late ? '#F56C6C' : '#67C23A' }">
                  {{ scope.row.is_late ? '是' : '否' }}
                </span>
              </template>
            </el-table-column>



            <el-table-column fixed label="学生id" v-if="false" prop="student.id" width="80" />
            <el-table-column fixed label="是否允许迟交" prop="student." width="120">
              <template #default="scope">
                <span :style="{ color: scope.row.allow_late ? '#F56C6C' : '#67C23A' }">
                  {{ scope.row.allow_late ? '否' : '是' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column fixed label="成绩" prop="score" width="80" />
            <el-table-column fixed label="评语" prop="comment" show-overflow-tooltip="true" width="150" />
            <el-table-column fixed label="是否为优秀作业" prop="is_excellent" width="130">
              <template #default="scope">
                <span :style="{ color: scope.row.is_excellent ? '#67C23A' : '#F56C6C' }">
                  {{ scope.row.is_excellent ? '是' : '否' }}
                </span>
              </template></el-table-column>

            <el-table-column align="right">
              <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search" />
              </template>
              <template #default="scope">
                <el-button size="small" v-if="userStore.user?.role === 'teacher' ? true : false"
                  @click="handleEdit1(scope.$index, scope.row)">
                  批改
                </el-button>
                <el-button size="small" v-if="userStore.user?.role === 'teacher' ? true : false" type="danger"
                  @click="handleDelete(scope.$index, scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="demo-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[15, 30, 50]"
              :size="size" :disabled="disabled" :background="background"
              layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ComponentSize, descriptionItemProps } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { homeworkAPI, submissionAPI } from '@/utils/api'
import { House, DocumentCopy, Edit, Star, Check } from '@element-plus/icons-vue'
var dialogFormVisible = ref(false)
var dialogFormVisible1 = ref(false)
var dialogFormVisibleStu = ref(false)
var currentTitle = "修改作业"
var currentTitle1 = "批改作业"
var currentTitleStu = "提交作业"
const router = useRouter()
const userStore = useUserStore()

const currentPage = ref(1)
const pageSize = ref(15)
const size = ref<ComponentSize>('default')
const background = ref(false)
const disabled = ref(false)
const activeMenu = ref('all')
const searchQuery = ref('')
const selectedDepartment = ref('all')
const homeworks = ref<any[]>([])
const submissions = ref<any[]>([])
const myHomeworks = ref<any[]>([])
const excellentSubmissions = ref<any[]>([])
const pendingSubmissions = ref<any[]>([])
// const handleChange = () => {
//   loadData()
// }


// import { useUserStore } from '@/stores/user'


var total = 0
// const pageTitle = computed(() => {
//   const titles: Record<string, string> = {
//     all: '所有作业',
//     my: '我的作业',
//     excellent: '优秀作业',
//     submissions: '待批改作业',
//   }
//   return titles[activeMenu.value] || '所有作业'
// })


// 计算属性：判断显示哪个表格
const showHomeworkTable = computed(() => {
  return ['all', 'my'].includes(activeMenu.value)
})

const showSubmissionTable = computed(() => {
  return ['excellent', 'submissions'].includes(activeMenu.value)
})
// 修改菜单点击函数
const handleMenuClick = async (menu: string) => {
  activeMenu.value = menu

  //强制表格重新渲染
  if (menu === 'all' || menu === 'my') {
    tableKey1.value++
    await handleHomework(menu)
  } else {
    tableKey2.value++
    await handleSubmissions(menu)
  }
}

// 监听菜单变化
watch(activeMenu, async (newMenu) => {
  console.log('菜单切换:', newMenu)

  // 根据菜单类型加载数据
  if (['all', 'my'].includes(newMenu)) {
    await handleHomework(newMenu)
    tableKey1.value++  // 强制刷新作业表格
  } else if (['excellent', 'submissions'].includes(newMenu)) {
    await handleSubmissions(newMenu)
    tableKey2.value++  // 强制刷新提交表格
  }

  // 更新页面标题
  updatePageTitle(newMenu)
})

// 更新页面标题
const updatePageTitle = (menu: string) => {
  const titles: Record<string, string> = {
    all: '所有作业',
    my: '我的作业',
    excellent: '优秀作业',
    submissions: '所有的作业提交'
  }
  pageTitle = titles[menu] || '所有作业'
}

const filteredHomeworks = computed(() => {
  return homeworks.value.filter((hw) => {
    const matchDept = !selectedDepartment.value || hw.subject === selectedDepartment.value
    const matchSearch = !searchQuery.value || hw.title.includes(searchQuery.value)
    return matchDept && matchSearch
  })
})

interface TableItem {
  id: number
  name: string
  age: number
  address: string
  isEdit: boolean
  originalData?: any // 用于保存原始数据
}
// const activeMenu = ref('all')
// const tableKey1 = ref(0)  // 用于强制重新渲染
// const tableKey2 = ref(0)
// watch(activeMenu, () => {
//   if (['all', 'my'].includes(activeMenu.value)) {
//     tableKey1.value++
//     handleHomework(activeMenu.value)
//   } else {
//     tableKey2.value++
//     handleSubmissions(activeMenu.value)
//   }
// })

const handleHomework = async (val: string) => {

  if (val === "all") {
    pageTitle = '所有作业'
    subjects = 'all'
  } else if (val === "my") {
    pageTitle = '我的作业'
    subjects = ''
  } else {
    pageTitle = '所有作业'
    subjects = selectedDepartment.value
  }

  const hwRes = await homeworkAPI.getList({
    subject: subjects,
    page: currentPage.value,
    page_size: pageSize.value,
  })

  homeworks.value = hwRes.list || []
  console.log(homeworks.value)
  total = hwRes.total
  // loadData()
}
var tag = false
const handleSubmissions = async (val: string) => {
  if (val === "excellent") {
    pageTitle = '优秀的作业提交'
    tag = true
  } else {
    pageTitle = '所有的作业提交'
    tag = false
  }

  const hwRes = await submissionAPI.getSubmissions({
    tag: tag,
    page: currentPage.value,
    page_size: pageSize.value,
  })

  submissions.value = hwRes.list || []
  console.log(submissions.value)
  total = hwRes.total
}

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

const handleSizeChange = (val: number) => {
  loadData()
}
const handleCurrentChange = (val: number) => {
  loadData()
}

var pageTitle = '所有作业'
var subjects = 'all'
const loadData = async () => {
  try {
    switch (activeMenu.value) {
      case "all":
        pageTitle = '所有作业'
        subjects = selectedDepartment.value
        break;
      case "my":
        pageTitle = '我的作业'
        subjects = ""
        break;
      case "excellent":
        pageTitle = '优秀作业'
        break;
      case "submissions":
        pageTitle = '待批改作业'
        break;
      default:
        pageTitle = '所有作业'
        subjects = 'all'
    }

    handleHomework('all')
    // handleSubmissions('excellent')
    //   // 加载优秀作业
    //   const excRes = await submissionAPI.getByHomework(0)
    //   excellentSubmissions.value = excRes.list || []

    //   // 如果是学生，加载我的作业
    //   if (userStore.user?.role === 'student') {
    //     const myRes = await submissionAPI.getMySubmissions()
    //     myHomeworks.value = myRes.list || []
    //   } selectedDepartment.value

    //   // 如果是老师，加载待批改
    //   if (userStore.user?.role === 'teacher') {
    //     const pendRes = await submissionAPI.getByHomework(0)
    //     pendingSubmissions.value = pendRes.list || []
    //   }
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  }
}
onMounted(() => {
  loadData()
})
const search = ref('')
const filterTableData = computed(() =>
  homeworks.value.filter(
    (data) =>
      !search.value ||
      data.title.toLowerCase().includes(search.value.toLowerCase())
  )
)

const filterSubmissionData = computed(() =>
  submissions.value.filter(
    (data) =>
      !search.value ||
      data.title.toLowerCase().includes(search.value.toLowerCase())
  )
)
const formData = reactive({
  id: '',
  title: '',
  description: '',
  subject: '',
  deadline: '',
  allow_late: false,
})
const formData1 = reactive({
  id: '',
  content: '',
  file_url: '',
  comment: '',
  score: 0,
  is_excellent: false,
  homework: {
    title: '',
    description: ''
  },
  student: {
    nickname: ''
  }
})
const formDataStu = reactive({
  id: '',
  content: '',
  title: '',
  file_url: '',
  description: '',
  deadline: '',
  creator: {
    nickname: ''
  }
})
const handleEditStu = async (index: number, row: any) => {
  dialogFormVisibleStu.value = true
  Object.assign(formDataStu, row)
  console.log(formDataStu)

}
const handleEdit1 = async (index: number, row: any) => {
  dialogFormVisible1.value = true
  Object.assign(formData1, row)
  // 将数据填充到表单
  // formData1.id = row.id || ''
  // formData1.content = row.title || ''
  // formData1.id = row.id || ''
  // formData1.title = row.title || ''
  // formData1.description = row.description || ''
  // formData1.subject = row.subject || 'chinese' // 设置默认值
  // formData1.deadline = row.deadline || ''
  // formData1.is_excellent = row.is_excellent || ''
}
const handleEdit = async (index: number, row: any) => {
  dialogFormVisible.value = true

  // 将数据填充到表单
  formData.id = row.id || ''
  formData.title = row.title || ''
  formData.description = row.description || ''
  formData.subject = row.subject || 'chinese' // 设置默认值
  formData.deadline = row.deadline || ''
  formData.allow_late = row.allow_late || ''
}
const handleConfirmEdit1 = async () => {
  try {
    // 只构建 API 需要的字段
    const reviewData = {
      score: Number(formData1.score) || 0,  // 转换为数字
      comment: formData1.comment || '',
      is_excellent: formData1.is_excellent || false
    }

    console.log('批改ID:', formData1.id)
    console.log('批改数据:', reviewData)

    // 调用更新 API
    await submissionAPI.review(Number(formData1.id), reviewData)

    ElMessage.success('批改成功')
    dialogFormVisible1.value = false  // 注意：应该是 dialogFormVisible1，不是 dialogFormVisible

    // 刷新数据
    await loadData()

  } catch (error) {

    ElMessage.error('批改失败')
  }
}
const handleConfirmEditStu = async () => {
  try {
    // 只构建 API 需要的字段
    const submitData = {
      homework_id: Number(formDataStu.id),  // 转换为数字
      content: formDataStu.content || '',
      file_url: formDataStu.file_url || ''
    }
    // 调用更新 API
    await submissionAPI.submit(submitData)

    ElMessage.success('提交成功')
    dialogFormVisibleStu.value = false  // 注意：应该是 dialogFormVisible1，不是 dialogFormVisible

    // 刷新数据
    await loadData()

  } catch (error) {

    ElMessage.error('批改失败')
  }
}
const handleConfirmEdit = async () => {
  try {
    // 构建更新数据
    const updateData = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      deadline: formData.deadline,
      allow_late: formData.allow_late
    }

    console.log('发送更新数据:', updateData)

    // 调用更新 API，传递 id 和 updateData
    await homeworkAPI.update(Number(formData.id), updateData)

    ElMessage.success('修改成功')
    dialogFormVisible.value = false

    // 刷新数据
    await loadData()

  } catch (error) {
    ElMessage.error('暂无权限修改其他学科作业')
  }
}
const handleDelete = async (index: number, row: any) => {
  try {
    await homeworkAPI.delete(row.id);  // 使用 row.id
    // 删除成功后的处理
    ElMessage.success('删除成功');
    loadData()
  } catch (error) {
    ElMessage.error('暂无权限删除其他学科作业');
  }
}




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

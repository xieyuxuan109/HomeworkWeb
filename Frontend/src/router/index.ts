import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 页面组件
import Login from '@/pages/Login.vue'
import Dashboard from '@/pages/Dashboard.vue'
import HomeworkDetail from '@/pages/HomeworkDetail.vue'
import PublishHomework from '@/pages/PublishHomework.vue'
import ReviewSubmission from '@/pages/ReviewSubmission.vue'
import ExcellentSubmissions from '@/pages/ExcellentSubmissions.vue'
import MySubmissions from '@/pages/MySubmissions.vue'
import Profile from '@/pages/Profile.vue'
import SubmitHomework from '@/pages/Submithomework.vue'


const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/homework/:id',
    name: 'HomeworkDetail',
    component: HomeworkDetail,
    meta: { requiresAuth: true },
  },
  {
    path: '/publish',
    name: 'PublishHomework',
    component: PublishHomework,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/excellent',
    name: 'ExcellentSubmissions',
    component: ExcellentSubmissions,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-submissions',
    name: 'MySubmissions',
    component: MySubmissions,
    meta: { requiresAuth: true, role: 'student' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/submithomework',
    name: 'submithomework',
    component: SubmitHomework,
    meta: { requiresAuth: true, role: 'student' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 恢复用户状态
  if (!userStore.token) {
    userStore.restoreFromStorage()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const requiredRole = to.meta.role as string | undefined

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (requiredRole && userStore.user?.role !== requiredRole) {
    next('/')
  } else {
    next()
  }
})

export default router

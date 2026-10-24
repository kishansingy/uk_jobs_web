import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        { path: '',        name: 'dashboard',    component: () => import('@/views/DashboardView.vue') },
        { path: 'users',   name: 'users',        component: () => import('@/views/UsersView.vue') },
        { path: 'jobs',    name: 'jobs',         component: () => import('@/views/JobsView.vue') },
        { path: 'sources', name: 'sources',      component: () => import('@/views/SourcesView.vue') },
        { path: 'videos',  name: 'videos',       component: () => import('@/views/VideosView.vue') },
        { path: 'plans',   name: 'plans',         component: () => import('@/views/PlansView.vue') },
        { path: 'reports', name: 'reports',       component: () => import('@/views/ReportsView.vue') },
        { path: 'notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
        { path: 'audit',         name: 'audit',         component: () => import('@/views/AuditLogView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.public) return true

  if (!auth.token) return { name: 'login' }

  if (!auth.user) await auth.fetchMe()

  if (to.meta.requiresAdmin && !auth.isAdmin) return { name: 'login' }

  return true
})

export default router

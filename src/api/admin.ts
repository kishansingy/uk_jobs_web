import api from './client'
import type { Paginated, User, Job, JobSource, DashboardStats, Video } from '@/types'

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Paginated<User> }>('/admin/users', { params }),

  show: (id: number) =>
    api.get<{ success: boolean; data: User }>(`/admin/users/${id}`),

  toggleActive: (id: number) =>
    api.patch(`/admin/users/${id}/toggle-active`),

  assignRole: (id: number, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const adminJobsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Paginated<Job> }>('/admin/jobs', { params }),

  update: (id: number, data: Partial<Job>) =>
    api.patch(`/admin/jobs/${id}`, data),

  reclassify: (id: number) =>
    api.post(`/admin/jobs/${id}/reclassify`),

  destroy: (id: number) =>
    api.delete(`/admin/jobs/${id}`),
}

// ── Job Sources ───────────────────────────────────────────────────────────────
export const sourcesApi = {
  list: () =>
    api.get<{ success: boolean; data: JobSource[] }>('/admin/sources'),

  store: (data: Partial<JobSource>) =>
    api.post('/admin/sources', data),

  update: (id: number, data: Partial<JobSource>) =>
    api.patch(`/admin/sources/${id}`, data),

  destroy: (id: number) =>
    api.delete(`/admin/sources/${id}`),

  triggerImport: (id: number) =>
    api.post(`/admin/sources/${id}/import`),

  logs: (id: number) =>
    api.get(`/admin/sources/${id}/logs`),
}
// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  dashboard: () =>
    api.get<{ success: boolean; data: DashboardStats }>('/admin/reports/dashboard'),

  usersByProfession: () =>
    api.get('/admin/reports/users-by-profession'),

  jobsByProfession: () =>
    api.get('/admin/reports/jobs-by-profession'),

  applicationStatuses: () =>
    api.get('/admin/reports/application-statuses'),

  subscriptionRevenue: () =>
    api.get('/admin/reports/subscription-revenue'),

  export: (params?: Record<string, unknown>) =>
    api.get('/admin/reports/export', { params, responseType: 'blob' }),
}

// ── Videos (content management) ──────────────────────────────────────────────
export const videosApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Video[] }>('/videos', { params }),

  show: (id: number) =>
    api.get<{ success: boolean; data: Video }>(`/videos/${id}`),

  categories: () =>
    api.get('/videos/categories'),
}

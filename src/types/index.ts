// ── Auth ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  country?: string
  active: boolean
  onboarding_completed: boolean
  roles: string[]
  created_at: string
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
export interface Job {
  id: number
  title: string
  organisation: string
  location: string
  salary_text?: string
  salary_min?: number
  salary_max?: number
  band?: string
  contract_type?: string
  employment_type?: string
  profession?: { id: number; name: string }
  specialty?: { id: number; name: string }
  status: 'active' | 'updated' | 'closing_soon' | 'expired' | 'removed'
  closing_date?: string
  published_date?: string
  source_url?: string
  description?: string
}

// ── Job Sources ───────────────────────────────────────────────────────────────
export interface JobSource {
  id: number
  name: string
  base_url: string
  source_identifier: string
  type: string
  active: boolean
  authorised: boolean
  fetch_interval_minutes?: number
  last_success_at?: string
  jobs_count?: number
}

// ── Plans ─────────────────────────────────────────────────────────────────────
export interface PlanFeature {
  feature_key: string
  feature_value: string
}

export interface Plan {
  id: number
  name: string
  slug: string
  description: string
  price_monthly: number
  price_annual: number
  currency: string
  active: boolean
  sort_order: number
  features: PlanFeature[]
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_users: number
  active_subscriptions: number
  total_jobs: number
  total_applications: number
  revenue_this_month: number
  new_users_this_week: number
}

// ── Videos ────────────────────────────────────────────────────────────────────
export interface VideoCategory {
  id: number
  name: string
  slug: string
}

export interface Video {
  id: number
  title: string
  description?: string
  url: string
  thumbnail_url?: string
  duration_seconds?: number
  category?: VideoCategory
  tags?: { id: number; name: string }[]
  is_premium: boolean
  published: boolean
  created_at: string
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// ── API Response ──────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

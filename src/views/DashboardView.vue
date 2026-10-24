<template>
  <div class="space-y-6">
    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard label="Total Users"        :value="stats?.total_users ?? '—'"           icon="👥" iconBg="bg-blue-50" />
      <StatCard label="Active Subs"        :value="stats?.active_subscriptions ?? '—'"  icon="💎" iconBg="bg-purple-50" />
      <StatCard label="Live Jobs"          :value="stats?.total_jobs ?? '—'"            icon="💼" iconBg="bg-green-50" />
      <StatCard label="Applications"       :value="stats?.total_applications ?? '—'"    icon="📋" iconBg="bg-amber-50" />
      <StatCard label="Revenue (month)"    :value="revenueFormatted"                    icon="£"  iconBg="bg-emerald-50" />
      <StatCard label="New Users (week)"   :value="stats?.new_users_this_week ?? '—'"  icon="🆕" iconBg="bg-sky-50" />
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Users by Profession</h3>
        <canvas ref="professionChartEl" height="220"></canvas>
      </div>
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Application Statuses</h3>
        <canvas ref="appStatusChartEl" height="220"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { reportsApi } from '@/api/admin'
import StatCard from '@/components/StatCard.vue'
import type { DashboardStats } from '@/types'

Chart.register(...registerables)

const stats              = ref<DashboardStats | null>(null)
const professionChartEl  = ref<HTMLCanvasElement | null>(null)
const appStatusChartEl   = ref<HTMLCanvasElement | null>(null)

const revenueFormatted = computed(() =>
  stats.value ? `£${stats.value.revenue_this_month.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—',
)

onMounted(async () => {
  try {
    const [dashRes, profRes, appRes] = await Promise.all([
      reportsApi.dashboard(),
      reportsApi.usersByProfession(),
      reportsApi.applicationStatuses(),
    ])
    stats.value = dashRes.data.data

    // Profession chart
    if (professionChartEl.value) {
      const prof = profRes.data.data as { profession: string; count: number }[]
      new Chart(professionChartEl.value, {
        type: 'bar',
        data: {
          labels: prof.map(p => p.profession),
          datasets: [{ label: 'Users', data: prof.map(p => p.count), backgroundColor: '#005EB8' }],
        },
        options: { responsive: true, plugins: { legend: { display: false } } },
      })
    }

    // App status chart
    if (appStatusChartEl.value) {
      const statuses = appRes.data.data as { status: string; count: number }[]
      new Chart(appStatusChartEl.value, {
        type: 'doughnut',
        data: {
          labels: statuses.map(s => s.status),
          datasets: [{
            data: statuses.map(s => s.count),
            backgroundColor: ['#005EB8', '#007F3B', '#FFB81C', '#CF101A', '#41B6E6'],
          }],
        },
        options: { responsive: true },
      })
    }
  } catch { /* stats stay null */ }
})
</script>

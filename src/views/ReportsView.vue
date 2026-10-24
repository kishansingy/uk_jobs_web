<template>
  <div class="space-y-6">
    <div class="flex justify-end">
      <button class="btn-secondary" @click="exportReport">⬇ Export CSV</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Jobs by Profession -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Jobs by Profession</h3>
        <canvas ref="jobsProfEl" height="260"></canvas>
      </div>

      <!-- Subscription Revenue -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Subscription Revenue</h3>
        <canvas ref="revenueEl" height="260"></canvas>
      </div>

      <!-- Users by Profession -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Users by Profession</h3>
        <canvas ref="usersProfEl" height="260"></canvas>
      </div>

      <!-- Application Statuses -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Application Statuses</h3>
        <canvas ref="appStatusEl" height="260"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { reportsApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'

Chart.register(...registerables)

const toast      = useToastStore()
const jobsProfEl = ref<HTMLCanvasElement | null>(null)
const revenueEl  = ref<HTMLCanvasElement | null>(null)
const usersProfEl = ref<HTMLCanvasElement | null>(null)
const appStatusEl = ref<HTMLCanvasElement | null>(null)

const UK_COLORS = ['#005EB8', '#CF101A', '#007F3B', '#FFB81C', '#41B6E6', '#8B4513', '#6B48FF', '#E91E8C']

function makeBar(canvas: HTMLCanvasElement, labels: string[], data: number[], label: string) {
  new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: UK_COLORS }] },
    options: { responsive: true, plugins: { legend: { display: false } } },
  })
}

function makeDoughnut(canvas: HTMLCanvasElement, labels: string[], data: number[]) {
  new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: UK_COLORS }] },
    options: { responsive: true },
  })
}

async function exportReport() {
  try {
    const res  = await reportsApi.export()
    const blob = new Blob([res.data as BlobPart], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'report.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch { toast.error('Export failed') }
}

onMounted(async () => {
  try {
    const [jobsProf, usersProf, appStatus, revenue] = await Promise.all([
      reportsApi.jobsByProfession(),
      reportsApi.usersByProfession(),
      reportsApi.applicationStatuses(),
      reportsApi.subscriptionRevenue(),
    ])

    if (jobsProfEl.value) {
      const d = jobsProf.data.data as { profession: string; count: number }[]
      makeBar(jobsProfEl.value, d.map(x => x.profession), d.map(x => x.count), 'Jobs')
    }
    if (usersProfEl.value) {
      const d = usersProf.data.data as { profession: string; count: number }[]
      makeBar(usersProfEl.value, d.map(x => x.profession), d.map(x => x.count), 'Users')
    }
    if (appStatusEl.value) {
      const d = appStatus.data.data as { status: string; count: number }[]
      makeDoughnut(appStatusEl.value, d.map(x => x.status), d.map(x => x.count))
    }
    if (revenueEl.value) {
      const d = revenue.data.data as { month: string; revenue: number }[]
      new Chart(revenueEl.value, {
        type: 'line',
        data: {
          labels: d.map(x => x.month),
          datasets: [{
            label: 'Revenue (£)',
            data: d.map(x => x.revenue),
            borderColor: '#005EB8',
            backgroundColor: 'rgba(0,94,184,0.1)',
            fill: true,
            tension: 0.3,
          }],
        },
        options: { responsive: true },
      })
    }
  } catch { toast.error('Failed to load report data') }
})
</script>

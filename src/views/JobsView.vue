<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="card !p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" class="input w-60" placeholder="Search title or organisation…" @input="loadJobs(1)" />
      <select v-model="statusFilter" class="input w-44" @change="loadJobs(1)">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="closing_soon">Closing Soon</option>
        <option value="expired">Expired</option>
        <option value="removed">Removed</option>
      </select>
    </div>

    <div class="card !p-0 overflow-hidden">
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th>Title</th><th>Organisation</th><th>Location</th><th>Band</th><th>Status</th><th>Closing</th><th class="text-right pr-4">Actions</th>
          </tr>
        </thead>
        <tbody v-if="!loading && jobs.length">
          <tr v-for="job in jobs" :key="job.id">
            <td class="font-medium max-w-xs truncate">{{ job.title }}</td>
            <td class="max-w-xs truncate">{{ job.organisation }}</td>
            <td>{{ job.location }}</td>
            <td>{{ job.band ?? '—' }}</td>
            <td><span :class="statusBadge(job.status)">{{ job.status }}</span></td>
            <td>{{ job.closing_date ? formatDate(job.closing_date) : '—' }}</td>
            <td class="text-right pr-4 space-x-2">
              <a
                v-if="job.source_url"
                :href="job.source_url"
                target="_blank"
                rel="noopener"
                class="text-xs text-nhs-blue hover:underline"
              >View</a>
              <button class="text-xs text-nhs-blue hover:underline" @click="reclassify(job)">Reclassify</button>
              <button class="text-xs text-nhs-red hover:underline"  @click="confirmDelete(job)">Delete</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr><td colspan="7" class="text-center py-10 text-gray-400">Loading…</td></tr>
        </tbody>
        <tbody v-else>
          <tr><td colspan="7" class="text-center py-10 text-gray-400">No jobs found.</td></tr>
        </tbody>
      </table>
      <div class="px-4 border-t border-gray-100">
        <AppPagination :current="page" :total="lastPage" @change="loadJobs" />
      </div>
    </div>

    <ConfirmModal
      v-if="deleteTarget"
      title="Delete Job"
      :message="`Delete &quot;${deleteTarget.title}&quot;? This cannot be undone.`"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminJobsApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'
import AppPagination from '@/components/AppPagination.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { Job } from '@/types'

const toast        = useToastStore()
const jobs         = ref<Job[]>([])
const loading      = ref(false)
const page         = ref(1)
const lastPage     = ref(1)
const search       = ref('')
const statusFilter = ref('')
const deleteTarget = ref<Job | null>(null)

async function loadJobs(p = 1) {
  loading.value = true
  page.value    = p
  try {
    const res = await adminJobsApi.list({
      page:   p,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
    })
    const payload  = res.data.data
    jobs.value     = payload.data      ?? []
    lastPage.value = payload.last_page ?? payload.meta?.last_page ?? 1
  } catch { toast.error('Failed to load jobs') }
  finally { loading.value = false }
}

async function reclassify(job: Job) {
  try {
    await adminJobsApi.reclassify(job.id)
    toast.success('Reclassification triggered')
  } catch { toast.error('Failed to reclassify') }
}

function confirmDelete(job: Job) { deleteTarget.value = job }

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await adminJobsApi.destroy(deleteTarget.value.id)
    jobs.value     = jobs.value.filter(j => j.id !== deleteTarget.value!.id)
    toast.success('Job deleted')
  } catch { toast.error('Failed to delete job') }
  finally { deleteTarget.value = null }
}

const statusBadge = (s: string) => ({
  active:       'badge-green',
  closing_soon: 'badge-amber',
  expired:      'badge-gray',
  removed:      'badge-red',
  updated:      'badge-blue',
}[s] ?? 'badge-gray')

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(() => loadJobs())
</script>

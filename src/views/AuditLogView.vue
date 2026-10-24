<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="card !p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" class="input w-60" placeholder="Search action or user…" @input="load(1)" />
      <select v-model="actionFilter" class="input w-52" @change="load(1)">
        <option value="">All actions</option>
        <option value="subscription.created">subscription.created</option>
        <option value="subscription.cancelled">subscription.cancelled</option>
        <option value="user.login">user.login</option>
        <option value="job.deleted">job.deleted</option>
        <option value="source.import">source.import</option>
      </select>
      <input v-model="dateFrom" type="date" class="input w-40" @change="load(1)" />
      <span class="text-gray-400 text-sm">to</span>
      <input v-model="dateTo" type="date" class="input w-40" @change="load(1)" />
    </div>

    <div class="card !p-0 overflow-hidden">
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th>Timestamp</th><th>Action</th><th>User</th><th>IP</th><th>Details</th>
          </tr>
        </thead>
        <tbody v-if="!loading && logs.length">
          <tr v-for="log in logs" :key="log.id">
            <td class="text-xs text-gray-500 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
            <td>
              <span class="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{{ log.action }}</span>
            </td>
            <td>
              <p class="text-sm font-medium">{{ log.user_name ?? '—' }}</p>
              <p class="text-xs text-gray-400">{{ log.user_email ?? '' }}</p>
            </td>
            <td class="text-xs text-gray-500 font-mono">{{ log.ip_address ?? '—' }}</td>
            <td>
              <button
                v-if="log.metadata"
                class="text-xs text-nhs-blue hover:underline"
                @click="viewDetail(log)"
              >View</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr><td colspan="5" class="text-center py-10 text-gray-400">Loading…</td></tr>
        </tbody>
        <tbody v-else>
          <tr><td colspan="5" class="text-center py-10 text-gray-400">No audit logs found.</td></tr>
        </tbody>
      </table>
      <div class="px-4 border-t border-gray-100">
        <AppPagination :current="page" :total="lastPage" @change="load" />
      </div>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div v-if="detail" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="detail = null">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">{{ detail.action }}</h3>
            <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="detail = null">✕</button>
          </div>
          <pre class="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">{{ JSON.stringify(detail.metadata, null, 2) }}</pre>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/client'
import { useToastStore } from '@/stores/toast'
import AppPagination from '@/components/AppPagination.vue'

interface AuditLog {
  id: number; action: string; created_at: string
  user_name?: string; user_email?: string; ip_address?: string
  metadata?: Record<string, unknown>
}

const toast        = useToastStore()
const logs         = ref<AuditLog[]>([])
const loading      = ref(false)
const page         = ref(1)
const lastPage     = ref(1)
const search       = ref('')
const actionFilter = ref('')
const dateFrom     = ref('')
const dateTo       = ref('')
const detail       = ref<AuditLog | null>(null)

async function load(p = 1) {
  loading.value = true
  page.value    = p
  try {
    const res = await api.get('/admin/audit-logs', {
      params: {
        page:   p,
        search: search.value || undefined,
        action: actionFilter.value || undefined,
        from:   dateFrom.value || undefined,
        to:     dateTo.value || undefined,
      },
    })
    logs.value     = res.data.data.data
    lastPage.value = res.data.data.last_page
  } catch { toast.error('Failed to load audit logs') }
  finally { loading.value = false }
}

function viewDetail(log: AuditLog) { detail.value = log }

const formatDate = (d: string) => new Date(d).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

onMounted(() => load())
</script>

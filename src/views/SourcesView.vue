<template>
  <div class="space-y-4">
    <div class="flex justify-end">
      <button class="btn-primary" @click="openModal()">+ Add Source</button>
    </div>

    <div class="card !p-0 overflow-hidden">
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th>Name</th><th>URL</th><th>Type</th><th>Status</th><th>Last Import</th><th>Jobs</th><th class="text-right pr-4">Actions</th>
          </tr>
        </thead>
        <tbody v-if="!loading && sources.length">
          <tr v-for="source in sources" :key="source.id">
            <td class="font-medium">{{ source.name }}</td>
            <td class="max-w-xs truncate text-gray-500 text-xs">{{ source.base_url }}</td>
            <td><span class="badge-blue">{{ source.type }}</span></td>
            <td><span :class="source.active ? 'badge-green' : 'badge-gray'">{{ source.active ? 'Active' : 'Paused' }}</span></td>
            <td>{{ source.last_success_at ? formatDate(source.last_success_at) : '—' }}</td>
            <td>{{ source.jobs_count ?? '—' }}</td>
            <td class="text-right pr-4 space-x-2">
              <button class="text-xs text-nhs-green font-medium hover:underline" @click="triggerImport(source)">Import</button>
              <button class="text-xs text-gray-500 hover:underline" @click="viewLogs(source)">Logs</button>
              <button class="text-xs text-nhs-blue hover:underline" @click="openModal(source)">Edit</button>
              <button class="text-xs text-nhs-red hover:underline" @click="confirmDelete(source)">Delete</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="loading">
          <tr><td colspan="7" class="text-center py-10 text-gray-400">Loading…</td></tr>
        </tbody>
        <tbody v-else>
          <tr><td colspan="7" class="text-center py-10 text-gray-400">No sources configured.</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="showModal = false">
        <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
          <h3 class="text-lg font-semibold mb-5">{{ editing ? 'Edit Source' : 'Add Job Source' }}</h3>
          <form class="space-y-4" @submit.prevent="saveSource">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model="form.name" class="input" required placeholder="NHS Jobs" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input v-model="form.base_url" class="input" required type="url" placeholder="https://…" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select v-model="form.type" class="input">
                <option value="nhs_jobs">NHS Jobs (Public API)</option>
                <option value="api">API</option>
                <option value="xml">XML</option>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="partner_feed">Partner Feed</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input id="active-toggle" v-model="form.active" type="checkbox" class="rounded" />
              <label for="active-toggle" class="text-sm text-gray-700">Active</label>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fetch Interval (minutes)</label>
              <input v-model.number="form.fetch_interval_minutes" class="input w-32" type="number" min="1" max="1440" placeholder="5" />
              <p class="text-xs text-gray-400 mt-1">How often to pull new jobs. Min 1 min. Default 5.</p>
            </div>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn-secondary" @click="showModal = false">Cancel</button>
              <button type="submit" class="btn-primary">{{ editing ? 'Save' : 'Add' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <ConfirmModal
      v-if="deleteTarget"
      title="Remove Source"
      :message="`Remove &quot;${deleteTarget.name}&quot;?`"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Import Logs Modal -->
    <Teleport to="body">
      <div v-if="showLogs" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="showLogs = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold">Import Logs — {{ logsSource?.name }}</h3>
            <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="showLogs = false">✕</button>
          </div>
          <div class="overflow-y-auto flex-1 p-4 space-y-2">
            <div v-if="logsLoading" class="text-center py-10 text-gray-400">Loading…</div>
            <div v-else-if="importLogs.length === 0" class="text-center py-10 text-gray-400">No import logs yet.</div>
            <div
              v-for="log in importLogs"
              :key="log.id"
              class="border border-gray-100 rounded-lg p-3 flex items-start gap-3"
            >
              <span :class="log.status === 'success' ? 'text-nhs-green' : 'text-nhs-red'" class="text-lg flex-shrink-0 mt-0.5">
                {{ log.status === 'success' ? '✓' : '✕' }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                  <span :class="log.status === 'success' ? 'badge-green' : 'badge-red'" class="text-xs capitalize">{{ log.status }}</span>
                  <span class="text-xs text-gray-400">{{ formatDate(log.created_at) }}</span>
                  <span v-if="log.jobs_imported" class="text-xs text-gray-500">{{ log.jobs_imported }} jobs imported</span>
                </div>
                <p v-if="log.message" class="text-xs text-gray-600 mt-1 font-mono">{{ log.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sourcesApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import type { JobSource } from '@/types'

const toast        = useToastStore()
const sources      = ref<JobSource[]>([])
const loading      = ref(false)
const showModal    = ref(false)
const editing      = ref<JobSource | null>(null)
const deleteTarget = ref<JobSource | null>(null)
const showLogs     = ref(false)
const logsSource   = ref<JobSource | null>(null)
const importLogs   = ref<{ id: number; status: string; message?: string; jobs_imported?: number; created_at: string }[]>([])
const logsLoading  = ref(false)
const form         = ref({ name: '', base_url: '', type: 'nhs_jobs', active: true, fetch_interval_minutes: 5 })

async function loadSources() {
  loading.value = true
  try {
    const res = await sourcesApi.list()
    sources.value = res.data.data
  } catch { toast.error('Failed to load sources') }
  finally { loading.value = false }
}

function openModal(source?: JobSource) {
  editing.value = source ?? null
  form.value = source
    ? { name: source.name, base_url: source.base_url, type: source.type, active: source.active, fetch_interval_minutes: source.fetch_interval_minutes ?? 5 }
    : { name: '', base_url: '', type: 'nhs_jobs', active: true, fetch_interval_minutes: 5 }
  showModal.value = true
}

async function saveSource() {
  try {
    if (editing.value) {
      await sourcesApi.update(editing.value.id, form.value)
      toast.success('Source updated')
    } else {
      await sourcesApi.store(form.value)
      toast.success('Source added')
    }
    showModal.value = false
    await loadSources()
  } catch { toast.error('Failed to save source') }
}

async function triggerImport(source: JobSource) {
  try {
    await sourcesApi.triggerImport(source.id)
    toast.success(`Import triggered for ${source.name}`)
  } catch { toast.error('Import failed') }
}

async function viewLogs(source: JobSource) {
  logsSource.value  = source
  showLogs.value    = true
  logsLoading.value = true
  importLogs.value  = []
  try {
    const res       = await sourcesApi.logs(source.id)
    importLogs.value = res.data.data
  } catch { toast.error('Failed to load logs') }
  finally { logsLoading.value = false }
}

function confirmDelete(source: JobSource) { deleteTarget.value = source }

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    await sourcesApi.destroy(deleteTarget.value.id)
    sources.value = sources.value.filter(s => s.id !== deleteTarget.value!.id)
    toast.success('Source removed')
  } catch { toast.error('Failed to remove source') }
  finally { deleteTarget.value = null }
}

const formatDate = (d: string) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(() => loadSources())
</script>

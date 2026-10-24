<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Compose panel -->
      <div class="card space-y-4">
        <h3 class="text-base font-semibold text-gray-800">Send Notification</h3>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Audience</label>
          <select v-model="form.audience" class="input">
            <option value="all">All users</option>
            <option value="free">Free plan users only</option>
            <option value="pro">Pro subscribers</option>
            <option value="premium">Premium subscribers</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input v-model="form.title" class="input" maxlength="80" placeholder="New jobs matching your profile!" />
          <p class="text-xs text-gray-400 mt-1 text-right">{{ form.title.length }}/80</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea v-model="form.body" class="input h-24 resize-none" maxlength="200" placeholder="We found 12 new NHS nursing roles in London…" />
          <p class="text-xs text-gray-400 mt-1 text-right">{{ form.body.length }}/200</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deep link (optional)</label>
          <input v-model="form.deep_link" class="input" placeholder="e.g. /jobs or /tools/cv" />
        </div>

        <!-- Preview -->
        <div class="bg-gray-900 rounded-2xl p-4 text-white">
          <p class="text-xs text-gray-400 mb-2">Preview</p>
          <div class="bg-white/10 rounded-xl p-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">🏥</span>
              <p class="text-xs font-semibold text-gray-300">UK Medical Jobs</p>
            </div>
            <p class="text-sm font-semibold">{{ form.title || 'Notification title' }}</p>
            <p class="text-xs text-gray-300 mt-0.5">{{ form.body || 'Notification body text…' }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button class="btn-secondary" @click="resetForm">Clear</button>
          <button class="btn-primary !w-auto px-6" :disabled="!form.title || !form.body || sending" @click="confirmSend">
            {{ sending ? 'Sending…' : `Send to ${audienceLabel}` }}
          </button>
        </div>
      </div>

      <!-- History panel -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-800 mb-4">Recent Broadcasts</h3>
        <div v-if="history.length === 0" class="text-center py-10 text-gray-400 text-sm">No broadcasts sent yet.</div>
        <div v-else class="space-y-3">
          <div
            v-for="item in history"
            :key="item.id"
            class="border border-gray-100 rounded-lg p-3"
          >
            <div class="flex justify-between items-start gap-2 mb-1">
              <p class="text-sm font-semibold text-gray-900">{{ item.title }}</p>
              <span class="badge-gray text-xs flex-shrink-0">{{ item.audience }}</span>
            </div>
            <p class="text-xs text-gray-600 line-clamp-2">{{ item.body }}</p>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>{{ formatDate(item.sent_at) }}</span>
              <span v-if="item.sent_count">· {{ item.sent_count.toLocaleString() }} sent</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm modal -->
    <ConfirmModal
      v-if="showConfirm"
      title="Send Notification"
      :message="`Send &quot;${form.title}&quot; to ${audienceLabel}? This cannot be undone.`"
      confirm-label="Send"
      @confirm="send"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import api from '@/api/client'

interface BroadcastHistory {
  id: number; title: string; body: string; audience: string; sent_at: string; sent_count?: number
}

const toast       = useToastStore()
const sending     = ref(false)
const showConfirm = ref(false)
const history     = ref<BroadcastHistory[]>([])

const form = ref({
  audience:  'all',
  title:     '',
  body:      '',
  deep_link: '',
})

const audienceMap: Record<string, string> = {
  all:     'All Users',
  free:    'Free Users',
  pro:     'Pro Subscribers',
  premium: 'Premium Subscribers',
}

const audienceLabel = computed(() => audienceMap[form.value.audience] ?? 'All Users')

function confirmSend() { showConfirm.value = true }

async function send() {
  showConfirm.value = false
  sending.value     = true
  try {
    await api.post('/admin/notifications/broadcast', {
      audience:  form.value.audience,
      title:     form.value.title,
      body:      form.value.body,
      deep_link: form.value.deep_link || undefined,
    })
    toast.success('Notification sent successfully')
    history.value.unshift({
      id:        Date.now(),
      title:     form.value.title,
      body:      form.value.body,
      audience:  audienceLabel.value,
      sent_at:   new Date().toISOString(),
    })
    resetForm()
  } catch { toast.error('Failed to send notification') }
  finally { sending.value = false }
}

function resetForm() {
  form.value = { audience: 'all', title: '', body: '', deep_link: '' }
}

const formatDate = (d: string) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
</script>

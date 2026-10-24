<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="user" class="fixed inset-0 z-40 flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" @click="$emit('close')" />

        <!-- Panel -->
        <div class="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="bg-nhs-blue px-6 py-5 flex items-center gap-4 flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {{ initials }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-bold text-lg truncate">{{ user.name }}</p>
              <p class="text-blue-200 text-sm truncate">{{ user.email }}</p>
            </div>
            <button class="text-white/70 hover:text-white text-2xl" @click="$emit('close')">✕</button>
          </div>

          <div class="p-6 space-y-6 flex-1">
            <!-- Status & role -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Status</p>
                <span :class="user.active ? 'badge-green' : 'badge-red'">{{ user.active ? 'Active' : 'Inactive' }}</span>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Role</p>
                <span :class="user.roles?.includes('admin') ? 'badge-blue' : 'badge-gray'">
                  {{ user.roles?.[0] ?? 'candidate' }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Country</p>
                <p class="text-sm font-medium">{{ user.country ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Phone</p>
                <p class="text-sm font-medium">{{ user.phone ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Joined</p>
                <p class="text-sm font-medium">{{ formatDate(user.created_at) }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Onboarding</p>
                <span :class="user.onboarding_completed ? 'badge-green' : 'badge-amber'">
                  {{ user.onboarding_completed ? 'Complete' : 'Pending' }}
                </span>
              </div>
            </div>

            <!-- Subscription -->
            <div v-if="loading" class="text-center py-4 text-gray-400 text-sm">Loading subscription…</div>
            <div v-else>
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Subscription</p>
              <div v-if="subscription" class="card !p-4 space-y-2">
                <div class="flex justify-between items-center">
                  <p class="font-semibold text-gray-900">{{ subscription.plan_name }}</p>
                  <span :class="subscription.status === 'active' ? 'badge-green' : 'badge-gray'">
                    {{ subscription.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 capitalize">{{ subscription.billing_period }} · {{ subscription.provider }}</p>
                <p class="text-xs text-gray-400">Started {{ formatDate(subscription.starts_at) }}</p>
              </div>
              <div v-else class="card !p-4 text-center text-sm text-gray-400">Free plan — no active subscription</div>
            </div>

            <!-- Actions -->
            <div class="space-y-2">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Actions</p>
              <div class="flex gap-2 flex-wrap">
                <button class="btn-secondary text-xs !w-auto px-4" @click="$emit('toggle-active', user)">
                  {{ user.active ? 'Deactivate User' : 'Activate User' }}
                </button>
                <button
                  v-if="!user.roles?.includes('admin')"
                  class="btn-secondary text-xs !w-auto px-4"
                  @click="$emit('assign-role', user, 'admin')"
                >Make Admin</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import api from '@/api/client'
import type { User } from '@/types'

const props = defineProps<{ user: User | null }>()
defineEmits<{
  (e: 'close'): void
  (e: 'toggle-active', user: User): void
  (e: 'assign-role', user: User, role: string): void
}>()

interface SubInfo { plan_name: string; status: string; billing_period: string; provider: string; starts_at: string }

const subscription = ref<SubInfo | null>(null)
const loading      = ref(false)

const initials = computed(() =>
  props.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '??',
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

watch(() => props.user, async (u) => {
  subscription.value = null
  if (!u) return
  loading.value = true
  try {
    const res        = await api.get(`/admin/users/${u.id}`)
    subscription.value = res.data.data?.active_subscription ?? null
  } catch { /* ignore */ }
  finally { loading.value = false }
})
</script>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: all 0.3s ease; }
.drawer-enter-from .relative, .drawer-leave-to .relative { transform: translateX(100%); }
.drawer-enter-from .absolute, .drawer-leave-to .absolute { opacity: 0; }
</style>

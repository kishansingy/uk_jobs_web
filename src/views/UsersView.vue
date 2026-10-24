<template>
  <div class="space-y-4">
    <div class="card !p-4 flex flex-wrap gap-3 items-center">
      <input v-model="search" class="input w-60" placeholder="Search name or email" @input="loadUsers(1)" />
      <select v-model="roleFilter" class="input w-40" @change="loadUsers(1)">
        <option value="">All roles</option>
        <option value="admin">Admin</option>
        <option value="candidate">Candidate</option>
      </select>
      <select v-model="activeFilter" class="input w-36" @change="loadUsers(1)">
        <option value="">All status</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    </div>
    <div class="card !p-0 overflow-hidden">
      <table class="table-auto w-full">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Country</th><th>Status</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr><td colspan="7" class="text-center py-10 text-gray-400">Loading</td></tr>
        </tbody>
        <tbody v-else-if="rows.length === 0">
          <tr><td colspan="7" class="text-center py-10 text-gray-400">No users found.</td></tr>
        </tbody>
        <tbody v-else>
          <tr v-for="row in rows" :key="row.id">
            <td class="font-medium">{{ row.name }}</td>
            <td>{{ row.email }}</td>
            <td><span :class="row.roles.includes('admin') || row.roles.includes('super-admin') ? 'badge-blue' : 'badge-gray'">{{ row.roles[0] ?? 'candidate' }}</span></td>
            <td>{{ row.country ?? '—' }}</td>
            <td><span :class="row.active ? 'badge-green' : 'badge-red'">{{ row.active ? 'Active' : 'Inactive' }}</span></td>
            <td>{{ formatDate(row.created_at) }}</td>
            <td class="text-right pr-4">
              <button class="text-xs text-nhs-blue hover:underline mr-3" @click="selectedUser = row">View</button>
              <button class="text-xs text-gray-400 hover:underline" @click="toggleActive(row)">{{ row.active ? 'Deactivate' : 'Activate' }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="px-4 border-t border-gray-100">
        <AppPagination :current="page" :total="lastPage" @change="loadUsers" />
      </div>
    </div>
    <UserDetailDrawer :user="selectedUser" @close="selectedUser = null" @toggle-active="toggleActive" @assign-role="assignRole" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { usersApi } from '@/api/admin'
import { useToastStore } from '@/stores/toast'
import { useDebounce } from '@/composables/useDebounce'
import AppPagination from '@/components/AppPagination.vue'
import UserDetailDrawer from '@/components/UserDetailDrawer.vue'
import type { User } from '@/types'

const toast = useToastStore()
const rows = ref<User[]>([])
const loading = ref(false)
const page = ref(1)
const lastPage = ref(1)
const search = ref('')
const roleFilter = ref('')
const activeFilter = ref('')
const selectedUser = ref<User | null>(null)
const debouncedSearch = useDebounce(search, 350)
watch(debouncedSearch, () => loadUsers(1))

async function loadUsers(p = 1) {
  loading.value = true
  page.value = p
  try {
    const res = await usersApi.list({ page: p, search: search.value || undefined, role: roleFilter.value || undefined, active: activeFilter.value !== '' ? activeFilter.value : undefined })
    rows.value = res.data.data.data
    lastPage.value = res.data.data.last_page
  } catch {
    toast.error('Failed to load users')
  } finally {
    loading.value = false
  }
}

async function toggleActive(u: User) {
  try {
    await usersApi.toggleActive(u.id)
    u.active = !u.active
    toast.success(`User ${u.active ? 'activated' : 'deactivated'}`)
  } catch { toast.error('Failed to update user') }
}

async function assignRole(u: User, role: string) {
  try {
    await usersApi.assignRole(u.id, role)
    toast.success(`Role updated to ${role}`)
    await loadUsers(page.value)
    selectedUser.value = null
  } catch { toast.error('Failed to assign role') }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => loadUsers())
</script>

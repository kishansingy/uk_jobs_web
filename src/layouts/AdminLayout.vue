<template>
  <div class="flex h-screen overflow-hidden bg-nhs-warm">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-nhs-blue flex flex-col">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-nhs-blue-dark">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🏥</span>
          <div>
            <p class="text-white font-bold text-sm leading-tight">UK Medical Jobs</p>
            <p class="text-blue-200 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
          :class="isActive(item.to)
            ? 'bg-white/20 text-white'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'"
        >
          <span class="text-base">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User footer -->
      <div class="px-4 py-4 border-t border-nhs-blue-dark">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-xs font-medium truncate">{{ auth.user?.name }}</p>
            <p class="text-blue-200 text-xs truncate">{{ auth.user?.email }}</p>
          </div>
          <button class="text-blue-200 hover:text-white text-xs" @click="handleLogout">Out</button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h1 class="text-xl font-semibold text-gray-900">{{ currentTitle }}</h1>
        <div class="flex items-center gap-2">
          <span class="badge-blue">Admin</span>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>

    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppToast from '@/components/AppToast.vue'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

const navItems = [
  { name: 'dashboard',     label: 'Dashboard',    icon: '📊', to: '/'             },
  { name: 'users',         label: 'Users',        icon: '👥', to: '/users'        },
  { name: 'jobs',          label: 'Jobs',         icon: '💼', to: '/jobs'         },
  { name: 'sources',       label: 'Job Sources',  icon: '🔗', to: '/sources'      },
  { name: 'videos',        label: 'Videos',       icon: '🎬', to: '/videos'       },
  { name: 'plans',         label: 'Plans',        icon: '💎', to: '/plans'        },
  { name: 'notifications', label: 'Broadcasts',   icon: '📣', to: '/notifications'},
  { name: 'audit',         label: 'Audit Log',    icon: '🔍', to: '/audit'        },
  { name: 'reports',       label: 'Reports',      icon: '📈', to: '/reports'      },
]

const titleMap: Record<string, string> = {
  dashboard:     'Dashboard',
  users:         'User Management',
  jobs:          'Job Management',
  sources:       'Job Sources',
  videos:        'Video Library',
  plans:         'Subscription Plans',
  notifications: 'Push Notifications',
  audit:         'Audit Log',
  reports:       'Reports & Analytics',
}

const currentTitle = computed(() => titleMap[route.name as string] ?? 'Admin')
const initials     = computed(() => auth.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'AD')

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to)

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

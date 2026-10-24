<template>
  <div class="min-h-screen bg-nhs-blue flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🏥</div>
          <h1 class="text-2xl font-bold text-gray-900">UK Medical Jobs</h1>
          <p class="text-gray-500 text-sm mt-1">Admin Portal</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              autocomplete="username"
              class="input"
              placeholder="admin@ukmedicaljobs.co.uk"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="form.password"
              type="password"
              required
              autocomplete="current-password"
              class="input"
              placeholder="••••••••"
            />
          </div>

          <p v-if="error" class="text-nhs-red text-sm">{{ error }}</p>

          <button type="submit" class="btn-primary w-full py-2.5" :disabled="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>

      <p class="text-center text-blue-200 text-xs mt-6">Admin access only</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth    = useAuthStore()
const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const form    = ref({ email: '', password: '' })

async function handleLogin() {
  loading.value = true
  error.value   = ''
  try {
    await auth.login(form.value.email, form.value.password)
    if (!auth.isAdmin) {
      error.value = 'Admin access required.'
      auth.logout()
      return
    }
    router.push('/')
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    error.value = err.response?.data?.message ?? 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}
</script>

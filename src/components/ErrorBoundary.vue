<template>
  <slot v-if="!error" />
  <div v-else class="card text-center py-12 space-y-3">
    <p class="text-4xl">⚠️</p>
    <p class="font-semibold text-gray-800">Something went wrong</p>
    <p class="text-sm text-gray-500">{{ message }}</p>
    <p v-if="errorDetail" class="text-xs text-red-500 font-mono mt-1 px-4">{{ errorDetail }}</p>
    <button class="btn-secondary !w-auto px-6 mx-auto" @click="reset">Try again</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

withDefaults(defineProps<{ message?: string }>(), {
  message: 'An unexpected error occurred. Please refresh or try again.',
})

const error = ref(false)
const errorDetail = ref('')

onErrorCaptured((err) => {
  error.value = true
  errorDetail.value = err instanceof Error ? err.message : String(err)
  console.error('[ErrorBoundary]', err)
  return false
})

function reset() { error.value = false; errorDetail.value = '' }
</script>

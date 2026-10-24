<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-sm text-white cursor-pointer"
          :class="{
            'bg-nhs-green':  toast.type === 'success',
            'bg-nhs-red':    toast.type === 'error',
            'bg-nhs-blue':   toast.type === 'info',
          }"
          @click="toastStore.remove(toast.id)"
        >
          <span class="text-lg leading-none">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
const toastStore = useToastStore()
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(1rem); }
.toast-leave-to   { opacity: 0; transform: translateX(1rem); }
</style>

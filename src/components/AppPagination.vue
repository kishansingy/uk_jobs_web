<template>
  <div class="flex items-center justify-between py-3 text-sm text-gray-600">
    <span>Page {{ current }} of {{ total }}</span>
    <div class="flex gap-2">
      <button
        class="btn-secondary px-3 py-1 text-xs"
        :disabled="current <= 1"
        @click="$emit('change', current - 1)"
      >← Prev</button>
      <button
        class="btn-secondary px-3 py-1 text-xs"
        :disabled="current >= total"
        @click="$emit('change', current + 1)"
      >Next →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ current: number; total: number }>()
defineEmits<{ (e: 'change', page: number): void }>()
</script>

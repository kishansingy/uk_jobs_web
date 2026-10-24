<template>
  <div class="card flex items-center gap-4">
    <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl" :class="iconBg">
      {{ icon }}
    </div>
    <div>
      <p class="text-sm text-gray-500">{{ label }}</p>
      <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  value: string | number
  icon?: string
  iconBg?: string
}>(), {
  icon:   '📊',
  iconBg: 'bg-blue-50',
})
</script>

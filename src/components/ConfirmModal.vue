<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-black/40" @click.self="$emit('cancel')">
      <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button class="btn-secondary" @click="$emit('cancel')">Cancel</button>
          <button class="btn-danger"    @click="$emit('confirm')">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
  confirmLabel?: string
}>(), {
  title:        'Are you sure?',
  message:      'This action cannot be undone.',
  confirmLabel: 'Confirm',
})
defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>()
</script>

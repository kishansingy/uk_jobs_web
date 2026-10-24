<template>
  <ErrorBoundary :key="route.fullPath">
    <RouterView />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const route = useRoute()
</script>

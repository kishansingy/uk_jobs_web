<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="card border-2"
        :class="plan.slug === 'pro' ? 'border-nhs-blue' : 'border-transparent'"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <p class="text-xl font-bold text-gray-900">{{ plan.name }}</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ plan.description }}</p>
          </div>
          <span :class="plan.active ? 'badge-green' : 'badge-gray'">
            {{ plan.active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-gray-900">
              {{ plan.price_monthly === 0 ? 'Free' : `£${plan.price_monthly}` }}
            </p>
            <p class="text-xs text-gray-500">per month</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-2xl font-bold text-gray-900">
              {{ plan.price_annual === 0 ? '—' : `£${plan.price_annual}` }}
            </p>
            <p class="text-xs text-gray-500">per year</p>
          </div>
        </div>

        <table class="w-full text-sm">
          <tbody>
            <tr v-for="f in plan.features" :key="f.feature_key" class="border-t border-gray-100">
              <td class="py-1.5 text-gray-600">{{ formatFeatureKey(f.feature_key) }}</td>
              <td class="py-1.5 text-right font-medium">
                <span :class="featureValueClass(f.feature_value)">{{ formatFeatureValue(f.feature_value) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-xs text-gray-400">Plans are configured in the backend seeder. Stripe price IDs are set via environment variables.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { plansApi } from '@/api/plans'
import type { Plan } from '@/types'

const plans = ref<Plan[]>([])

const formatFeatureKey = (k: string) =>
  k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatFeatureValue = (v: string) => {
  if (v === 'true') return '✓'
  if (v === 'false') return '✕'
  if (v === 'unlimited') return 'Unlimited'
  if (v === 'full') return 'Full'
  if (v === 'basic') return 'Basic'
  if (v === 'limited') return 'Limited'
  return v
}

const featureValueClass = (v: string) => {
  if (v === 'true' || v === 'full' || v === 'unlimited') return 'text-nhs-green font-semibold'
  if (v === 'false') return 'text-gray-300'
  return 'text-gray-700'
}

onMounted(async () => {
  const res = await plansApi.list()
  plans.value = res.data.data
})
</script>

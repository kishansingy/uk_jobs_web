import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

interface Toast { id: number; message: string; type: ToastType }

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let next = 0

  function add(message: string, type: ToastType = 'info', duration = 3500) {
    const id = ++next
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (msg: string) => add(msg, 'success')
  const error   = (msg: string) => add(msg, 'error')
  const info    = (msg: string) => add(msg, 'info')

  return { toasts, success, error, info, remove }
})

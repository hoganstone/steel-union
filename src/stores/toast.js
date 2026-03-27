import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 1

  function showToast(message, type = 'info') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 3000)
  }

  function removeToast(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  return { toasts, showToast, removeToast }
})

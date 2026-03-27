<script setup>
import { computed, onMounted } from 'vue'
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast.js'

const toastStore = useToastStore()

function typeClasses(type) {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white'
    case 'error':
      return 'bg-red-600 text-white'
    case 'info':
    default:
      return 'bg-blue-600 text-white'
  }
}

function TypeIcon(type) {
  switch (type) {
    case 'success': return CheckCircle
    case 'error': return XCircle
    default: return Info
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <TransitionGroup
        name="toast"
        tag="div"
        class="flex flex-col gap-3"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          :class="['flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-64 max-w-sm pointer-events-auto', typeClasses(toast.type)]"
        >
          <component :is="TypeIcon(toast.type)" class="w-5 h-5 shrink-0" />
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            @click="toastStore.removeToast(toast.id)"
            class="opacity-75 hover:opacity-100 transition-opacity"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

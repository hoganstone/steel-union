<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { HardHat, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = '請輸入帳號與密碼'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await authStore.login(email.value, password.value)
    if (res.success) {
      const redirect = route.query.redirect || '/admin/products'
      router.push(redirect)
    } else {
      error.value = res.message || '登入失敗，請確認帳號密碼'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#1a252f] via-[#2c3e50] to-[#34495e] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[#8b6d4b] rounded-2xl mb-4 shadow-lg">
          <HardHat class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-white mb-1">鐵鋼工會</h1>
        <p class="text-gray-400 text-sm">後台管理系統</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <h2 class="text-2xl font-bold text-[#2c3e50] mb-6">管理員登入</h2>

        <!-- Error Message -->
        <div v-if="error" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">電子郵件</label>
            <input
              v-model="email"
              type="email"
              placeholder="請輸入管理員信箱"
              autocomplete="username"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密碼</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入密碼"
                autocomplete="current-password"
                class="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all"
                :disabled="loading"
                @keyup.enter="handleLogin"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-3.5 px-6 rounded-xl font-bold text-base transition-colors"
          >
            {{ loading ? '登入中...' : '登入' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <RouterLink to="/" class="text-sm text-gray-400 hover:text-[#8b6d4b] transition-colors">
            ← 返回前台
          </RouterLink>
        </div>
      </div>

      <p class="text-center text-gray-500 text-xs mt-6">
        © 2024 鐵鋼工會 管理後台
      </p>
    </div>
  </div>
</template>

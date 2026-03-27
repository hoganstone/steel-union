import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, checkUser } from '@/api/index.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('steel_union_token') || null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    try {
      const res = await apiLogin({ username: email, password })
      const { token: newToken, expired } = res.data
      token.value = newToken
      localStorage.setItem('steel_union_token', newToken)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '登入失敗，請檢查帳號密碼' }
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } catch {
      // ignore logout API errors
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('steel_union_token')
    }
  }

  async function checkAuth() {
    if (!token.value) return false
    try {
      const res = await checkUser()
      if (res.data.success) {
        user.value = res.data.uid || null
        return true
      }
      return false
    } catch {
      token.value = null
      localStorage.removeItem('steel_union_token')
      return false
    }
  }

  return { user, token, isAuthenticated, login, logout, checkAuth }
})

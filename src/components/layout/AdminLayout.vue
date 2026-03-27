<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import {
  HardHat, Package, ShoppingBag, Tag, Newspaper,
  LogOut, Menu, X, ChevronRight
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const navItems = [
  { label: '產品管理', to: '/admin/products', icon: Package },
  { label: '訂單管理', to: '/admin/orders', icon: ShoppingBag },
  { label: '優惠券管理', to: '/admin/coupons', icon: Tag },
  { label: '文章管理', to: '/admin/articles', icon: Newspaper },
]

async function handleLogout() {
  await authStore.logout()
  router.push('/admin/login')
}

const pageTitle = {
  '/admin/products': '產品管理',
  '/admin/orders': '訂單管理',
  '/admin/coupons': '優惠券管理',
  '/admin/articles': '文章管理',
}
</script>

<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-[#2c3e50] flex flex-col transition-transform duration-300 ease-in-out',
        'lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div class="w-9 h-9 bg-[#8b6d4b] rounded-xl flex items-center justify-center">
          <HardHat class="w-5 h-5 text-white" />
        </div>
        <div>
          <div class="text-white font-bold text-base leading-tight">鐵鋼工會</div>
          <div class="text-white/50 text-xs">後台管理系統</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            route.path === item.to
              ? 'bg-[#8b6d4b] text-white shadow-md'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          ]"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
          <ChevronRight v-if="route.path === item.to" class="w-3 h-3 ml-auto" />
        </RouterLink>
      </nav>

      <!-- Footer Links -->
      <div class="px-3 py-4 border-t border-white/10 space-y-1">
        <RouterLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <HardHat class="w-4 h-4 shrink-0" />
          前往前台
        </RouterLink>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-red-600/20 transition-all"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          登出
        </button>
      </div>
    </aside>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden text-gray-500 hover:text-[#2c3e50] transition-colors"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-bold text-[#2c3e50]">
            {{ pageTitle[route.path] || '後台管理' }}
          </h1>
        </div>
        <button
          @click="handleLogout"
          class="hidden lg:flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut class="w-4 h-4" />
          登出
        </button>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

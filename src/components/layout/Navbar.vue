<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { HardHat, ShoppingCart, Menu, X, Search, Settings } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart.js'

const cartStore = useCartStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const cartCount = computed(() => cartStore.cart?.carts?.length || 0)

const navLinks = [
  { label: '首頁', to: '/' },
  { label: '會員服務', to: '/products' },
  { label: '最新消息', to: '/news' },
  { label: '購物車', to: '/cart' },
]

function toggleMobile() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 text-[#2c3e50] font-bold text-xl hover:text-[#8b6d4b] transition-colors">
          <HardHat class="w-7 h-7 text-[#8b6d4b]" />
          <span>鐵鋼工會</span>
        </RouterLink>

        <!-- Desktop Nav Links -->
        <div class="hidden md:flex items-center gap-6">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-[#2c3e50] font-medium hover:text-[#8b6d4b] transition-colors relative"
            active-class="text-[#8b6d4b] border-b-2 border-[#8b6d4b]"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- Right Side Icons -->
        <div class="hidden md:flex items-center gap-4">
          <button class="text-[#2c3e50] hover:text-[#8b6d4b] transition-colors">
            <Search class="w-5 h-5" />
          </button>
          <RouterLink to="/cart" class="relative text-[#2c3e50] hover:text-[#8b6d4b] transition-colors">
            <ShoppingCart class="w-5 h-5" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
            >
              {{ cartCount }}
            </span>
          </RouterLink>
          <RouterLink
            to="/admin/login"
            class="text-[#2c3e50] hover:text-[#8b6d4b] transition-colors"
            title="後台管理"
          >
            <Settings class="w-5 h-5" />
          </RouterLink>
        </div>

        <!-- Mobile Hamburger -->
        <button
          class="md:hidden text-[#2c3e50] hover:text-[#8b6d4b] transition-colors"
          @click="toggleMobile"
          aria-label="開啟選單"
        >
          <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-lg">
        <div class="px-4 py-3 flex flex-col gap-2">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-[#2c3e50] font-medium hover:bg-gray-50 hover:text-[#8b6d4b] transition-colors"
            active-class="bg-amber-50 text-[#8b6d4b]"
            @click="mobileMenuOpen = false"
          >
            <span v-if="link.to === '/cart'" class="relative">
              <ShoppingCart class="w-4 h-4" />
              <span
                v-if="cartCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
              >
                {{ cartCount }}
              </span>
            </span>
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </Transition>
  </nav>
</template>

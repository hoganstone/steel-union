<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { HardHat, Facebook, Instagram, Twitter, Mail } from 'lucide-vue-next'

const email = ref('')

const quickLinks = [
  { label: '關於工會', to: '/#about' },
  { label: '會員服務', to: '/products' },
  { label: '最新消息', to: '/news' },
  { label: '常見問題', to: '/#faq' },
]

const memberServices = [
  { label: '加入工會', to: '/cart' },
  { label: '勞動法規諮詢', to: '/products' },
  { label: '職業安全培訓', to: '/products' },
  { label: '福利補助申請', to: '/products' },
]

const resources = [
  { label: '勞工法令下載', to: '/news' },
  { label: '職場安全手冊', to: '/news' },
  { label: '會員權益指南', to: '/news' },
  { label: '申訴表格下載', to: '/news' },
]

function subscribe() {
  if (email.value) {
    alert(`感謝訂閱！確認信已發送至 ${email.value}`)
    email.value = ''
  }
}
</script>

<template>
  <footer class="bg-[#2c3e50] text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        <!-- Brand Column -->
        <div class="lg:col-span-1">
          <RouterLink to="/" class="flex items-center gap-2 text-white font-bold text-xl mb-4">
            <HardHat class="w-7 h-7 text-[#8b6d4b]" />
            <span>鐵鋼工會</span>
          </RouterLink>
          <p class="text-gray-400 text-sm leading-relaxed mb-6">
            自1985年成立以來，我們致力於保障每一位鋼鐵工人的勞動權益，
            推動安全工作環境，爭取合理薪資待遇。
          </p>

          <!-- Newsletter -->
          <div>
            <p class="text-sm font-semibold text-gray-300 mb-2">訂閱電子報</p>
            <div class="flex gap-2">
              <input
                v-model="email"
                type="email"
                placeholder="輸入您的信箱"
                class="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:border-[#8b6d4b]"
                @keyup.enter="subscribe"
              />
              <button
                @click="subscribe"
                class="px-4 py-2 bg-[#8b6d4b] hover:bg-[#7a5e3d] text-white text-sm font-medium rounded-lg transition-colors"
              >
                訂閱
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-base">快速連結</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-gray-400 hover:text-[#8b6d4b] text-sm transition-colors"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Member Services -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-base">會員服務</h4>
          <ul class="space-y-2">
            <li v-for="link in memberServices" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-gray-400 hover:text-[#8b6d4b] text-sm transition-colors"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div>
          <h4 class="text-white font-semibold mb-4 text-base">資源中心</h4>
          <ul class="space-y-2">
            <li v-for="link in resources" :key="link.label">
              <RouterLink
                :to="link.to"
                class="text-gray-400 hover:text-[#8b6d4b] text-sm transition-colors"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

      </div>

      <!-- Divider -->
      <div class="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-gray-400 text-sm">
          © 2024 鐵鋼工會. 保留所有權利.
        </p>

        <!-- Social Icons -->
        <div class="flex items-center gap-4">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 bg-white/10 hover:bg-[#8b6d4b] rounded-full flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <Facebook class="w-4 h-4" />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 bg-white/10 hover:bg-[#8b6d4b] rounded-full flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <Instagram class="w-4 h-4" />
          </a>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            class="w-9 h-9 bg-white/10 hover:bg-[#8b6d4b] rounded-full flex items-center justify-center transition-colors"
            aria-label="Twitter"
          >
            <Twitter class="w-4 h-4" />
          </a>
          <a
            href="mailto:contact@steel-union.org.tw"
            class="w-9 h-9 bg-white/10 hover:bg-[#8b6d4b] rounded-full flex items-center justify-center transition-colors"
            aria-label="Email"
          >
            <Mail class="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

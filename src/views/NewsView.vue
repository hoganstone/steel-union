<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useNewsStore } from '@/stores/news.js'
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-vue-next'

const router = useRouter()
const newsStore = useNewsStore()
const currentPage = ref(1)

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function fetchData(page = 1) {
  currentPage.value = page
  await newsStore.fetchArticles(page)
}

onMounted(() => fetchData(1))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <!-- Page Header -->
    <div class="bg-gradient-to-r from-[#2c3e50] to-[#4a5568] text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold mb-3">最新消息</h1>
        <p class="text-gray-300 text-lg">了解工會最新動態、勞工法規更新及活動訊息</p>
      </div>
    </div>

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Loading -->
      <div v-if="newsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl h-72 animate-pulse"></div>
      </div>

      <!-- Articles Grid -->
      <div v-else-if="newsStore.articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="article in newsStore.articles"
          :key="article.id"
          :to="`/news/${article.id}`"
          class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
          <div class="h-52 bg-gray-100 overflow-hidden">
            <img
              v-if="article.imageUrl"
              :src="article.imageUrl"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-[#2c3e50] to-[#4a5568] flex items-center justify-center">
              <Newspaper class="w-16 h-16 text-white/30" />
            </div>
          </div>
          <div class="p-6 flex flex-col flex-1">
            <p class="text-gray-400 text-xs mb-2">{{ formatDate(article.create_at) }}</p>
            <h3 class="font-bold text-[#2c3e50] text-lg mb-2 line-clamp-2 group-hover:text-[#8b6d4b] transition-colors flex-1">
              {{ article.title }}
            </h3>
            <p v-if="article.description" class="text-gray-500 text-sm line-clamp-3">
              {{ article.description }}
            </p>
            <div class="mt-4 flex items-center text-[#8b6d4b] text-sm font-medium">
              閱讀全文 →
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24">
        <Newspaper class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">目前沒有文章</p>
      </div>

      <!-- Pagination -->
      <div v-if="newsStore.pagination?.total_pages > 1" class="flex items-center justify-center gap-3 mt-12">
        <button
          @click="fetchData(currentPage - 1)"
          :disabled="!newsStore.pagination?.has_pre"
          class="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#2c3e50] hover:text-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          <ChevronLeft class="w-4 h-4" /> 上一頁
        </button>
        <span class="text-gray-500 text-sm">
          第 {{ newsStore.pagination?.current_page }} / {{ newsStore.pagination?.total_pages }} 頁
        </span>
        <button
          @click="fetchData(currentPage + 1)"
          :disabled="!newsStore.pagination?.has_next"
          class="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#2c3e50] hover:text-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          下一頁 <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

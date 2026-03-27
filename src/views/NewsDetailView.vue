<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useNewsStore } from '@/stores/news.js'
import { ArrowLeft, Calendar, User, Newspaper } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const newsStore = useNewsStore()

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(() => {
  newsStore.fetchArticleById(route.params.id)
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />

    <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-500 hover:text-[#2c3e50] mb-8 transition-colors font-medium"
      >
        <ArrowLeft class="w-4 h-4" />
        返回最新消息
      </button>

      <!-- Loading -->
      <div v-if="newsStore.loading" class="space-y-4">
        <div class="h-10 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
        <div class="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <!-- Article -->
      <article v-else-if="newsStore.currentArticle" class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <!-- Hero Image -->
        <div v-if="newsStore.currentArticle.imageUrl" class="h-80 overflow-hidden">
          <img
            :src="newsStore.currentArticle.imageUrl"
            :alt="newsStore.currentArticle.title"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-8 md:p-12">
          <!-- Meta -->
          <div class="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
            <div class="flex items-center gap-1.5">
              <Calendar class="w-4 h-4" />
              {{ formatDate(newsStore.currentArticle.create_at) }}
            </div>
            <div v-if="newsStore.currentArticle.author" class="flex items-center gap-1.5">
              <User class="w-4 h-4" />
              {{ newsStore.currentArticle.author }}
            </div>
            <div v-if="newsStore.currentArticle.tag" class="flex gap-2">
              <span
                v-for="tag in (Array.isArray(newsStore.currentArticle.tag) ? newsStore.currentArticle.tag : [newsStore.currentArticle.tag])"
                :key="tag"
                class="bg-[#2c3e50]/10 text-[#2c3e50] px-2 py-0.5 rounded-full text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-6 leading-tight">
            {{ newsStore.currentArticle.title }}
          </h1>

          <!-- Description -->
          <p v-if="newsStore.currentArticle.description" class="text-gray-500 text-lg border-l-4 border-[#8b6d4b] pl-4 mb-8 italic">
            {{ newsStore.currentArticle.description }}
          </p>

          <!-- Content -->
          <div
            v-if="newsStore.currentArticle.content"
            class="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            v-html="newsStore.currentArticle.content"
          ></div>
        </div>
      </article>

      <!-- Not Found -->
      <div v-else class="text-center py-24">
        <Newspaper class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">找不到此文章</p>
        <RouterLink to="/news" class="text-[#8b6d4b] hover:underline mt-2 inline-block">
          返回最新消息
        </RouterLink>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
:deep(.prose) {
  color: #4a5568;
  line-height: 1.8;
}
:deep(.prose h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 2rem 0 1rem;
}
:deep(.prose h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 1.5rem 0 0.75rem;
}
:deep(.prose p) {
  margin-bottom: 1rem;
}
:deep(.prose ul), :deep(.prose ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
:deep(.prose li) {
  margin-bottom: 0.5rem;
}
:deep(.prose img) {
  border-radius: 0.75rem;
  max-width: 100%;
  margin: 1.5rem auto;
}
</style>

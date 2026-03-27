import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPublicArticles, getArticleById } from '@/api/index.js'

export const useNewsStore = defineStore('news', () => {
  const articles = ref([])
  const pagination = ref({})
  const loading = ref(false)
  const currentArticle = ref(null)

  async function fetchArticles(page = 1) {
    loading.value = true
    try {
      const res = await getPublicArticles(page)
      articles.value = res.data.articles || []
      pagination.value = res.data.pagination || {}
    } catch (error) {
      console.error('取得文章失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchArticleById(id) {
    loading.value = true
    currentArticle.value = null
    try {
      const res = await getArticleById(id)
      currentArticle.value = res.data.article || null
    } catch (error) {
      console.error('取得文章詳細失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  return { articles, pagination, loading, currentArticle, fetchArticles, fetchArticleById }
})

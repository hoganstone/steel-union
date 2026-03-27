import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPublicProducts, getAllPublicProducts, getProductById } from '@/api/index.js'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const pagination = ref({})
  const loading = ref(false)
  const currentProduct = ref(null)
  const categories = ref([])

  const productsByCategory = computed(() => {
    return (category) => {
      if (!category) return products.value
      return products.value.filter((p) => p.category === category)
    }
  })

  async function fetchProducts(page = 1, category = '') {
    loading.value = true
    try {
      const res = await getPublicProducts(page, category)
      products.value = res.data.products || []
      pagination.value = res.data.pagination || {}
      // Extract unique categories
      const allCats = products.value.map((p) => p.category).filter(Boolean)
      categories.value = [...new Set(allCats)]
    } catch (error) {
      console.error('取得產品失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllProducts() {
    loading.value = true
    try {
      const res = await getAllPublicProducts()
      const all = Object.values(res.data.products || {})
      products.value = all
      const allCats = all.map((p) => p.category).filter(Boolean)
      categories.value = [...new Set(allCats)]
    } catch (error) {
      console.error('取得全部產品失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id) {
    loading.value = true
    currentProduct.value = null
    try {
      const res = await getProductById(id)
      currentProduct.value = res.data.product || null
    } catch (error) {
      console.error('取得產品詳細失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    pagination,
    loading,
    currentProduct,
    categories,
    productsByCategory,
    fetchProducts,
    fetchAllProducts,
    fetchProductById,
  }
})

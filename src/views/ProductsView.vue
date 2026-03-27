<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/shared/Toast.vue'
import { useProductsStore } from '@/stores/products.js'
import { useCartStore } from '@/stores/cart.js'
import { useToastStore } from '@/stores/toast.js'
import { ShoppingCart, ChevronLeft, ChevronRight, Package } from 'lucide-vue-next'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const selectedCategory = ref('')
const currentPage = ref(1)
const addingToCart = ref({})

const allCategories = computed(() => productsStore.categories)

async function fetchData(page = 1) {
  currentPage.value = page
  await productsStore.fetchProducts(page, selectedCategory.value)
}

function selectCategory(cat) {
  selectedCategory.value = cat
  fetchData(1)
}

async function addToCart(product) {
  addingToCart.value[product.id] = true
  try {
    const res = await cartStore.addItem(product.id, 1)
    if (res.success) {
      toastStore.showToast(`已將「${product.title}」加入購物車`, 'success')
    } else {
      toastStore.showToast(res.message || '加入購物車失敗', 'error')
    }
  } finally {
    addingToCart.value[product.id] = false
  }
}

onMounted(() => {
  fetchData(1)
  cartStore.fetchCart()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <Toast />

    <!-- Page Header -->
    <div class="bg-gradient-to-r from-[#2c3e50] to-[#4a5568] text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold mb-3">會員服務</h1>
        <p class="text-gray-300 text-lg">提供完善的勞工權益保障服務，讓每位工人都有依靠</p>
      </div>
    </div>

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Category Filter -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button
          @click="selectCategory('')"
          :class="[
            'px-5 py-2 rounded-full font-medium text-sm transition-all',
            selectedCategory === ''
              ? 'bg-[#2c3e50] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2c3e50] hover:text-[#2c3e50]'
          ]"
        >
          全部
        </button>
        <button
          v-for="cat in allCategories"
          :key="cat"
          @click="selectCategory(cat)"
          :class="[
            'px-5 py-2 rounded-full font-medium text-sm transition-all',
            selectedCategory === cat
              ? 'bg-[#2c3e50] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#2c3e50] hover:text-[#2c3e50]'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="productsStore.loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 8" :key="i" class="bg-white rounded-2xl h-80 animate-pulse"></div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="productsStore.products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in productsStore.products"
          :key="product.id"
          class="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
        >
          <RouterLink :to="`/products/${product.id}`" class="block">
            <div class="relative h-52 bg-gray-100 overflow-hidden">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <Package class="w-16 h-16" />
              </div>
              <div class="absolute top-3 left-3">
                <span class="bg-[#2c3e50] text-white text-xs px-3 py-1 rounded-full">
                  {{ product.category || '服務' }}
                </span>
              </div>
            </div>
          </RouterLink>
          <div class="p-5 flex flex-col flex-1">
            <RouterLink :to="`/products/${product.id}`">
              <h3 class="font-bold text-[#2c3e50] mb-2 line-clamp-2 hover:text-[#8b6d4b] transition-colors">
                {{ product.title }}
              </h3>
            </RouterLink>
            <p class="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{{ product.description }}</p>
            <div class="flex items-center justify-between">
              <div>
                <span v-if="product.origin_price && product.origin_price !== product.price" class="text-gray-400 line-through text-xs mr-1">
                  NT$ {{ product.origin_price?.toLocaleString() }}
                </span>
                <span class="text-[#8b6d4b] font-bold text-lg">
                  NT$ {{ (product.price || 0).toLocaleString() }}
                </span>
              </div>
              <button
                @click="addToCart(product)"
                :disabled="addingToCart[product.id]"
                class="flex items-center gap-1.5 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white text-sm px-3 py-2 rounded-lg transition-colors font-medium"
              >
                <ShoppingCart class="w-4 h-4" />
                {{ addingToCart[product.id] ? '加入中...' : '加入購物車' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-24">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">此分類暫無服務項目</p>
      </div>

      <!-- Pagination -->
      <div v-if="productsStore.pagination?.total_pages > 1" class="flex items-center justify-center gap-3 mt-12">
        <button
          @click="fetchData(currentPage - 1)"
          :disabled="!productsStore.pagination?.has_pre"
          class="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#2c3e50] hover:text-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          <ChevronLeft class="w-4 h-4" /> 上一頁
        </button>
        <span class="text-gray-500 text-sm">
          第 {{ productsStore.pagination?.current_page }} / {{ productsStore.pagination?.total_pages }} 頁
        </span>
        <button
          @click="fetchData(currentPage + 1)"
          :disabled="!productsStore.pagination?.has_next"
          class="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#2c3e50] hover:text-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
        >
          下一頁 <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

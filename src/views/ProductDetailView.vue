<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/shared/Toast.vue'
import { useProductsStore } from '@/stores/products.js'
import { useCartStore } from '@/stores/cart.js'
import { useToastStore } from '@/stores/toast.js'
import { ArrowLeft, ShoppingCart, Plus, Minus, Package } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

const qty = ref(1)
const addingToCart = ref(false)

function increaseQty() {
  qty.value++
}

function decreaseQty() {
  if (qty.value > 1) qty.value--
}

async function addToCart() {
  if (!productsStore.currentProduct) return
  addingToCart.value = true
  try {
    const res = await cartStore.addItem(productsStore.currentProduct.id, qty.value)
    if (res.success) {
      toastStore.showToast(`已將「${productsStore.currentProduct.title}」加入購物車`, 'success')
    } else {
      toastStore.showToast(res.message || '加入購物車失敗', 'error')
    }
  } finally {
    addingToCart.value = false
  }
}

onMounted(() => {
  productsStore.fetchProductById(route.params.id)
  cartStore.fetchCart()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <Toast />

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Back Button -->
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-gray-500 hover:text-[#2c3e50] mb-8 transition-colors font-medium"
      >
        <ArrowLeft class="w-4 h-4" />
        返回
      </button>

      <!-- Loading -->
      <div v-if="productsStore.loading" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
        </div>
      </div>

      <!-- Product Detail -->
      <div v-else-if="productsStore.currentProduct" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Image -->
        <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <img
            v-if="productsStore.currentProduct.imageUrl"
            :src="productsStore.currentProduct.imageUrl"
            :alt="productsStore.currentProduct.title"
            class="w-full h-full object-cover"
            style="min-height: 400px;"
          />
          <div v-else class="w-full flex items-center justify-center text-gray-200" style="min-height: 400px;">
            <Package class="w-24 h-24" />
          </div>
        </div>

        <!-- Info -->
        <div class="flex flex-col">
          <div class="mb-3">
            <span class="bg-[#2c3e50] text-white text-xs px-3 py-1 rounded-full">
              {{ productsStore.currentProduct.category || '服務' }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-[#2c3e50] mb-4 leading-tight">
            {{ productsStore.currentProduct.title }}
          </h1>
          <p class="text-gray-600 leading-relaxed mb-6">
            {{ productsStore.currentProduct.description }}
          </p>

          <!-- Price -->
          <div class="flex items-baseline gap-3 mb-6">
            <span v-if="productsStore.currentProduct.origin_price && productsStore.currentProduct.origin_price !== productsStore.currentProduct.price"
              class="text-gray-400 line-through text-base">
              NT$ {{ productsStore.currentProduct.origin_price?.toLocaleString() }}
            </span>
            <span class="text-3xl font-bold text-[#8b6d4b]">
              NT$ {{ (productsStore.currentProduct.price || 0).toLocaleString() }}
            </span>
            <span class="text-gray-500 text-sm">/ {{ productsStore.currentProduct.unit || '份' }}</span>
          </div>

          <!-- Content -->
          <div v-if="productsStore.currentProduct.content" class="bg-gray-50 rounded-xl p-5 mb-6">
            <h3 class="font-semibold text-[#2c3e50] mb-2">服務詳情</h3>
            <p class="text-gray-600 text-sm leading-relaxed">{{ productsStore.currentProduct.content }}</p>
          </div>

          <!-- Quantity Selector -->
          <div class="flex items-center gap-4 mb-8">
            <label class="text-sm font-medium text-gray-700">數量：</label>
            <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                @click="decreaseQty"
                class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <Minus class="w-4 h-4" />
              </button>
              <span class="w-12 text-center font-semibold text-[#2c3e50]">{{ qty }}</span>
              <button
                @click="increaseQty"
                class="w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <Plus class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="addToCart"
              :disabled="addingToCart"
              class="flex-1 flex items-center justify-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-colors text-lg"
            >
              <ShoppingCart class="w-5 h-5" />
              {{ addingToCart ? '加入中...' : '加入購物車' }}
            </button>
            <RouterLink
              to="/products"
              class="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-[#2c3e50] text-gray-600 hover:text-[#2c3e50] py-4 px-6 rounded-xl font-medium transition-all"
            >
              繼續瀏覽
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-24">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">找不到此服務項目</p>
        <RouterLink to="/products" class="text-[#8b6d4b] hover:underline mt-2 inline-block">
          返回服務列表
        </RouterLink>
      </div>
    </main>

    <Footer />
  </div>
</template>

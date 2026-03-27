<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/shared/Toast.vue'
import { useCartStore } from '@/stores/cart.js'
import { useToastStore } from '@/stores/toast.js'
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const toastStore = useToastStore()

const couponCode = ref('')
const applyingCoupon = ref(false)

async function updateQty(item, delta) {
  const newQty = item.qty + delta
  if (newQty < 1) return
  const res = await cartStore.updateItem(item.id, item.product_id, newQty)
  if (!res.success) toastStore.showToast(res.message, 'error')
}

async function removeItem(id) {
  const res = await cartStore.removeItem(id)
  if (res.success) {
    toastStore.showToast('已移除商品', 'success')
  } else {
    toastStore.showToast(res.message, 'error')
  }
}

async function applyCoupon() {
  if (!couponCode.value.trim()) {
    toastStore.showToast('請輸入優惠碼', 'error')
    return
  }
  applyingCoupon.value = true
  try {
    const res = await cartStore.applyCoupon(couponCode.value.trim())
    if (res.success) {
      toastStore.showToast('優惠券套用成功！', 'success')
      couponCode.value = ''
    } else {
      toastStore.showToast(res.message || '優惠券無效', 'error')
    }
  } finally {
    applyingCoupon.value = false
  }
}

onMounted(() => cartStore.fetchCart())
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <Toast />

    <!-- Header -->
    <div class="bg-gradient-to-r from-[#2c3e50] to-[#4a5568] text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl font-bold mb-3">購物車</h1>
        <p class="text-gray-300">確認您的服務項目後前往結帳</p>
      </div>
    </div>

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <!-- Loading -->
      <div v-if="cartStore.loading && !cartStore.cart.carts.length" class="text-center py-24">
        <div class="w-12 h-12 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!cartStore.cart.carts.length" class="text-center py-24">
        <ShoppingBag class="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h2 class="text-2xl font-bold text-gray-400 mb-3">購物車是空的</h2>
        <p class="text-gray-400 mb-8">探索我們的服務項目，找到適合您的方案</p>
        <RouterLink
          to="/products"
          class="inline-flex items-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          <ShoppingBag class="w-4 h-4" />
          前往服務列表
        </RouterLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Table -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100">
              <h2 class="font-bold text-[#2c3e50] text-lg">服務項目</h2>
            </div>

            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-sm">
                    <th class="text-left px-6 py-3 font-medium">商品</th>
                    <th class="text-center px-4 py-3 font-medium">數量</th>
                    <th class="text-right px-4 py-3 font-medium">單價</th>
                    <th class="text-right px-6 py-3 font-medium">小計</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="item in cartStore.cart.carts" :key="item.id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          <img
                            v-if="item.product?.imageUrl"
                            :src="item.product.imageUrl"
                            :alt="item.product?.title"
                            class="w-full h-full object-cover"
                          />
                        </div>
                        <span class="font-medium text-[#2c3e50] text-sm">{{ item.product?.title }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <div class="flex items-center justify-center gap-2">
                        <button
                          @click="updateQty(item, -1)"
                          :disabled="cartStore.loading"
                          class="w-7 h-7 rounded-full border border-gray-200 hover:border-[#2c3e50] flex items-center justify-center transition-colors text-gray-500 hover:text-[#2c3e50] disabled:opacity-40"
                        >
                          <Minus class="w-3 h-3" />
                        </button>
                        <span class="w-8 text-center font-semibold text-sm">{{ item.qty }}</span>
                        <button
                          @click="updateQty(item, 1)"
                          :disabled="cartStore.loading"
                          class="w-7 h-7 rounded-full border border-gray-200 hover:border-[#2c3e50] flex items-center justify-center transition-colors text-gray-500 hover:text-[#2c3e50] disabled:opacity-40"
                        >
                          <Plus class="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-4 text-right text-sm text-gray-600">
                      NT$ {{ (item.product?.price || 0).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 text-right font-semibold text-[#8b6d4b] text-sm">
                      NT$ {{ (item.final_total || item.total || 0).toLocaleString() }}
                    </td>
                    <td class="px-4 py-4">
                      <button
                        @click="removeItem(item.id)"
                        :disabled="cartStore.loading"
                        class="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile Card List -->
            <div class="md:hidden divide-y divide-gray-50">
              <div v-for="item in cartStore.cart.carts" :key="item.id" class="p-4">
                <div class="flex gap-3">
                  <div class="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    <img
                      v-if="item.product?.imageUrl"
                      :src="item.product.imageUrl"
                      :alt="item.product?.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-[#2c3e50] text-sm mb-2">{{ item.product?.title }}</div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <button @click="updateQty(item, -1)" class="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
                          <Minus class="w-3 h-3" />
                        </button>
                        <span class="text-sm font-semibold">{{ item.qty }}</span>
                        <button @click="updateQty(item, 1)" class="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
                          <Plus class="w-3 h-3" />
                        </button>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-[#8b6d4b] font-bold text-sm">
                          NT$ {{ (item.final_total || item.total || 0).toLocaleString() }}
                        </span>
                        <button @click="removeItem(item.id)" class="text-gray-400 hover:text-red-500">
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cart Actions -->
            <div class="px-6 py-4 border-t border-gray-100 flex justify-between">
              <RouterLink to="/products" class="text-gray-500 hover:text-[#2c3e50] text-sm font-medium transition-colors">
                ← 繼續購物
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="space-y-4">
          <!-- Coupon -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
              <Tag class="w-4 h-4" />
              優惠券
            </h3>
            <div class="flex gap-2">
              <input
                v-model="couponCode"
                type="text"
                placeholder="輸入優惠碼"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] transition-colors"
                @keyup.enter="applyCoupon"
              />
              <button
                @click="applyCoupon"
                :disabled="applyingCoupon"
                class="px-4 py-2.5 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white text-sm rounded-xl transition-colors font-medium disabled:bg-gray-300 whitespace-nowrap"
              >
                {{ applyingCoupon ? '套用中...' : '套用優惠券' }}
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-bold text-[#2c3e50] mb-4">訂單摘要</h3>
            <div class="space-y-3 text-sm mb-6">
              <div class="flex justify-between text-gray-600">
                <span>商品小計</span>
                <span>NT$ {{ (cartStore.cart.total || 0).toLocaleString() }}</span>
              </div>
              <div v-if="cartStore.cart.total !== cartStore.cart.final_total" class="flex justify-between text-green-600">
                <span>優惠折扣</span>
                <span>-NT$ {{ ((cartStore.cart.total || 0) - (cartStore.cart.final_total || 0)).toLocaleString() }}</span>
              </div>
              <div class="border-t border-gray-100 pt-3 flex justify-between font-bold text-[#2c3e50] text-lg">
                <span>總計</span>
                <span class="text-[#8b6d4b]">NT$ {{ (cartStore.cart.final_total || 0).toLocaleString() }}</span>
              </div>
            </div>
            <RouterLink
              to="/checkout"
              class="w-full flex items-center justify-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white py-3.5 px-6 rounded-xl font-semibold transition-colors text-base"
            >
              前往結帳
              <ArrowRight class="w-4 h-4" />
            </RouterLink>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/shared/Toast.vue'
import { useCartStore } from '@/stores/cart.js'
import { useToastStore } from '@/stores/toast.js'
import { createOrder } from '@/api/index.js'
import { Package, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const cartStore = useCartStore()
const toastStore = useToastStore()

const loading = ref(false)
const form = ref({
  name: '',
  email: '',
  tel: '',
  address: '',
  message: '',
})

const errors = ref({})

function validate() {
  errors.value = {}
  if (!form.value.name.trim()) errors.value.name = '請輸入姓名'
  if (!form.value.email.trim()) errors.value.email = '請輸入電子郵件'
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = '電子郵件格式不正確'
  if (!form.value.tel.trim()) errors.value.tel = '請輸入電話號碼'
  if (!form.value.address.trim()) errors.value.address = '請輸入地址'
  return Object.keys(errors.value).length === 0
}

async function submitOrder() {
  if (!validate()) return
  loading.value = true
  try {
    const orderData = {
      data: {
        user: {
          name: form.value.name,
          email: form.value.email,
          tel: form.value.tel,
          address: form.value.address,
        },
        message: form.value.message,
      },
    }
    const res = await createOrder(orderData)
    if (res.data.success) {
      toastStore.showToast('訂單建立成功！', 'success')
      router.push(`/order/${res.data.orderId}`)
    } else {
      toastStore.showToast(res.data.message || '訂單建立失敗', 'error')
    }
  } catch (err) {
    toastStore.showToast(err.message || '訂單建立失敗', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => cartStore.fetchCart())
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <Toast />

    <!-- Header -->
    <div class="bg-gradient-to-r from-[#2c3e50] to-[#4a5568] text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 text-sm text-gray-300 mb-3">
          <RouterLink to="/cart" class="hover:text-white transition-colors">購物車</RouterLink>
          <ChevronRight class="w-4 h-4" />
          <span class="text-white">結帳</span>
        </div>
        <h1 class="text-3xl font-bold">確認訂單</h1>
      </div>
    </div>

    <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">

        <!-- Customer Info Form -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 class="text-xl font-bold text-[#2c3e50] mb-6">聯絡資訊</h2>
          <form @submit.prevent="submitOrder" class="space-y-5">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                姓名 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="請輸入您的姓名"
                :class="['w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b]']"
              />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                電子郵件 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="請輸入電子郵件"
                :class="['w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b]']"
              />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                電話號碼 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.tel"
                type="tel"
                placeholder="請輸入電話號碼"
                :class="['w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.tel ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b]']"
              />
              <p v-if="errors.tel" class="text-red-500 text-xs mt-1">{{ errors.tel }}</p>
            </div>

            <!-- Address -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                地址 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.address"
                type="text"
                placeholder="請輸入完整地址"
                :class="['w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.address ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b]']"
              />
              <p v-if="errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">備註留言</label>
              <textarea
                v-model="form.message"
                rows="3"
                placeholder="如有特殊需求或備注，請填寫於此"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors"
            >
              {{ loading ? '處理中...' : '確認送出訂單' }}
            </button>
          </form>
        </div>

        <!-- Order Summary -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-xl font-bold text-[#2c3e50] mb-5">訂單摘要</h2>

            <div v-if="cartStore.cart.carts.length" class="divide-y divide-gray-50">
              <div
                v-for="item in cartStore.cart.carts"
                :key="item.id"
                class="flex gap-3 py-3"
              >
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  <img
                    v-if="item.product?.imageUrl"
                    :src="item.product.imageUrl"
                    :alt="item.product?.title"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <Package class="w-5 h-5" />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-[#2c3e50]">{{ item.product?.title }}</div>
                  <div class="text-xs text-gray-400 mt-0.5">數量：{{ item.qty }}</div>
                </div>
                <div class="text-sm font-semibold text-[#8b6d4b] shrink-0">
                  NT$ {{ (item.final_total || item.total || 0).toLocaleString() }}
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 mt-4 pt-4 space-y-2.5 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>商品小計</span>
                <span>NT$ {{ (cartStore.cart.total || 0).toLocaleString() }}</span>
              </div>
              <div v-if="cartStore.cart.total !== cartStore.cart.final_total" class="flex justify-between text-green-600">
                <span>優惠折扣</span>
                <span>-NT$ {{ ((cartStore.cart.total || 0) - (cartStore.cart.final_total || 0)).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between font-bold text-[#2c3e50] text-lg pt-2 border-t border-gray-100">
                <span>訂單總計</span>
                <span class="text-[#8b6d4b]">NT$ {{ (cartStore.cart.final_total || 0).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="bg-[#2c3e50]/5 rounded-xl p-4 text-sm text-gray-600">
            <p class="font-medium text-[#2c3e50] mb-2">注意事項</p>
            <ul class="space-y-1 text-xs text-gray-500">
              <li>• 訂單建立後，工作人員將於 1-2 個工作天與您聯繫確認</li>
              <li>• 付款後如需退款，請聯繫工會辦公室辦理</li>
              <li>• 如有任何問題，請撥打 (07) 333-5566</li>
            </ul>
          </div>
        </div>

      </div>
    </main>

    <Footer />
  </div>
</template>

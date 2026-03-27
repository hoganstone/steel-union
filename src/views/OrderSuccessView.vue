<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import Toast from '@/components/shared/Toast.vue'
import { useToastStore } from '@/stores/toast.js'
import { getOrder, payOrder } from '@/api/index.js'
import { CheckCircle, Package, CreditCard, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const order = ref(null)
const loading = ref(true)
const paying = ref(false)
const paid = ref(false)

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function fetchOrder() {
  loading.value = true
  try {
    const res = await getOrder(route.params.orderId)
    if (res.data.success) {
      order.value = res.data.order
      paid.value = order.value.is_paid
    }
  } catch (err) {
    toastStore.showToast('無法載入訂單資訊', 'error')
  } finally {
    loading.value = false
  }
}

async function handlePay() {
  paying.value = true
  try {
    const res = await payOrder(route.params.orderId)
    if (res.data.success) {
      paid.value = true
      order.value = { ...order.value, is_paid: true }
      toastStore.showToast('付款成功！感謝您的支持', 'success')
    } else {
      toastStore.showToast(res.data.message || '付款失敗', 'error')
    }
  } catch (err) {
    toastStore.showToast(err.message || '付款失敗', 'error')
  } finally {
    paying.value = false
  }
}

onMounted(() => fetchOrder())
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <Toast />

    <main class="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-24">
        <div class="w-12 h-12 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Order Content -->
      <div v-else-if="order">
        <!-- Success Banner -->
        <div :class="['text-center mb-10', paid ? '' : 'opacity-90']">
          <div :class="['w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', paid ? 'bg-green-100' : 'bg-yellow-100']">
            <CheckCircle :class="['w-10 h-10', paid ? 'text-green-600' : 'text-yellow-600']" />
          </div>
          <h1 class="text-3xl font-bold text-[#2c3e50] mb-2">
            {{ paid ? '訂單已付款完成！' : '訂單建立成功！' }}
          </h1>
          <p class="text-gray-500">
            {{ paid ? '感謝您的支持，工作人員將盡快與您聯繫。' : '請完成付款以確認您的訂單。' }}
          </p>
        </div>

        <!-- Order Info Card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="font-bold text-[#2c3e50]">訂單資訊</h2>
            <span :class="['px-3 py-1 rounded-full text-xs font-semibold', paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
              {{ paid ? '已付款' : '待付款' }}
            </span>
          </div>
          <div class="px-6 py-5 space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">訂單編號</span>
              <span class="font-mono text-[#2c3e50] font-medium">{{ order.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">建立時間</span>
              <span class="text-[#2c3e50]">{{ formatDate(order.create_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">聯絡姓名</span>
              <span class="text-[#2c3e50]">{{ order.user?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">電子郵件</span>
              <span class="text-[#2c3e50]">{{ order.user?.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">電話號碼</span>
              <span class="text-[#2c3e50]">{{ order.user?.tel }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="font-bold text-[#2c3e50]">訂購項目</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div
              v-for="(item, key) in (order.products || {})"
              :key="key"
              class="flex gap-3 px-6 py-4"
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
                <div class="text-xs text-gray-400 mt-0.5">x {{ item.qty }}</div>
              </div>
              <div class="text-sm font-semibold text-[#8b6d4b] shrink-0">
                NT$ {{ (item.final_total || item.total || 0).toLocaleString() }}
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-between">
            <span class="font-bold text-[#2c3e50]">訂單總計</span>
            <span class="font-bold text-[#8b6d4b] text-lg">NT$ {{ (order.total || 0).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Payment Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            v-if="!paid"
            @click="handlePay"
            :disabled="paying"
            class="flex-1 flex items-center justify-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors"
          >
            <CreditCard class="w-5 h-5" />
            {{ paying ? '付款處理中...' : '立即付款' }}
          </button>
          <div v-else class="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-4 px-6 rounded-xl font-bold text-lg">
            <CheckCircle class="w-5 h-5" />
            付款已完成
          </div>
          <RouterLink
            to="/products"
            class="flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-[#2c3e50] text-gray-600 hover:text-[#2c3e50] py-4 px-6 rounded-xl font-medium transition-all"
          >
            繼續選購
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-24">
        <Package class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-400 text-lg">找不到此訂單</p>
      </div>
    </main>

    <Footer />
  </div>
</template>

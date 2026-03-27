<script setup>
import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast.js'
import Toast from '@/components/shared/Toast.vue'
import { getAdminOrders, updateOrder, deleteOrder } from '@/api/index.js'
import { ChevronLeft, ChevronRight, Trash2, Eye, X, ShoppingBag } from 'lucide-vue-next'

const toastStore = useToastStore()

const orders = ref([])
const pagination = ref({})
const currentPage = ref(1)
const loading = ref(false)

const showDetailModal = ref(false)
const currentOrder = ref(null)

const showDeleteModal = ref(false)
const deletingId = ref(null)

function formatDate(timestamp) {
  if (!timestamp) return '—'
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getAdminOrders(page)
    orders.value = res.data.orders || []
    pagination.value = res.data.pagination || {}
  } catch (err) {
    toastStore.showToast(err.message || '取得訂單失敗', 'error')
  } finally {
    loading.value = false
  }
}

function openDetail(order) {
  currentOrder.value = order
  showDetailModal.value = true
}

async function togglePaid(order) {
  try {
    await updateOrder(order.id, { data: { ...order, is_paid: !order.is_paid } })
    order.is_paid = !order.is_paid
    toastStore.showToast('付款狀態已更新', 'success')
  } catch (err) {
    toastStore.showToast(err.message || '更新失敗', 'error')
  }
}

function confirmDelete(id) {
  deletingId.value = id
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await deleteOrder(deletingId.value)
    toastStore.showToast('訂單已刪除', 'success')
    showDeleteModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '刪除失敗', 'error')
  }
}

onMounted(() => fetchData(1))
</script>

<template>
  <div>
    <Toast />

    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-[#2c3e50]">訂單管理</h2>
      <p class="text-sm text-gray-500 mt-0.5">查看與管理所有客戶訂單</p>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="w-8 h-8 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <div v-else-if="!orders.length" class="p-12 text-center text-gray-400">
        <ShoppingBag class="w-12 h-12 mx-auto mb-3 text-gray-200" />
        目前沒有訂單
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th class="text-left px-4 py-3 font-medium">訂單編號</th>
              <th class="text-left px-4 py-3 font-medium">客戶姓名</th>
              <th class="text-left px-4 py-3 font-medium">電子郵件</th>
              <th class="text-right px-4 py-3 font-medium">總金額</th>
              <th class="text-center px-4 py-3 font-medium">付款狀態</th>
              <th class="text-left px-4 py-3 font-medium">建立時間</th>
              <th class="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="openDetail(order)"
            >
              <td class="px-4 py-3 font-mono text-xs text-gray-500 max-w-24 truncate">
                {{ order.id }}
              </td>
              <td class="px-4 py-3 font-medium text-[#2c3e50]">
                {{ order.user?.name || '—' }}
              </td>
              <td class="px-4 py-3 text-gray-500">
                {{ order.user?.email || '—' }}
              </td>
              <td class="px-4 py-3 text-right font-medium text-[#8b6d4b]">
                NT$ {{ (order.total || 0).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-center" @click.stop>
                <button
                  @click="togglePaid(order)"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    order.is_paid ? 'bg-green-500' : 'bg-gray-300']"
                >
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                    order.is_paid ? 'translate-x-paid' : 'translate-x-unpaid']"></span>
                </button>
                <span :class="['ml-2 text-xs', order.is_paid ? 'text-green-600' : 'text-gray-400']">
                  {{ order.is_paid ? '已付款' : '未付款' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(order.create_at) }}</td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openDetail(order)"
                    class="p-1.5 text-gray-400 hover:text-[#2c3e50] hover:bg-gray-100 rounded-lg transition-colors"
                    title="查看詳情"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(order.id)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="刪除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="px-4 py-4 border-t border-gray-100 flex items-center justify-between">
        <p class="text-sm text-gray-500">第 {{ pagination.current_page }} / {{ pagination.total_pages }} 頁</p>
        <div class="flex gap-2">
          <button @click="fetchData(currentPage - 1)" :disabled="!pagination.has_pre"
            class="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft class="w-3 h-3" /> 上一頁
          </button>
          <button @click="fetchData(currentPage + 1)" :disabled="!pagination.has_next"
            class="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed">
            下一頁 <ChevronRight class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDetailModal && currentOrder" class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto pt-10 pb-10">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="font-bold text-[#2c3e50]">訂單詳情</h3>
              <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <!-- Status -->
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">訂單狀態</span>
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold',
                  currentOrder.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                  {{ currentOrder.is_paid ? '已付款' : '未付款' }}
                </span>
              </div>

              <!-- Customer Info -->
              <div class="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div class="font-medium text-[#2c3e50] mb-2">客戶資訊</div>
                <div class="flex justify-between">
                  <span class="text-gray-500">姓名</span>
                  <span>{{ currentOrder.user?.name || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Email</span>
                  <span>{{ currentOrder.user?.email || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">電話</span>
                  <span>{{ currentOrder.user?.tel || '—' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">地址</span>
                  <span class="text-right max-w-48">{{ currentOrder.user?.address || '—' }}</span>
                </div>
              </div>

              <!-- Products -->
              <div>
                <div class="font-medium text-[#2c3e50] text-sm mb-2">訂購商品</div>
                <div class="space-y-2">
                  <div
                    v-for="(item, key) in (currentOrder.products || {})"
                    :key="key"
                    class="flex justify-between text-sm bg-gray-50 rounded-xl px-4 py-2.5"
                  >
                    <span class="text-gray-700">{{ item.product?.title }} × {{ item.qty }}</span>
                    <span class="font-medium text-[#8b6d4b]">NT$ {{ (item.final_total || item.total || 0).toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
                <span class="text-[#2c3e50]">訂單總計</span>
                <span class="text-[#8b6d4b]">NT$ {{ (currentOrder.total || 0).toLocaleString() }}</span>
              </div>

              <div v-if="currentOrder.message" class="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <span class="font-medium">備註：</span>{{ currentOrder.message }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="font-bold text-[#2c3e50] text-lg mb-2">確認刪除</h3>
            <p class="text-gray-500 text-sm mb-6">確定要刪除此訂單嗎？此操作無法復原。</p>
            <div class="flex gap-3">
              <button @click="handleDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold">確認刪除</button>
              <button @click="showDeleteModal = false" class="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.translate-x-paid { transform: translateX(1.125rem); }
.translate-x-unpaid { transform: translateX(0.125rem); }
</style>

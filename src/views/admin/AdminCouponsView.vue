<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast.js'
import Toast from '@/components/shared/Toast.vue'
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/api/index.js'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Tag } from 'lucide-vue-next'

const toastStore = useToastStore()

const coupons = ref([])
const pagination = ref({})
const currentPage = ref(1)
const loading = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const modalLoading = ref(false)

const showDeleteModal = ref(false)
const deletingId = ref(null)
const deletingTitle = ref('')

const defaultForm = () => ({
  title: '',
  code: '',
  percent: 100,
  due_date: '',
  is_enabled: 1,
})
const form = reactive(defaultForm())

function formatDate(timestamp) {
  if (!timestamp) return '—'
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function timestampToInputDate(ts) {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  return d.toISOString().split('T')[0]
}

async function fetchData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getAdminCoupons(page)
    coupons.value = res.data.coupons || []
    pagination.value = res.data.pagination || {}
  } catch (err) {
    toastStore.showToast(err.message || '取得優惠券失敗', 'error')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  Object.assign(form, defaultForm())
  isEditing.value = false
  editingId.value = null
  showModal.value = true
}

function openEdit(coupon) {
  Object.assign(form, {
    title: coupon.title || '',
    code: coupon.code || '',
    percent: coupon.percent || 100,
    due_date: timestampToInputDate(coupon.due_date),
    is_enabled: coupon.is_enabled ?? 1,
  })
  isEditing.value = true
  editingId.value = coupon.id
  showModal.value = true
}

async function submitForm() {
  if (!form.title.trim() || !form.code.trim()) {
    toastStore.showToast('請填寫優惠券標題與代碼', 'error')
    return
  }
  modalLoading.value = true
  try {
    const dueDateTs = form.due_date ? new Date(form.due_date).getTime() / 1000 : null
    const payload = {
      data: {
        title: form.title,
        code: form.code,
        percent: Number(form.percent),
        due_date: dueDateTs,
        is_enabled: form.is_enabled,
      },
    }
    if (isEditing.value) {
      await updateCoupon(editingId.value, payload)
      toastStore.showToast('優惠券更新成功', 'success')
    } else {
      await createCoupon(payload)
      toastStore.showToast('優惠券新增成功', 'success')
    }
    showModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '操作失敗', 'error')
  } finally {
    modalLoading.value = false
  }
}

function confirmDelete(coupon) {
  deletingId.value = coupon.id
  deletingTitle.value = coupon.title
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await deleteCoupon(deletingId.value)
    toastStore.showToast('優惠券已刪除', 'success')
    showDeleteModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '刪除失敗', 'error')
  }
}

async function toggleEnabled(coupon) {
  try {
    await updateCoupon(coupon.id, {
      data: { ...coupon, is_enabled: coupon.is_enabled ? 0 : 1 }
    })
    coupon.is_enabled = coupon.is_enabled ? 0 : 1
    toastStore.showToast('狀態已更新', 'success')
  } catch (err) {
    toastStore.showToast(err.message || '更新失敗', 'error')
  }
}

onMounted(() => fetchData(1))
</script>

<template>
  <div>
    <Toast />

    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-[#2c3e50]">優惠券管理</h2>
        <p class="text-sm text-gray-500 mt-0.5">管理會員優惠折扣碼</p>
      </div>
      <button @click="openCreate"
        class="flex items-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
        <Plus class="w-4 h-4" /> 新增優惠券
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="w-8 h-8 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <div v-else-if="!coupons.length" class="p-12 text-center text-gray-400">
        <Tag class="w-12 h-12 mx-auto mb-3 text-gray-200" />
        目前沒有優惠券
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th class="text-left px-4 py-3 font-medium">名稱</th>
              <th class="text-left px-4 py-3 font-medium">優惠代碼</th>
              <th class="text-center px-4 py-3 font-medium">折扣</th>
              <th class="text-left px-4 py-3 font-medium">到期日</th>
              <th class="text-center px-4 py-3 font-medium">啟用</th>
              <th class="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 font-medium text-[#2c3e50]">{{ coupon.title }}</td>
              <td class="px-4 py-3">
                <code class="bg-gray-100 text-[#8b6d4b] px-2 py-0.5 rounded-lg text-xs font-mono">
                  {{ coupon.code }}
                </code>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {{ coupon.percent }}% OFF
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(coupon.due_date) }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="toggleEnabled(coupon)"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    coupon.is_enabled ? 'bg-green-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                    coupon.is_enabled ? 'translate-x-on' : 'translate-x-off']"></span>
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEdit(coupon)" class="p-1.5 text-gray-400 hover:text-[#2c3e50] hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(coupon)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="font-bold text-[#2c3e50]">{{ isEditing ? '編輯優惠券' : '新增優惠券' }}</h3>
              <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">優惠券名稱 <span class="text-red-500">*</span></label>
                <input v-model="form.title" type="text" placeholder="例：會員專屬折扣"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">優惠代碼 <span class="text-red-500">*</span></label>
                <input v-model="form.code" type="text" placeholder="例：UNION2024"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] font-mono" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">折扣 (%)</label>
                <input v-model="form.percent" type="number" min="1" max="100"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">到期日</label>
                <input v-model="form.due_date" type="date"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
              </div>
              <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-gray-700">啟用優惠券</label>
                <button type="button" @click="form.is_enabled = form.is_enabled ? 0 : 1"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    form.is_enabled ? 'bg-green-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                    form.is_enabled ? 'translate-x-on' : 'translate-x-off']"></span>
                </button>
              </div>
            </div>
            <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button @click="submitForm" :disabled="modalLoading"
                class="flex-1 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {{ modalLoading ? '處理中...' : (isEditing ? '更新優惠券' : '新增優惠券') }}
              </button>
              <button @click="showModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                取消
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="font-bold text-[#2c3e50] text-lg mb-2">確認刪除</h3>
            <p class="text-gray-500 text-sm mb-6">確定要刪除「{{ deletingTitle }}」嗎？</p>
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
.translate-x-on { transform: translateX(1.125rem); }
.translate-x-off { transform: translateX(0.125rem); }
</style>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast.js'
import Toast from '@/components/shared/Toast.vue'
import {
  getProducts, createProduct, updateProduct, deleteProduct, uploadImage
} from '@/api/index.js'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Upload, Package } from 'lucide-vue-next'

const toastStore = useToastStore()

const products = ref([])
const pagination = ref({})
const currentPage = ref(1)
const loading = ref(false)

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const modalLoading = ref(false)

const defaultForm = () => ({
  title: '',
  category: '',
  description: '',
  content: '',
  price: 0,
  origin_price: 0,
  unit: '份',
  imageUrl: '',
  is_enabled: 1,
})

const form = reactive(defaultForm())

const showDeleteModal = ref(false)
const deletingId = ref(null)
const deletingTitle = ref('')

const uploadLoading = ref(false)

async function fetchData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getProducts(page)
    products.value = res.data.products || []
    pagination.value = res.data.pagination || {}
  } catch (err) {
    toastStore.showToast(err.message || '取得產品失敗', 'error')
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

function openEdit(product) {
  Object.assign(form, {
    title: product.title || '',
    category: product.category || '',
    description: product.description || '',
    content: product.content || '',
    price: product.price || 0,
    origin_price: product.origin_price || 0,
    unit: product.unit || '份',
    imageUrl: product.imageUrl || '',
    is_enabled: product.is_enabled ?? 1,
  })
  isEditing.value = true
  editingId.value = product.id
  showModal.value = true
}

async function submitForm() {
  if (!form.title.trim()) {
    toastStore.showToast('請輸入產品名稱', 'error')
    return
  }
  modalLoading.value = true
  try {
    const payload = { data: { ...form, price: Number(form.price), origin_price: Number(form.origin_price) } }
    if (isEditing.value) {
      await updateProduct(editingId.value, payload)
      toastStore.showToast('產品更新成功', 'success')
    } else {
      await createProduct(payload)
      toastStore.showToast('產品新增成功', 'success')
    }
    showModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '操作失敗', 'error')
  } finally {
    modalLoading.value = false
  }
}

function confirmDelete(product) {
  deletingId.value = product.id
  deletingTitle.value = product.title
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await deleteProduct(deletingId.value)
    toastStore.showToast('產品已刪除', 'success')
    showDeleteModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '刪除失敗', 'error')
  }
}

async function toggleEnabled(product) {
  try {
    await updateProduct(product.id, {
      data: { ...product, is_enabled: product.is_enabled ? 0 : 1 }
    })
    product.is_enabled = product.is_enabled ? 0 : 1
    toastStore.showToast('狀態已更新', 'success')
  } catch (err) {
    toastStore.showToast(err.message || '更新失敗', 'error')
  }
}

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploadLoading.value = true
  try {
    const fd = new FormData()
    fd.append('file-to-upload', file)
    const res = await uploadImage(fd)
    if (res.data.success) {
      form.imageUrl = res.data.imageUrl
      toastStore.showToast('圖片上傳成功', 'success')
    }
  } catch (err) {
    toastStore.showToast('圖片上傳失敗', 'error')
  } finally {
    uploadLoading.value = false
    e.target.value = ''
  }
}

onMounted(() => fetchData(1))
</script>

<template>
  <div>
    <Toast />

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-[#2c3e50]">產品管理</h2>
        <p class="text-sm text-gray-500 mt-0.5">管理工會服務項目</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
      >
        <Plus class="w-4 h-4" />
        新增產品
      </button>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="w-8 h-8 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <div v-else-if="!products.length" class="p-12 text-center text-gray-400">
        <Package class="w-12 h-12 mx-auto mb-3 text-gray-200" />
        目前沒有產品
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th class="text-left px-4 py-3 font-medium">圖片</th>
              <th class="text-left px-4 py-3 font-medium">產品名稱</th>
              <th class="text-left px-4 py-3 font-medium">分類</th>
              <th class="text-right px-4 py-3 font-medium">售價</th>
              <th class="text-center px-4 py-3 font-medium">啟用</th>
              <th class="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                  <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.title" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <Package class="w-5 h-5" />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium text-[#2c3e50]">{{ product.title }}</div>
                <div class="text-xs text-gray-400">{{ product.unit }}</div>
              </td>
              <td class="px-4 py-3">
                <span class="bg-[#2c3e50]/10 text-[#2c3e50] text-xs px-2 py-1 rounded-full">
                  {{ product.category || '—' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium text-[#8b6d4b]">
                NT$ {{ (product.price || 0).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="toggleEnabled(product)"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none',
                    product.is_enabled ? 'bg-green-500' : 'bg-gray-300']"
                >
                  <span
                    :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                      product.is_enabled ? 'translate-x-4.5' : 'translate-x-0.5']"
                  ></span>
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="openEdit(product)"
                    class="p-1.5 text-gray-400 hover:text-[#2c3e50] hover:bg-gray-100 rounded-lg transition-colors"
                    title="編輯"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="confirmDelete(product)"
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
        <p class="text-sm text-gray-500">
          第 {{ pagination.current_page }} / {{ pagination.total_pages }} 頁
        </p>
        <div class="flex gap-2">
          <button
            @click="fetchData(currentPage - 1)"
            :disabled="!pagination.has_pre"
            class="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft class="w-3 h-3" /> 上一頁
          </button>
          <button
            @click="fetchData(currentPage + 1)"
            :disabled="!pagination.has_next"
            class="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#2c3e50] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            下一頁 <ChevronRight class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto pt-10 pb-10">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="font-bold text-[#2c3e50] text-lg">{{ isEditing ? '編輯產品' : '新增產品' }}</h3>
              <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">產品圖片</label>
                <div class="flex gap-3 items-start">
                  <div class="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden border border-dashed border-gray-300 flex items-center justify-center shrink-0">
                    <img v-if="form.imageUrl" :src="form.imageUrl" class="w-full h-full object-cover" />
                    <Package v-else class="w-8 h-8 text-gray-300" />
                  </div>
                  <div class="flex-1">
                    <input
                      v-model="form.imageUrl"
                      type="url"
                      placeholder="貼上圖片 URL"
                      class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] mb-2"
                    />
                    <label class="flex items-center gap-2 cursor-pointer text-sm bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-xl transition-colors w-fit">
                      <Upload class="w-4 h-4 text-gray-500" />
                      {{ uploadLoading ? '上傳中...' : '上傳圖片' }}
                      <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" :disabled="uploadLoading" />
                    </label>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">產品名稱 <span class="text-red-500">*</span></label>
                  <input v-model="form.title" type="text" placeholder="請輸入產品名稱"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">分類</label>
                  <input v-model="form.category" type="text" placeholder="例：法律諮詢"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">單位</label>
                  <input v-model="form.unit" type="text" placeholder="例：次"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">售價</label>
                  <input v-model="form.price" type="number" min="0"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">原價</label>
                  <input v-model="form.origin_price" type="number" min="0"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">產品說明</label>
                  <textarea v-model="form.description" rows="2" placeholder="簡短說明"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] resize-none"></textarea>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">詳細內容</label>
                  <textarea v-model="form.content" rows="4" placeholder="詳細說明"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] resize-none"></textarea>
                </div>
                <div class="flex items-center gap-3">
                  <label class="text-sm font-medium text-gray-700">啟用產品</label>
                  <button
                    type="button"
                    @click="form.is_enabled = form.is_enabled ? 0 : 1"
                    :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      form.is_enabled ? 'bg-green-500' : 'bg-gray-300']"
                  >
                    <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                      form.is_enabled ? 'translate-x-4.5' : 'translate-x-0.5']"></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button
                @click="submitForm"
                :disabled="modalLoading"
                class="flex-1 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {{ modalLoading ? '處理中...' : (isEditing ? '更新產品' : '新增產品') }}
              </button>
              <button @click="showModal = false" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                取消
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div class="text-center">
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 class="w-6 h-6 text-red-600" />
              </div>
              <h3 class="font-bold text-[#2c3e50] text-lg mb-2">確認刪除</h3>
              <p class="text-gray-500 text-sm mb-6">確定要刪除「{{ deletingTitle }}」嗎？此操作無法復原。</p>
              <div class="flex gap-3">
                <button @click="handleDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  確認刪除
                </button>
                <button @click="showDeleteModal = false" class="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </div>
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
.translate-x-4\.5 { transform: translateX(1.125rem); }
.translate-x-0\.5 { transform: translateX(0.125rem); }
</style>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToastStore } from '@/stores/toast.js'
import Toast from '@/components/shared/Toast.vue'
import { getAdminArticles, createArticle, updateArticle, deleteArticle } from '@/api/index.js'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Newspaper } from 'lucide-vue-next'

const toastStore = useToastStore()

const articles = ref([])
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
  description: '',
  content: '',
  author: '',
  tag: '',
  imageUrl: '',
  is_public: false,
})
const form = reactive(defaultForm())

function formatDate(timestamp) {
  if (!timestamp) return '—'
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchData(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const res = await getAdminArticles(page)
    articles.value = res.data.articles || []
    pagination.value = res.data.pagination || {}
  } catch (err) {
    toastStore.showToast(err.message || '取得文章失敗', 'error')
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

function openEdit(article) {
  const tag = Array.isArray(article.tag) ? article.tag.join(', ') : (article.tag || '')
  Object.assign(form, {
    title: article.title || '',
    description: article.description || '',
    content: article.content || '',
    author: article.author || '',
    tag,
    imageUrl: article.imageUrl || '',
    is_public: article.isPublic ?? article.is_public ?? false,
  })
  isEditing.value = true
  editingId.value = article.id
  showModal.value = true
}

async function submitForm() {
  if (!form.title.trim()) {
    toastStore.showToast('請輸入文章標題', 'error')
    return
  }
  modalLoading.value = true
  try {
    const tagArr = form.tag ? form.tag.split(',').map((t) => t.trim()).filter(Boolean) : []
    const payload = {
      data: {
        title: form.title,
        description: form.description,
        content: form.content,
        author: form.author,
        tag: tagArr,
        imageUrl: form.imageUrl,
        isPublic: form.is_public,
        create_at: Math.floor(Date.now() / 1000),
      },
    }
    if (isEditing.value) {
      await updateArticle(editingId.value, payload)
      toastStore.showToast('文章更新成功', 'success')
    } else {
      await createArticle(payload)
      toastStore.showToast('文章新增成功', 'success')
    }
    showModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '操作失敗', 'error')
  } finally {
    modalLoading.value = false
  }
}

function confirmDelete(article) {
  deletingId.value = article.id
  deletingTitle.value = article.title
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await deleteArticle(deletingId.value)
    toastStore.showToast('文章已刪除', 'success')
    showDeleteModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    toastStore.showToast(err.message || '刪除失敗', 'error')
  }
}

async function togglePublic(article) {
  try {
    const tag = Array.isArray(article.tag) ? article.tag : (article.tag ? [article.tag] : [])
    await updateArticle(article.id, {
      data: { ...article, tag, isPublic: !article.isPublic }
    })
    article.isPublic = !article.isPublic
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
        <h2 class="text-xl font-bold text-[#2c3e50]">文章管理</h2>
        <p class="text-sm text-gray-500 mt-0.5">管理工會最新消息與公告</p>
      </div>
      <button @click="openCreate"
        class="flex items-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
        <Plus class="w-4 h-4" /> 新增文章
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="w-8 h-8 border-4 border-[#2c3e50] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
      <div v-else-if="!articles.length" class="p-12 text-center text-gray-400">
        <Newspaper class="w-12 h-12 mx-auto mb-3 text-gray-200" />
        目前沒有文章
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <th class="text-left px-4 py-3 font-medium">標題</th>
              <th class="text-left px-4 py-3 font-medium">作者</th>
              <th class="text-center px-4 py-3 font-medium">公開</th>
              <th class="text-left px-4 py-3 font-medium">建立時間</th>
              <th class="text-center px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="article in articles" :key="article.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3">
                <div class="font-medium text-[#2c3e50] max-w-xs truncate">{{ article.title }}</div>
                <div v-if="article.description" class="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{{ article.description }}</div>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ article.author || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <button @click="togglePublic(article)"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    (article.isPublic || article.is_public) ? 'bg-green-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                    (article.isPublic || article.is_public) ? 'translate-x-on' : 'translate-x-off']"></span>
                </button>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(article.create_at) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEdit(article)" class="p-1.5 text-gray-400 hover:text-[#2c3e50] hover:bg-gray-100 rounded-lg transition-colors">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(article)" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto pt-10 pb-10">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="font-bold text-[#2c3e50]">{{ isEditing ? '編輯文章' : '新增文章' }}</h3>
              <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
            </div>
            <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">文章標題 <span class="text-red-500">*</span></label>
                <input v-model="form.title" type="text" placeholder="請輸入文章標題"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">作者</label>
                  <input v-model="form.author" type="text" placeholder="作者姓名"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">標籤 (以逗號分隔)</label>
                  <input v-model="form.tag" type="text" placeholder="例：勞工, 法律, 安全"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">封面圖片 URL</label>
                <input v-model="form.imageUrl" type="url" placeholder="https://..."
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b]" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">摘要說明</label>
                <textarea v-model="form.description" rows="2" placeholder="文章摘要"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">文章內容</label>
                <textarea v-model="form.content" rows="8" placeholder="請輸入文章內容（支援 HTML 標籤）"
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8b6d4b] resize-none font-mono"></textarea>
              </div>
              <div class="flex items-center gap-3">
                <label class="text-sm font-medium text-gray-700">公開文章</label>
                <button type="button" @click="form.is_public = !form.is_public"
                  :class="['relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    form.is_public ? 'bg-green-500' : 'bg-gray-300']">
                  <span :class="['inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow',
                    form.is_public ? 'translate-x-on' : 'translate-x-off']"></span>
                </button>
              </div>
            </div>
            <div class="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button @click="submitForm" :disabled="modalLoading"
                class="flex-1 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {{ modalLoading ? '處理中...' : (isEditing ? '更新文章' : '新增文章') }}
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

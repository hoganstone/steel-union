<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useProductsStore } from '@/stores/products.js'
import { useNewsStore } from '@/stores/news.js'
import { useCartStore } from '@/stores/cart.js'
import { useToastStore } from '@/stores/toast.js'
import {
  ArrowRight, ChevronDown, ChevronUp, MapPin, Phone, Mail,
  Users, Calendar, Award, Building2, Send
} from 'lucide-vue-next'

const router = useRouter()
const productsStore = useProductsStore()
const newsStore = useNewsStore()
const cartStore = useCartStore()
const toastStore = useToastStore()

// Stats animation
const stats = ref([
  { value: 0, target: 15000, suffix: '+', label: '會員人數', icon: Users },
  { value: 0, target: 38, suffix: '', label: '成立年數', icon: Calendar },
  { value: 0, target: 95, suffix: '%', label: '權益勝訴率', icon: Award },
  { value: 0, target: 120, suffix: '+', label: '合作企業', icon: Building2 },
])
const statsRef = ref(null)
let statsAnimated = false
let observer = null

function animateStats() {
  if (statsAnimated) return
  statsAnimated = true
  stats.value.forEach((stat, i) => {
    const duration = 2000
    const step = Math.ceil(stat.target / (duration / 16))
    const interval = setInterval(() => {
      stat.value = Math.min(stat.value + step, stat.target)
      if (stat.value >= stat.target) {
        stat.value = stat.target
        clearInterval(interval)
      }
    }, 16)
  })
}

// FAQ accordion
const faqs = ref([
  {
    q: '如何申請加入工會？',
    a: '您可以透過我們的線上表單或親臨工會辦公室填寫入會申請書。需提供身分證明文件及工作證明，審核通過後即可成為正式會員。',
    open: false,
  },
  {
    q: '工會會員每月需繳納多少會費？',
    a: '基本會員月費為新台幣200元，可依個人狀況申請減免。詳細費用結構請參閱會員服務頁面或聯繫工會辦公室。',
    open: false,
  },
  {
    q: '工會能提供哪些勞動法律諮詢？',
    a: '工會設有專業法律顧問團隊，提供勞動契約審查、職場霸凌申訴、勞資爭議調解、職業災害賠償等法律諮詢服務，每週三及週六上午免費開放。',
    open: false,
  },
  {
    q: '遭遇職業災害該如何處理？',
    a: '發生職業災害時，請立即通知主管並就醫，同時聯繫工會。工會將協助您申請勞工保險職業災害給付、陪同進行勞資協商，並視情況提供法律援助。',
    open: false,
  },
  {
    q: '工會是否提供職業技能培訓？',
    a: '是的，工會每季定期舉辦各類職業技能培訓課程，包含焊接技術、設備操作、安全衛生等。會員可優先報名並享有學費補助，部分課程還提供政府補助。',
    open: false,
  },
])

// Contact form
const contactForm = ref({ name: '', email: '', message: '' })
const contactLoading = ref(false)

function toggleFaq(index) {
  faqs.value[index].open = !faqs.value[index].open
}

function scrollToSection(hash) {
  const el = document.querySelector(hash)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

async function addToCartFromHome(product) {
  const res = await cartStore.addItem(product.id, 1)
  if (res.success) {
    toastStore.showToast(`已將「${product.title}」加入購物車`, 'success')
  } else {
    toastStore.showToast(res.message || '加入購物車失敗', 'error')
  }
}

async function submitContact() {
  if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.message) {
    toastStore.showToast('請填寫所有必填欄位', 'error')
    return
  }
  contactLoading.value = true
  await new Promise((r) => setTimeout(r, 800))
  contactLoading.value = false
  toastStore.showToast('感謝您的留言，我們將盡快回覆！', 'success')
  contactForm.value = { name: '', email: '', message: '' }
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(async () => {
  await Promise.all([
    productsStore.fetchProducts(1),
    newsStore.fetchArticles(1),
    cartStore.fetchCart(),
  ])

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) animateStats()
    },
    { threshold: 0.3 }
  )
  if (statsRef.value) observer.observe(statsRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a252f] via-[#2c3e50] to-[#4a5568] overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 50px)"></div>
      </div>
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div class="inline-block bg-[#8b6d4b]/30 border border-[#8b6d4b]/50 text-[#d4a96a] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          自1985年以來守護鋼鐵工人權益
        </div>
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
          團結一心
          <span class="block text-[#8b6d4b]">共創鋼鐵未來</span>
        </h1>
        <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          凝聚鋼鐵工人的力量，爭取合理待遇與安全工作環境，
          讓每一位工人都能得到應有的尊重與保障。
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/cart"
            class="inline-flex items-center gap-2 bg-[#8b6d4b] hover:bg-[#7a5e3d] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-[#8b6d4b]/30"
          >
            加入工會
            <ArrowRight class="w-5 h-5" />
          </RouterLink>
          <button
            @click="scrollToSection('#about')"
            class="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-white/10"
          >
            了解更多
          </button>
        </div>
      </div>
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronDown class="w-6 h-6" />
      </div>
    </section>

    <!-- Stats Section -->
    <section ref="statsRef" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center group"
          >
            <div class="w-16 h-16 bg-[#2c3e50]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#8b6d4b]/10 transition-colors">
              <component :is="stat.icon" class="w-8 h-8 text-[#2c3e50] group-hover:text-[#8b6d4b] transition-colors" />
            </div>
            <div class="text-4xl font-bold text-[#2c3e50] mb-1">
              {{ stat.value.toLocaleString() }}{{ stat.suffix }}
            </div>
            <div class="text-gray-500 font-medium">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl mx-auto text-center">
          <span class="inline-block bg-[#8b6d4b]/10 text-[#8b6d4b] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            我們的使命
          </span>
          <h2 class="text-4xl font-bold text-[#2c3e50] mb-6 leading-tight">
            為每一位鋼鐵工人發聲
          </h2>
          <p class="text-gray-600 text-lg leading-relaxed mb-4">
            鐵鋼工會自成立以來，始終秉持「勞工權益至上」的信念，透過集體談判、法律援助、
            職業培訓等多元服務，守護每一位鋼鐵產業工作者的尊嚴與福祉。
          </p>
          <p class="text-gray-600 text-lg leading-relaxed">
            我們深信，唯有工人團結一心，才能有效對抗不合理的勞動條件，
            推動整個產業朝更安全、更公平的方向邁進。讓我們攜手共創更美好的工作環境。
          </p>
        </div>
      </div>
    </section>

    <!-- Services Preview Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div>
            <span class="inline-block bg-[#2c3e50]/10 text-[#2c3e50] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              會員服務
            </span>
            <h2 class="text-3xl font-bold text-[#2c3e50]">精選服務項目</h2>
          </div>
          <RouterLink
            to="/products"
            class="hidden sm:inline-flex items-center gap-1 text-[#8b6d4b] hover:text-[#7a5e3d] font-semibold transition-colors"
          >
            查看所有服務
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <div v-if="productsStore.loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl h-72 animate-pulse"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="product in productsStore.products.slice(0, 3)"
            :key="product.id"
            class="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="relative h-48 overflow-hidden bg-gray-100">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <Building2 class="w-12 h-12" />
              </div>
              <div class="absolute top-3 left-3">
                <span class="bg-[#2c3e50] text-white text-xs px-3 py-1 rounded-full">
                  {{ product.category || '服務' }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-bold text-[#2c3e50] text-lg mb-2 line-clamp-2">{{ product.title }}</h3>
              <div class="flex items-center justify-between mt-4">
                <span class="text-[#8b6d4b] font-bold text-xl">
                  NT$ {{ (product.price || 0).toLocaleString() }}
                </span>
                <button
                  @click="addToCartFromHome(product)"
                  class="text-sm bg-[#2c3e50] hover:bg-[#8b6d4b] text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  加入購物車
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8 sm:hidden">
          <RouterLink
            to="/products"
            class="inline-flex items-center gap-1 text-[#8b6d4b] hover:text-[#7a5e3d] font-semibold"
          >
            查看所有服務 <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- News Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
          <div>
            <span class="inline-block bg-[#8b6d4b]/10 text-[#8b6d4b] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              最新消息
            </span>
            <h2 class="text-3xl font-bold text-[#2c3e50]">工會最新動態</h2>
          </div>
          <RouterLink
            to="/news"
            class="hidden sm:inline-flex items-center gap-1 text-[#8b6d4b] hover:text-[#7a5e3d] font-semibold transition-colors"
          >
            查看全部新聞
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <div v-if="newsStore.loading" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="i in 3" :key="i" class="bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RouterLink
            v-for="article in newsStore.articles.slice(0, 3)"
            :key="article.id"
            :to="`/news/${article.id}`"
            class="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
          >
            <div class="h-48 bg-gray-100 overflow-hidden">
              <img
                v-if="article.imageUrl"
                :src="article.imageUrl"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-[#2c3e50] to-[#4a5568] flex items-center justify-center">
                <Mail class="w-12 h-12 text-white/30" />
              </div>
            </div>
            <div class="p-6">
              <p class="text-gray-400 text-xs mb-2">{{ formatDate(article.create_at) }}</p>
              <h3 class="font-bold text-[#2c3e50] text-lg mb-2 line-clamp-2 group-hover:text-[#8b6d4b] transition-colors">
                {{ article.title }}
              </h3>
              <p class="text-gray-500 text-sm line-clamp-2">{{ article.description }}</p>
            </div>
          </RouterLink>
        </div>

        <div class="text-center mt-8 sm:hidden">
          <RouterLink to="/news" class="inline-flex items-center gap-1 text-[#8b6d4b] font-semibold">
            查看全部新聞 <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block bg-[#2c3e50]/10 text-[#2c3e50] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            常見問題
          </span>
          <h2 class="text-3xl font-bold text-[#2c3e50]">您最想了解的問題</h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="border border-gray-200 rounded-xl overflow-hidden"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
            >
              <span class="font-semibold text-[#2c3e50] pr-4">{{ faq.q }}</span>
              <component
                :is="faq.open ? ChevronUp : ChevronDown"
                class="w-5 h-5 text-[#8b6d4b] shrink-0 transition-transform duration-200"
              />
            </button>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="faq.open" class="px-6 pb-5 bg-gray-50 border-t border-gray-100">
                <p class="text-gray-600 leading-relaxed pt-4">{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-0">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <!-- History -->
        <div class="bg-[#2c3e50] text-white px-8 py-20 lg:px-16">
          <span class="inline-block bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            四十年歷史
          </span>
          <h2 class="text-3xl font-bold mb-6 leading-tight">
            走過四十載歲月<br />守護鋼鐵工人尊嚴
          </h2>
          <p class="text-gray-300 leading-relaxed mb-4">
            1985年，一群充滿理想的鋼鐵工人齊聚一堂，創立了這個組織。
            在那個勞工權益保障尚不完善的年代，他們以無比的勇氣與決心，
            踏上了為工人發聲的漫漫長路。
          </p>
          <p class="text-gray-300 leading-relaxed mb-6">
            四十年來，工會參與了無數次勞資談判、協助數千名工人爭取應有的權益，
            更推動了多項重要的勞動法規修訂，為台灣鋼鐵產業的勞動環境帶來深遠影響。
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-2xl font-bold text-[#d4a96a]">1985</div>
              <div class="text-sm text-gray-300">工會創立年份</div>
            </div>
            <div class="bg-white/10 rounded-xl p-4">
              <div class="text-2xl font-bold text-[#d4a96a]">3,000+</div>
              <div class="text-sm text-gray-300">成功協助案例</div>
            </div>
          </div>
        </div>

        <!-- Chairman Quote -->
        <div class="bg-[#8b6d4b] text-white px-8 py-20 lg:px-16 flex flex-col justify-center">
          <span class="inline-block bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            理事長的話
          </span>
          <blockquote class="text-2xl font-light leading-relaxed mb-8 italic text-white/90">
            「每一塊鋼鐵的背後，都有工人的汗水與青春。
            我們的工作，就是確保這份付出能夠得到應有的回報與尊重。」
          </blockquote>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              林
            </div>
            <div>
              <div class="font-bold text-lg">林建宏 理事長</div>
              <div class="text-white/70 text-sm">任期 2020 – 現任</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-block bg-[#8b6d4b]/10 text-[#8b6d4b] px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            聯絡我們
          </span>
          <h2 class="text-3xl font-bold text-[#2c3e50]">有任何問題？歡迎聯繫</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Info -->
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-[#2c3e50]/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin class="w-5 h-5 text-[#2c3e50]" />
              </div>
              <div>
                <div class="font-semibold text-[#2c3e50] mb-1">辦公地址</div>
                <div class="text-gray-600">台灣高雄市前鎮區中山二路27號8樓</div>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-[#2c3e50]/10 rounded-xl flex items-center justify-center shrink-0">
                <Phone class="w-5 h-5 text-[#2c3e50]" />
              </div>
              <div>
                <div class="font-semibold text-[#2c3e50] mb-1">聯絡電話</div>
                <div class="text-gray-600">(07) 333-5566</div>
                <div class="text-gray-400 text-sm">週一至週五 09:00–17:30</div>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-[#2c3e50]/10 rounded-xl flex items-center justify-center shrink-0">
                <Mail class="w-5 h-5 text-[#2c3e50]" />
              </div>
              <div>
                <div class="font-semibold text-[#2c3e50] mb-1">電子郵件</div>
                <div class="text-gray-600">contact@steel-union.org.tw</div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <form @submit.prevent="submitContact" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">姓名 <span class="text-red-500">*</span></label>
              <input
                v-model="contactForm.name"
                type="text"
                placeholder="請輸入您的姓名"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">電子郵件 <span class="text-red-500">*</span></label>
              <input
                v-model="contactForm.email"
                type="email"
                placeholder="請輸入您的信箱"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">留言內容 <span class="text-red-500">*</span></label>
              <textarea
                v-model="contactForm.message"
                rows="4"
                placeholder="請輸入您的留言或問題..."
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b6d4b]/30 focus:border-[#8b6d4b] transition-all text-sm resize-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              :disabled="contactLoading"
              class="w-full flex items-center justify-center gap-2 bg-[#2c3e50] hover:bg-[#8b6d4b] disabled:bg-gray-300 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              <span v-if="contactLoading">傳送中...</span>
              <template v-else>
                <Send class="w-4 h-4" />
                送出訊息
              </template>
            </button>
          </form>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

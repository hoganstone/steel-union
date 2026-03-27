import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart as apiClearCart,
  applyCoupon as apiApplyCoupon,
} from '@/api/index.js'

export const useCartStore = defineStore('cart', () => {
  const cart = ref({ carts: [], total: 0, final_total: 0 })
  const loading = ref(false)

  async function fetchCart() {
    loading.value = true
    try {
      const res = await getCart()
      cart.value = res.data.data || { carts: [], total: 0, final_total: 0 }
    } catch (error) {
      console.error('取得購物車失敗:', error.message)
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId, qty = 1) {
    loading.value = true
    try {
      await addToCart({ data: { product_id: productId, qty } })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '加入購物車失敗' }
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id, productId, qty) {
    loading.value = true
    try {
      await updateCart(id, { data: { product_id: productId, qty } })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '更新購物車失敗' }
    } finally {
      loading.value = false
    }
  }

  async function removeItem(id) {
    loading.value = true
    try {
      await removeFromCart(id)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '移除商品失敗' }
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    try {
      await apiClearCart()
      cart.value = { carts: [], total: 0, final_total: 0 }
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '清空購物車失敗' }
    } finally {
      loading.value = false
    }
  }

  async function applyCoupon(code) {
    loading.value = true
    try {
      await apiApplyCoupon({ data: { code } })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || '套用優惠券失敗' }
    } finally {
      loading.value = false
    }
  }

  return { cart, loading, fetchCart, addItem, updateItem, removeItem, clearCart, applyCoupon }
})

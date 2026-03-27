import axios from 'axios'

const api = axios.create({
  baseURL: 'https://vue3-course-api.hexschool.io',
  timeout: 10000,
})

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('steel_union_token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        localStorage.removeItem('steel_union_token')
      }
      return Promise.reject(new Error(data?.message || '請求失敗'))
    }
    return Promise.reject(new Error('網路連線失敗，請稍後再試'))
  }
)

// Auth
export const login = (data) => api.post('/v2/admin/signin', data)
export const logout = () => api.post('/v2/logout')
export const checkUser = () => api.post('/v2/api/user/check')

// Admin Products
export const getProducts = (page = 1) =>
  api.get(`/v2/api/seaisi/admin/products?page=${page}`)
export const getAllProducts = () =>
  api.get('/v2/api/seaisi/admin/products/all')
export const createProduct = (data) =>
  api.post('/v2/api/seaisi/admin/product', data)
export const updateProduct = (id, data) =>
  api.put(`/v2/api/seaisi/admin/product/${id}`, data)
export const deleteProduct = (id) =>
  api.delete(`/v2/api/seaisi/admin/product/${id}`)

// Admin Orders
export const getAdminOrders = (page = 1) =>
  api.get(`/v2/api/seaisi/admin/orders?page=${page}`)
export const updateOrder = (id, data) =>
  api.put(`/v2/api/seaisi/admin/order/${id}`, data)
export const deleteOrder = (id) =>
  api.delete(`/v2/api/seaisi/admin/order/${id}`)

// Admin Articles
export const getAdminArticles = (page = 1) =>
  api.get(`/v2/api/seaisi/admin/articles?page=${page}`)
export const createArticle = (data) =>
  api.post('/v2/api/seaisi/admin/article', data)
export const updateArticle = (id, data) =>
  api.put(`/v2/api/seaisi/admin/article/${id}`, data)
export const deleteArticle = (id) =>
  api.delete(`/v2/api/seaisi/admin/article/${id}`)

// Admin Coupons
export const getAdminCoupons = (page = 1) =>
  api.get(`/v2/api/seaisi/admin/coupons?page=${page}`)
export const createCoupon = (data) =>
  api.post('/v2/api/seaisi/admin/coupon', data)
export const updateCoupon = (id, data) =>
  api.put(`/v2/api/seaisi/admin/coupon/${id}`, data)
export const deleteCoupon = (id) =>
  api.delete(`/v2/api/seaisi/admin/coupon/${id}`)

// Public Products
export const getPublicProducts = (page = 1, category = '') => {
  const params = new URLSearchParams({ page })
  if (category) params.append('category', category)
  return api.get(`/v2/api/seaisi/products?${params.toString()}`)
}
export const getAllPublicProducts = () =>
  api.get('/v2/api/seaisi/products/all')
export const getProductById = (id) =>
  api.get(`/v2/api/seaisi/product/${id}`)

// Public Articles
export const getPublicArticles = (page = 1) =>
  api.get(`/v2/api/seaisi/articles?page=${page}`)
export const getArticleById = (id) =>
  api.get(`/v2/api/seaisi/article/${id}`)

// Cart
export const getCart = () => api.get('/v2/api/seaisi/cart')
export const addToCart = (data) => api.post('/v2/api/seaisi/cart', data)
export const updateCart = (id, data) =>
  api.put(`/v2/api/seaisi/cart/${id}`, data)
export const removeFromCart = (id) =>
  api.delete(`/v2/api/seaisi/cart/${id}`)
export const clearCart = () => api.delete('/v2/api/seaisi/carts')

// Coupon & Order
export const applyCoupon = (data) => api.post('/v2/api/seaisi/coupon', data)
export const createOrder = (data) => api.post('/v2/api/seaisi/order', data)
export const getOrder = (orderId) =>
  api.get(`/v2/api/seaisi/order/${orderId}`)
export const payOrder = (orderId) =>
  api.post(`/v2/api/seaisi/pay/${orderId}`)

// Upload
export const uploadImage = (formData) =>
  api.post('/v2/api/seaisi/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export default api

import api from './api'

export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = () => api.get('/orders/my')
export const getSingleOrder = (id) => api.get(`/orders/my/${id}`)
export const getAllOrders = () => api.get('/orders')
export const adminCreateOrder = (data) => api.post('/orders/admin', data)
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })
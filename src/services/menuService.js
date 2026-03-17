import api from './api'

export const getAllMenuItems = () => api.get('/menu')
export const getSingleMenuItem = (id) => api.get(`/menu/${id}`)
export const createMenuItem = (data) => api.post('/menu', data)
export const updateMenuItem = (id, data) => api.patch(`/menu/${id}`, data)
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`)
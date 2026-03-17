import api from './api'

export const getAllTables = () => api.get('/tables')
export const getAvailableTables = () => api.get('/tables/available')
export const createTable = (data) => api.post('/tables', data)
export const updateTable = (id, data) => api.patch(`/tables/${id}`, data)
export const deleteTable = (id) => api.delete(`/tables/${id}`)
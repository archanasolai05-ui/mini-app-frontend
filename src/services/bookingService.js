import api from './api'

export const createBooking = (data) => api.post('/bookings', data)
export const getMyBookings = () => api.get('/bookings/my')
export const cancelBooking = (id) => api.delete(`/bookings/${id}`)
export const getAllBookings = () => api.get('/bookings')
export const adminCreateBooking = (data) => api.post('/bookings/admin', data)
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status })
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  myBookings: [],
  loading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.myBookings = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setBookings, setLoading, setError } = bookingSlice.actions
export default bookingSlice.reducer
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  myOrders: [],
  loading: false,
  error: null,
}

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.myOrders = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setOrders, setLoading, setError } = orderSlice.actions
export default orderSlice.reducer
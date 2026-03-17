import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalPrice: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existing = state.items.find(
        (item) => item.id === action.payload.id
      )
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      )
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
    },
    increaseQty: (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload
      )
      if (item) item.quantity += 1
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
    },
    decreaseQty: (state, action) => {
      const item = state.items.find(
        (item) => item.id === action.payload
      )
      if (item && item.quantity > 1) {
        item.quantity -= 1
      } else {
        state.items = state.items.filter(
          (i) => i.id !== action.payload
        )
      }
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )
    },
    clearCart: (state) => {
      state.items = []
      state.totalPrice = 0
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
} = cartSlice.actions
export default cartSlice.reducer
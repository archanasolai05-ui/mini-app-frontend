import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null, //redux make empty when close the browser but we want to persist the login state even after refresh or close the browser. So we store the token in localStorage and initialize the token state from localStorage when the app loads.
  isLoggedIn: !!localStorage.getItem('token'),    //!!converts to boolean//
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoggedIn = true
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isLoggedIn = false
      localStorage.removeItem('token')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
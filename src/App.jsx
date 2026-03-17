import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { setCredentials } from './redux/slices/authSlice'
import { getProfile } from './services/authService'

import Login         from './pages/auth/Login'
import Register      from './pages/auth/Register'
import Menu          from './pages/user/Menu'
import Cart          from './pages/user/Cart'
import Checkout      from './pages/user/Checkout'
import MyOrders      from './pages/user/MyOrders'
import BookTable     from './pages/user/BookTable'
import MyBookings    from './pages/user/MyBookings'
import Dashboard     from './pages/admin/Dashboard'
import ManageMenu    from './pages/admin/ManageMenu'
import ManageTables  from './pages/admin/ManageTables'
import AdminOrders   from './pages/admin/AdminOrders'
import AdminBookings from './pages/admin/AdminBookings'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth)
  if (!isLoggedIn) return <Navigate to="/login" />
  return children
}

function AdminRoute({ children }) {
  const { user, isLoggedIn } = useSelector((state) => state.auth)
  if (!isLoggedIn) return <Navigate to="/login" />
  if (user?.role !== 'ADMIN') return <Navigate to="/menu" />
  return children
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
    }}>
      <h1 style={{ fontSize: '5rem', color: '#e74c3c' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '20px' }}>
        Page not found!
      </p>
      <a href="/menu" style={{
        background: '#f39c12',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        textDecoration: 'none',
      }}>
        Go to Menu
      </a>
    </div>
  )
}

function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    const restoreUser = async () => {
      if (token) {
        try {
          const res = await getProfile()
          dispatch(setCredentials({
            user: res.data,
            token,
          }))
        } catch (err) {
          console.error('Session expired')
        }
      }
    }
    restoreUser()
  }, [])

  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/menu" element={
        <ProtectedRoute>
          <Menu />
        </ProtectedRoute>
      } />

      <Route path="/cart" element={
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />

      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />

      <Route path="/my-orders" element={
        <ProtectedRoute>
          <MyOrders />
        </ProtectedRoute>
      } />

      <Route path="/book-table" element={
        <ProtectedRoute>
          <BookTable />
        </ProtectedRoute>
      } />

      <Route path="/my-bookings" element={
        <ProtectedRoute>
          <MyBookings />
        </ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />

      <Route path="/admin/menu" element={
        <AdminRoute>
          <ManageMenu />
        </AdminRoute>
      } />

      <Route path="/admin/tables" element={
        <AdminRoute>
          <ManageTables />
        </AdminRoute>
      } />

      <Route path="/admin/orders" element={
        <AdminRoute>
          <AdminOrders />
        </AdminRoute>
      } />

      <Route path="/admin/bookings" element={
        <AdminRoute>
          <AdminBookings />
        </AdminRoute>
      } />

      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default App

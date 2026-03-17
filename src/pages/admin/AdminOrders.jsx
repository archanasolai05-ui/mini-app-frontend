import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '../../services/orderService'
import Navbar from '../../components/Navbar'

function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders()
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Why this function?
  // Admin selects new status from dropdown
  // We call API to update in database
  // Then update UI immediately without page reload
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ))
    } catch (err) {
      alert('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Why these status options?
  // Admin can only move order FORWARD
  // PENDING → PREPARING → READY → DELIVERED
  // or CANCEL at any point
  const statusOptions = [
    'PENDING',
    'PREPARING',
    'READY',
    'DELIVERED',
    'CANCELLED',
  ]

  if (loading) return (
    <div className="adminorders-page">
      <Navbar />
      <div className="loading">Loading orders...</div>
    </div>
  )

  return (
    <div className="adminorders-page">
      <Navbar />
      <div className="adminorders-content">
        <h2>All Orders 🍛</h2>

        {orders.length === 0 ? (
          <div className="orders-empty">No orders yet!</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card-admin">

              {/* Order Header */}
              <div className="order-card-admin-header">
                <div className="order-customer">
                  <h4>Order #{order.id}</h4>
                  <p>👤 {order.user.name} ({order.user.email})</p>
                  {order.user.phone && (
                    <p>📞 {order.user.phone}</p>
                  )}
                  <p>📅 {formatDate(order.createdAt)}</p>
                  {order.tableId && (
                    <p>🪑 Table #{order.tableId}</p>
                  )}
                  {order.createdByAdmin && (
                    <p className="admin-created-badge">
                      Created by Admin
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="order-card-admin-items">
                {order.items.map((item) => (
                  <p key={item.id}>
                    • {item.menuItem.name} x{item.quantity}
                    → ₹{item.price * item.quantity}
                  </p>
                ))}
              </div>

              {/* Order Footer */}
              <div className="order-card-admin-footer">
                <strong>Total: ₹{order.totalPrice}</strong>

                {/* Why dropdown?
                    Admin can quickly change status
                    without going to another page */}
                <select
                  className="status-select"
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value)
                  }
                  disabled={
                    updating === order.id ||
                    order.status === 'DELIVERED' ||
                    order.status === 'CANCELLED'
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {updating === order.id && (
                  <span className="updating-text">Updating...</span>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AdminOrders
// ---

// ## Step 2 — Create Admin Bookings Page

// ### Why this page?
// ```
// Admin needs to:
// → See ALL bookings from ALL users
// → Confirm bookings (PENDING → CONFIRMED)
// → Cancel bookings if needed
// → Create bookings on behalf of walk-in customers
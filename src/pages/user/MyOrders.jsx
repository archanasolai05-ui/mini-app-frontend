import { useState, useEffect } from 'react'
import { getMyOrders, updateOrderStatus } from '../../services/orderService'
import Navbar from '../../components/Navbar'

function MyOrders() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders()
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(orderId)
    try {
      await updateOrderStatus(orderId, 'CANCELLED')
      setOrders(orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'CANCELLED' }
          : order
      ))
    } catch (err) {
      alert('Failed to cancel order')
    } finally {
      setCancelling(null)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day:    'numeric',
      month:  'short',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    })
  }

  // ✅ format visit date for booking
  const formatVisitDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
      timeZone: 'Asia/Kolkata',
    })
  }

  if (loading) return (
    <div className="orders-page">
      <Navbar />
      <div className="loading">Loading orders...</div>
    </div>
  )

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-content">
        <h2>My Orders 📋</h2>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>No orders yet!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="order-table-info">
                    {order.tableId
                      ? `🪑 Table ${order.tableId}`
                      : '🥡 Takeaway'
                    }
                  </div>

                  {/* ✅ show booking details if order is linked to booking */}
                  {order.booking && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        🗓️ Visit Date: {formatVisitDate(order.booking.date)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        ⏰ Time Slot: {order.booking.timeSlot}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        👥 Guests: {order.booking.guestCount}
                      </div>
                    </div>
                  )}
                </div>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.menuItem.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>

              {/* cancel button — only for PENDING, PREPARING, READY */}
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancelling === order.id}
                    style={{
                      padding: '8px 20px',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                    }}
                  >
                    {cancelling === order.id ? 'Cancelling...' : '✕ Cancel Order'}
                  </button>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyOrders
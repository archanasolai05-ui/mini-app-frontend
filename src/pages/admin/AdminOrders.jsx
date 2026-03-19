import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus } from '../../services/orderService'
import { getAllBookings, updateBookingStatus } from '../../services/bookingService'
import Navbar from '../../components/Navbar'

function AdminOrders() {
  const [orders, setOrders]       = useState([])
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        getAllOrders(),
        getAllBookings(),
      ])
      setOrders(ordersRes.data)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

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

  const handleBookingStatusChange = async (bookingId, newStatus) => {
    setUpdating(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
      setBookings(bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      ))
    } catch (err) {
      alert('Failed to update booking status')
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

  const formatVisitDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
  }

  const statusOptions = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
  const bookingStatusOptions = ['PENDING', 'CONFIRMED', 'CANCELLED']

  // ✅ orders with NO booking — food only / takeaway
const ordersOnly = orders.filter(order => !order.bookingId && !order.tableId)

  if (loading) return (
    <div className="adminorders-page">
      <Navbar />
      <div className="loading">Loading...</div>
    </div>
  )

  return (
    <div className="adminorders-page">
      <Navbar />
      <div className="adminorders-content">
        <h2>All Orders 🍛</h2>

        {/* ✅ 2 tab buttons with new names */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeTab === 'orders' ? '#6366f1' : '#e0e0e0',
              color: activeTab === 'orders' ? 'white' : '#555',
            }}
          >
            🍛 Orders Only ({ordersOnly.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: activeTab === 'bookings' ? '#6366f1' : '#e0e0e0',
              color: activeTab === 'bookings' ? 'white' : '#555',
            }}
          >
            🪑 Bookings & Orders ({bookings.length})
          </button>
        </div>

        {/* ✅ ORDERS ONLY TAB — no booking linked */}
        {activeTab === 'orders' && (
          <>
            {ordersOnly.length === 0 ? (
              <div className="orders-empty">No food only orders yet!</div>
            ) : (
              ordersOnly.map((order) => (
                <div key={order.id} className="order-card-admin">

                  <div className="order-card-admin-header">
                    <div className="order-customer">
                      <h4>Order #{order.id}</h4>
                      <p>👤 {order.user.name} ({order.user.email})</p>
                      {order.user.phone && <p>📞 {order.user.phone}</p>}
                      <p>📅 {formatDate(order.createdAt)}</p>
                      {order.tableId && <p>🪑 Table #{order.tableId}</p>}
                      {order.createdByAdmin && (
                        <p className="admin-created-badge">Created by Admin</p>
                      )}
                    </div>
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-card-admin-items">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        • {item.menuItem.name} x{item.quantity}
                        → ₹{item.price * item.quantity}
                      </p>
                    ))}
                  </div>

                  <div className="order-card-admin-footer">
                    <strong>Total: ₹{order.totalPrice}</strong>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
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
          </>
        )}

        {/* ✅ BOOKINGS & ORDERS TAB — bookings with or without linked order */}
        {activeTab === 'bookings' && (
          <>
            {bookings.length === 0 ? (
              <div className="orders-empty">No bookings yet!</div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="order-card-admin">

                  <div className="order-card-admin-header">
                    <div className="order-customer">
                      <h4>Booking #{booking.id}</h4>
                      <p>👤 {booking.user.name} ({booking.user.email})</p>
                      {booking.user.phone && <p>📞 {booking.user.phone}</p>}
                      <p>📅 Booked On: {formatDate(booking.createdAt)}</p>
                      <p>🗓️ Visit Date: {formatVisitDate(booking.date)}</p>
                      <p>⏰ Time Slot: {booking.timeSlot}</p>
                      <p>🪑 Table: {booking.table.tableNumber} — {booking.table.location}</p>
                      <p>👥 Guests: {booking.guestCount}</p>
                      {booking.createdByAdmin && (
                        <p className="admin-created-badge">Created by Admin</p>
                      )}
                    </div>
                    <span className={`booking-status status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* show linked order items if exists */}
                  {booking.order && (
                    <div className="order-card-admin-items">
                      <p style={{ fontWeight: '600', marginBottom: '6px' }}>
                        🍛 Order #{booking.order.id}:
                      </p>
                      {booking.order.items?.map((item) => (
                        <p key={item.id}>
                          • {item.menuItem.name} x{item.quantity}
                          → ₹{item.price * item.quantity}
                        </p>
                      ))}
                      <p style={{ marginTop: '6px', fontWeight: '600' }}>
                        Total: ₹{booking.order.totalPrice}
                      </p>
                    </div>
                  )}

                  <div className="order-card-admin-footer">
                    <strong>
                      {booking.order
                        ? `Order Total: ₹${booking.order.totalPrice}`
                        : 'Table Booking Only'}
                    </strong>
                    <select
                      className="status-select"
                      value={booking.status}
                      onChange={(e) =>
                        handleBookingStatusChange(booking.id, e.target.value)
                      }
                      disabled={
                        updating === booking.id ||
                        booking.status === 'CANCELLED'
                      }
                    >
                      {bookingStatusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {updating === booking.id && (
                      <span className="updating-text">Updating...</span>
                    )}
                  </div>

                </div>
              ))
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default AdminOrders
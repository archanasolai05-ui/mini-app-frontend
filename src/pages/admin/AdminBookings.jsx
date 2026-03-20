import { useState, useEffect } from 'react'
import {
  getAllBookings,
  updateBookingStatus,
  adminCreateBooking,
} from '../../services/bookingService'
import { getAllTables } from '../../services/tableService'
import { getAllMenuItems } from '../../services/menuService'
import { adminCreateOrder } from '../../services/orderService'
import Navbar from '../../components/Navbar'

function AdminBookings() {
  const [bookings, setBookings]   = useState([])
  const [tables, setTables]       = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  // ─── Book on Behalf modal ───────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData]   = useState({
    userId: '', tableId: '', date: '', timeSlot: '', guestCount: 1,
  })

  // ─── Take Order modal ───────────────────────────────
  const [showOrderModal, setShowOrderModal]   = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [orderItems, setOrderItems]           = useState([])
  // orderItems = [{ menuItemId, name, price, quantity }]

  const timeSlots = [
    '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',  '6:00 PM - 8:00 PM',
    '7:00 PM - 9:00 PM',  '8:00 PM - 10:00 PM',
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, tablesRes, menuRes] = await Promise.all([
        getAllBookings(),
        getAllTables(),
        getAllMenuItems(),
      ])
      setBookings(bookingsRes.data.filter(b => b.createdByAdmin === true))
      setTables(tablesRes.data)
      setMenuItems(menuRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ─── booking actions ────────────────────────────────
  const handleConfirm = async (id) => {
    setUpdating(id)
    try {
      await updateBookingStatus(id, 'CONFIRMED')
      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, status: 'CONFIRMED' } : b
      ))
    } catch (err) {
      alert('Failed to confirm booking')
    } finally {
      setUpdating(null)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setUpdating(id)
    try {
      await updateBookingStatus(id, 'CANCELLED')
      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, status: 'CANCELLED' } : b
      ))
    } catch (err) {
      alert('Failed to cancel booking')
    } finally {
      setUpdating(null)
    }
  }

  // ─── Book on Behalf form ────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAdminCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await adminCreateBooking({
        userId:     parseInt(formData.userId),
        tableId:    parseInt(formData.tableId),
        date:       formData.date,
        timeSlot:   formData.timeSlot,
        guestCount: parseInt(formData.guestCount),
      })
      setBookings([res.data.booking, ...bookings])
      setShowModal(false)
      setFormData({ userId: '', tableId: '', date: '', timeSlot: '', guestCount: 1 })
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setSaving(false)
    }
  }

  // ─── Take Order functions ───────────────────────────
  const openOrderModal = (booking) => {
    setSelectedBooking(booking)
    setOrderItems([])
    setError('')
    setShowOrderModal(true)
  }

  // add item to order or increase qty
  const handleAddItem = (menuItem) => {
    const existing = orderItems.find(i => i.menuItemId === menuItem.id)
    if (existing) {
      setOrderItems(orderItems.map(i =>
        i.menuItemId === menuItem.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        name:       menuItem.name,
        price:      menuItem.price,
        quantity:   1,
      }])
    }
  }

  // decrease qty or remove item
  const handleRemoveItem = (menuItemId) => {
    const existing = orderItems.find(i => i.menuItemId === menuItemId)
    if (existing.quantity === 1) {
      setOrderItems(orderItems.filter(i => i.menuItemId !== menuItemId))
    } else {
      setOrderItems(orderItems.map(i =>
        i.menuItemId === menuItemId
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ))
    }
  }

  // total price of order
  const orderTotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  )

  // submit order
  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      setError('Please add at least one item')
      return
    }
    setError('')
    setSaving(true)
    try {
      await adminCreateOrder({
        userId:    selectedBooking.user.id,
        tableId:   selectedBooking.table.id,
        bookingId: selectedBooking.id,
        items:     orderItems.map(i => ({
          menuItemId: i.menuItemId,
          quantity:   i.quantity,
        })),
      })
      // update booking locally to show it has order
      setBookings(bookings.map(b =>
        b.id === selectedBooking.id
          ? { ...b, order: true }
          : b
      ))
      setShowOrderModal(false)
      setSelectedBooking(null)
      setOrderItems([])
      alert('✅ Order placed successfully!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  // group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  if (loading) return (
    <div className="adminbookings-page">
      <Navbar />
      <div className="loading">Loading bookings...</div>
    </div>
  )

  return (
    <div className="adminbookings-page">
      <Navbar />
      <div className="adminbookings-content">

        <div className="adminbookings-header">
          <h2>Book on Behalf 🪑</h2>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Book on Behalf
          </button>
        </div>

        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '8px', padding: '12px 16px',
          marginBottom: '20px', fontSize: '0.9rem', color: '#1e40af',
        }}>
          ℹ️ This page shows only bookings created by Admin on behalf of customers.
          User bookings are shown in <strong>Orders & Bookings</strong> page.
        </div>

        {bookings.length === 0 ? (
          <div className="bookings-empty">
            No admin created bookings yet!
            <br />
            <span style={{ fontSize: '0.9rem', color: '#888' }}>
              Click "+ Book on Behalf" to create one
            </span>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card-admin">

              <div className="booking-card-admin-info">
                <h4>Booking #{booking.id}</h4>
                <p>👤 {booking.user.name} ({booking.user.email})</p>
                <p>🪑 Table {booking.table.tableNumber}
                  {booking.table.location && ` - ${booking.table.location}`}
                </p>
                <p>📅 Date: {formatDate(booking.date)}</p>
                <p>🕐 Time: {booking.timeSlot}</p>
                <p>👥 Guests: {booking.guestCount}</p>
                <p className="admin-created-badge">Created by Admin</p>
                {/* show if order already placed */}
                {booking.order && (
                  <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                    ✅ Order already placed
                  </p>
                )}
              </div>

              <div className="booking-card-admin-actions">
                <span className={`booking-status status-${booking.status}`}>
                  {booking.status}
                </span>

                {booking.status === 'PENDING' && (
                  <button
                    className="confirm-btn"
                    onClick={() => handleConfirm(booking.id)}
                    disabled={updating === booking.id}
                  >
                    {updating === booking.id ? '...' : 'Confirm'}
                  </button>
                )}

                {/* ✅ Take Order button — only for CONFIRMED and no order yet */}
                {booking.status === 'CONFIRMED' && !booking.order && (
                  <button
                    onClick={() => openOrderModal(booking)}
                    style={{
                      padding: '8px 16px',
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      marginTop: '8px',
                    }}
                  >
                    🍛 Take Order
                  </button>
                )}

                {booking.status !== 'CANCELLED' && (
                  <button
                    className="delete-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={updating === booking.id}
                  >
                    {updating === booking.id ? '...' : 'Cancel'}
                  </button>
                )}
              </div>

            </div>
          ))
        )}

        {/* ─── Book on Behalf Modal ─── */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Book on Behalf of User</h3>
              {error && <div className="modal-error">{error}</div>}
              <form onSubmit={handleAdminCreate} className="modal-form">
                <div className="form-group">
                  <label>User ID</label>
                  <input name="userId" type="number" value={formData.userId}
                    onChange={handleChange} placeholder="Enter user ID" required />
                  <small>Check user ID from database</small>
                </div>
                <div className="form-group">
                  <label>Select Table</label>
                  <select name="tableId" value={formData.tableId}
                    onChange={handleChange} required>
                    <option value="">Select table</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} (Capacity: {t.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input name="date" type="date" value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <select name="timeSlot" value={formData.timeSlot}
                    onChange={handleChange} required>
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Guests</label>
                  <input name="guestCount" type="number" value={formData.guestCount}
                    onChange={handleChange} min="1" required />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? 'Booking...' : 'Create Booking'}
                  </button>
                  <button type="button" className="cancel-btn"
                    onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Take Order Modal ─── */}
        {showOrderModal && selectedBooking && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3>🍛 Take Order for Booking #{selectedBooking.id}</h3>
              <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '16px' }}>
                👤 {selectedBooking.user.name} |
                🪑 Table {selectedBooking.table.tableNumber} |
                🕐 {selectedBooking.timeSlot}
              </p>

              {error && <div className="modal-error">{error}</div>}

              {/* Menu Items by Category */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>Select Items:</h4>
                {Object.entries(menuByCategory).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <p style={{
                      fontWeight: '700', fontSize: '0.85rem',
                      color: '#6366f1', marginBottom: '8px',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {category}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {items.filter(i => i.isAvailable).map((item) => {
                        const inOrder = orderItems.find(o => o.menuItemId === item.id)
                        return (
                          <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '8px 12px',
                            border: inOrder ? '2px solid #6366f1' : '1px solid #e5e7eb',
                            borderRadius: '8px', background: inOrder ? '#eff6ff' : 'white',
                          }}>
                            <div>
                              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                                {item.name}
                              </p>
                              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                                ₹{item.price}
                              </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {inOrder ? (
                                <>
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    style={{
                                      width: '28px', height: '28px',
                                      background: '#ef4444', color: 'white',
                                      border: 'none', borderRadius: '50%',
                                      cursor: 'pointer', fontWeight: '700', fontSize: '1rem'
                                    }}
                                  >−</button>
                                  <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                                    {inOrder.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleAddItem(item)}
                                    style={{
                                      width: '28px', height: '28px',
                                      background: '#10b981', color: 'white',
                                      border: 'none', borderRadius: '50%',
                                      cursor: 'pointer', fontWeight: '700', fontSize: '1rem'
                                    }}
                                  >+</button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleAddItem(item)}
                                  style={{
                                    padding: '4px 12px',
                                    background: '#6366f1', color: 'white',
                                    border: 'none', borderRadius: '6px',
                                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                                  }}
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              {orderItems.length > 0 && (
                <div style={{
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: '8px', padding: '16px', marginBottom: '16px'
                }}>
                  <h4 style={{ marginBottom: '12px' }}>Order Summary:</h4>
                  {orderItems.map(item => (
                    <div key={item.menuItemId} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.9rem', marginBottom: '6px'
                    }}>
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontWeight: '700', borderTop: '1px solid #e5e7eb',
                    paddingTop: '8px', marginTop: '8px'
                  }}>
                    <span>Total</span>
                    <span>₹{orderTotal}</span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={handlePlaceOrder}
                  disabled={saving || orderItems.length === 0}
                  style={{
                    padding: '10px 24px',
                    background: orderItems.length === 0 ? '#ccc' : '#6366f1',
                    color: 'white', border: 'none', borderRadius: '8px',
                    cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: '600', fontSize: '1rem'
                  }}
                >
                  {saving ? 'Placing Order...' : `✓ Place Order ₹${orderTotal}`}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { setShowOrderModal(false); setOrderItems([]); setError('') }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminBookings
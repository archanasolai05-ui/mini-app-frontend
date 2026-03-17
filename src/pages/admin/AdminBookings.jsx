import { useState, useEffect } from 'react'
import {
  getAllBookings,
  updateBookingStatus,
  adminCreateBooking,
} from '../../services/bookingService'
import { getAllTables } from '../../services/tableService'
import Navbar from '../../components/Navbar'

function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [tables, setTables]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  // Why this form?
  // Admin creates booking on behalf of walk-in customer
  // Admin needs userId, tableId, date, timeSlot, guestCount
  const [formData, setFormData] = useState({
    userId: '',
    tableId: '',
    date: '',
    timeSlot: '',
    guestCount: 1,
  })

  const timeSlots = [
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '6:00 PM - 8:00 PM',
    '7:00 PM - 9:00 PM',
    '8:00 PM - 10:00 PM',
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, tablesRes] = await Promise.all([
        getAllBookings(),
        getAllTables(),
      ])
      setBookings(bookingsRes.data)
      setTables(tablesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Why 2 separate functions for confirm and cancel?
  // Clearer code - admin knows exactly what action
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Why adminCreate?
  // Walk-in customer → admin creates booking for them
  // Admin sends userId so booking is linked to that user
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
      setFormData({
        userId: '', tableId: '',
        date: '', timeSlot: '', guestCount: 1,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

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
          <h2>All Bookings 🪑</h2>
          <button
            className="add-btn"
            onClick={() => setShowModal(true)}
          >
            + Book on Behalf
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bookings-empty">No bookings yet!</div>
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
                {booking.createdByAdmin && (
                  <p className="admin-created-badge">
                    Created by Admin
                  </p>
                )}
              </div>

              <div className="booking-card-admin-actions">
                <span className={`booking-status status-${booking.status}`}>
                  {booking.status}
                </span>

                {/* Why show buttons based on status?
                    Confirmed booking cant be confirmed again
                    Cancelled booking cant be cancelled again */}
                {booking.status === 'PENDING' && (
                  <button
                    className="confirm-btn"
                    onClick={() => handleConfirm(booking.id)}
                    disabled={updating === booking.id}
                  >
                    {updating === booking.id ? '...' : 'Confirm'}
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

        {/* Admin Create Booking Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Book on Behalf of User</h3>

              {error && (
                <div className="modal-error">{error}</div>
              )}

              <form
                onSubmit={handleAdminCreate}
                className="modal-form"
              >
                <div className="form-group">
                  <label>User ID</label>
                  <input
                    name="userId"
                    type="number"
                    value={formData.userId}
                    onChange={handleChange}
                    placeholder="Enter user ID"
                    required
                  />
                  <small>Check user ID from database</small>
                </div>

                <div className="form-group">
                  <label>Select Table</label>
                  <select
                    name="tableId"
                    value={formData.tableId}
                    onChange={handleChange}
                    required
                  >
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
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time Slot</label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Guests</label>
                  <input
                    name="guestCount"
                    type="number"
                    value={formData.guestCount}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving ? 'Booking...' : 'Create Booking'}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AdminBookings
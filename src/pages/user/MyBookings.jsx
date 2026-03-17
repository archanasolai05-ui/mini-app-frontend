import { useState, useEffect } from 'react'
import { getMyBookings, cancelBooking } from '../../services/bookingService'
import Navbar from '../../components/Navbar'

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings()
      setBookings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return

    setCancelling(id)
    try {
      await cancelBooking(id)
      setBookings(bookings.map((b) =>
        b.id === id ? { ...b, status: 'CANCELLED' } : b
      ))
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed')
    } finally {
      setCancelling(null)
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
    <div className="mybookings-page">
      <Navbar />
      <div className="loading">Loading bookings...</div>
    </div>
  )

  return (
    <div className="mybookings-page">
      <Navbar />
      <div className="mybookings-content">
        <h2>My Bookings 🪑</h2>

        {bookings.length === 0 ? (
          <div className="bookings-empty">
            <p>No bookings yet!</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-info">
                <h4>Table {booking.table.tableNumber}</h4>
                <p>📅 Date: {formatDate(booking.date)}</p>
                <p>🕐 Time: {booking.timeSlot}</p>
                <p>👥 Guests: {booking.guestCount}</p>
                {booking.table.location && (
                  <p>📍 Location: {booking.table.location}</p>
                )}
              </div>

              <div className="booking-actions">
                <span className={`booking-status status-${booking.status}`}>
                  {booking.status}
                </span>
                {booking.status !== 'CANCELLED' && (
                  <button
                    className="cancel-booking-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyBookings
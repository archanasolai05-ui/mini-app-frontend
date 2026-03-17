import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailableTables } from '../../services/tableService'
import { createBooking } from '../../services/bookingService'
import Navbar from '../../components/Navbar'

function BookTable() {
  const navigate = useNavigate()

  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedTable, setSelectedTable] = useState(null)

  const [formData, setFormData] = useState({
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
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await getAvailableTables()
      setTables(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedTable) {
      setError('Please select a table first!')
      return
    }

    setSubmitting(true)

    try {
      await createBooking({
        tableId: selectedTable.id,
        date: formData.date,
        timeSlot: formData.timeSlot,
        guestCount: parseInt(formData.guestCount),
      })

      setSuccess('Table booked successfully! 🎉')
      setTimeout(() => navigate('/my-bookings'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="booktable-page">
      <Navbar />
      <div className="loading">Loading tables...</div>
    </div>
  )

  return (
    <div className="booktable-page">
      <Navbar />
      <div className="booktable-content">
        <h2>Book a Table 🪑</h2>

        {error   && <div className="booktable-error">{error}</div>}
        {success && <div className="booktable-success">{success}</div>}

        {/* Tables Grid */}
        <div className="booktable-section">
          <h3>Select a Table</h3>
          <div className="tables-grid">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''}`}
                onClick={() => setSelectedTable(table)}
              >
                <h4>Table {table.tableNumber}</h4>
                <p>👥 Capacity: {table.capacity}</p>
                {table.location && (
                  <p>📍 {table.location}</p>
                )}
                {selectedTable?.id === table.id && (
                  <p className="selected-label">✓ Selected</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booktable-form">
          <h3>Booking Details</h3>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
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
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Number of Guests</label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              max={selectedTable?.capacity || 10}
              required
            />
            {selectedTable && (
              <small>Max capacity: {selectedTable.capacity} guests</small>
            )}
          </div>

          <button
            type="submit"
            className="book-btn"
            disabled={submitting}
          >
            {submitting ? 'Booking...' : '✓ Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookTable
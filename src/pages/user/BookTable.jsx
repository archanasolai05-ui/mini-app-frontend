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

  // ✅ FIX: when table is selected, reset guestCount to 1
  const handleTableSelect = (table) => {
    setSelectedTable(table)
    setFormData((prev) => ({ ...prev, guestCount: 1 }))
    // reset guestCount to 1 whenever new table is selected
    // so old value does not exceed new table capacity
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedTable) {
      setError('Please select a table first!')
      return
    }

    // ✅ FIX: extra check — guestCount cannot exceed selected table capacity
    if (parseInt(formData.guestCount) > selectedTable.capacity) {
      setError(`Guest count cannot exceed table capacity of ${selectedTable.capacity}`)
      return
    }

    // ✅ FIX: guestCount must be at least 1
    if (parseInt(formData.guestCount) < 1) {
      setError('Guest count must be at least 1')
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

          {/* ✅ FIX: show message to select table first */}
          {!selectedTable && (
            <p style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '0.9rem' }}>
              ⚠️ Please select a table before filling the booking details
            </p>
          )}

          <div className="tables-grid">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''}`}
                onClick={() => handleTableSelect(table)}
                // ✅ FIX: changed onClick to use handleTableSelect
                // which also resets guestCount to 1
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
              // ✅ FIX: disable until table is selected
              disabled={!selectedTable}
              style={{ opacity: !selectedTable ? 0.5 : 1, cursor: !selectedTable ? 'not-allowed' : 'pointer' }}
            />
          </div>

          <div className="form-group">
            <label>Time Slot</label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              required
              // ✅ FIX: disable until table is selected
              disabled={!selectedTable}
              style={{ opacity: !selectedTable ? 0.5 : 1, cursor: !selectedTable ? 'not-allowed' : 'pointer' }}
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
              // ✅ FIX: max is ONLY table capacity — no fallback 10
              // if no table selected → input is disabled anyway
              max={selectedTable ? selectedTable.capacity : undefined}
              required
              // ✅ FIX: disable until table is selected
              disabled={!selectedTable}
              style={{ opacity: !selectedTable ? 0.5 : 1, cursor: !selectedTable ? 'not-allowed' : 'pointer' }}
            />
            {/* ✅ FIX: show capacity info clearly */}
            {selectedTable ? (
              <small style={{ color: '#6b7280' }}>
                Max capacity: {selectedTable.capacity} guests
              </small>
            ) : (
              <small style={{ color: '#f59e0b' }}>
                Select a table to see capacity
              </small>
            )}
          </div>

          <button
            type="submit"
            className="book-btn"
            // ✅ FIX: disable if no table selected OR submitting
            disabled={submitting || !selectedTable}
            style={{ opacity: !selectedTable ? 0.6 : 1 }}
          >
            {submitting ? 'Booking...' : '✓ Confirm Booking'}
          </button>

          {/* ✅ FIX: show hint if table not selected */}
          {!selectedTable && (
            <p style={{ textAlign: 'center', color: '#f59e0b', marginTop: '8px', fontSize: '0.85rem' }}>
              Select a table above to enable booking
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

export default BookTable
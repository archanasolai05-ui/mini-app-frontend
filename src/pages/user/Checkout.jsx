import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartSlice'
import { createOrder } from '../../services/orderService'
import { getAllTables } from '../../services/tableService'
import Navbar from '../../components/Navbar'

// ✅ Same time slots as BookTable page
const timeSlots = [
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
  '6:00 PM - 8:00 PM',
  '7:00 PM - 9:00 PM',
  '8:00 PM - 10:00 PM',
]

function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalPrice } = useSelector((state) => state.cart)

  const [tables, setTables]               = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState('')

  const [bookingDetails, setBookingDetails] = useState({
    date:       '',
    timeSlot:   '',
    guestCount: 1,
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await getAllTables()
      setTables(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/menu')
    return null
  }

  const handleBookingChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value })
  }

  const handlePlaceOrder = async () => {
    setError('')

    if (selectedTable) {
      if (!bookingDetails.date) {
        setError('Please select a date for your table booking')
        return
      }
      if (!bookingDetails.timeSlot) {
        setError('Please select a time slot for your table booking')
        return
      }
    }

    setSubmitting(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity:   item.quantity,
        })),
        tableId: selectedTable ? selectedTable.id : undefined,

        ...(selectedTable && {
          date:       bookingDetails.date,
          timeSlot:   bookingDetails.timeSlot,
          guestCount: parseInt(bookingDetails.guestCount),
        }),
      }

      await createOrder(orderData)
      dispatch(clearCart())
      navigate('/my-orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-content">
        <h2>Checkout 🧾</h2>

        {error && <div className="checkout-error">{error}</div>}

        <div className="checkout-layout">

          {/* Order Items */}
          <div className="checkout-items">
            <h3>Your Order</h3>
            {items.map((item) => (
              <div key={item.id} className="checkout-item-row">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="checkout-total">
              <span>Total Amount</span>
              <span>₹{totalPrice}</span>
            </div>
          </div>

          {/* Table Selection */}
          <div className="checkout-form">
            <h3>Select Table</h3>

            {loading ? (
              <p style={{ color: '#888' }}>Loading tables...</p>
            ) : (
              <>
                {/* Takeaway option */}
                <div
                  className={`checkout-table-card ${selectedTable === null ? 'selected' : ''}`}
                  onClick={() => setSelectedTable(null)}
                >
                  <span>🥡 Takeaway</span>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    No table needed
                  </span>
                  {selectedTable === null && (
                    <span className="checkout-selected-badge">✓ Selected</span>
                  )}
                </div>

                {/* Available tables */}
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className={`checkout-table-card ${selectedTable?.id === table.id ? 'selected' : ''} ${!table.isAvailable ? 'disabled' : ''}`}
                    onClick={() => table.isAvailable && setSelectedTable(table)}
                  >
                    <span>🪑 Table {table.tableNumber}</span>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      Capacity: {table.capacity}
                      {table.location && ` • ${table.location}`}
                    </span>
                    {!table.isAvailable && (
                      <span style={{ color: '#e74c3c', fontSize: '0.75rem' }}>
                        Unavailable
                      </span>
                    )}
                    {selectedTable?.id === table.id && (
                      <span className="checkout-selected-badge">✓ Selected</span>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* Booking details when table selected */}
            {selectedTable && (
              <div className="checkout-booking-details">
                <h4>📅 Booking Details for Table {selectedTable.tableNumber}</h4>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingDetails.date}
                    onChange={handleBookingChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time Slot</label>
                  {/* ✅ ONLY CHANGE — added style to match date input */}
                  <select
                    name="timeSlot"
                    value={bookingDetails.timeSlot}
                    onChange={handleBookingChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1.5px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      color: bookingDetails.timeSlot ? '#2c3e50' : '#9ca3af',
                      background: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                    }}
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
                    value={bookingDetails.guestCount}
                    onChange={handleBookingChange}
                    min="1"
                    max={selectedTable.capacity}
                    required
                  />
                  <small>Max capacity: {selectedTable.capacity} guests</small>
                </div>
              </div>
            )}

            {/* Show selected info */}
            {selectedTable && (
              <div className="checkout-selected-info">
                ✅ Table {selectedTable.tableNumber} selected
                ({selectedTable.location})
              </div>
            )}

            {!selectedTable && (
              <div className="checkout-selected-info takeaway">
                🥡 Takeaway order selected
              </div>
            )}

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : '✓ Place Order'}
            </button>

            <button
              className="back-btn"
              onClick={() => navigate('/cart')}
            >
              ← Back to Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Checkout
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartSlice'
import { createOrder } from '../../services/orderService'
import { getAllTables } from '../../services/tableService'
import Navbar from '../../components/Navbar'

function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalPrice } = useSelector((state) => state.cart)

  const [tables, setTables]         = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

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

  const handlePlaceOrder = async () => {
    setError('')
    setSubmitting(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity:   item.quantity,
        })),
        tableId: selectedTable ? selectedTable.id : undefined,
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

            {/* Show selected table info */}
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
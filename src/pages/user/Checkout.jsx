import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { clearCart } from '../../redux/slices/cartSlice'
import { createOrder } from '../../services/orderService'
import Navbar from '../../components/Navbar'

function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalPrice } = useSelector((state) => state.cart)

  const [tableId, setTableId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if cart is empty
  if (items.length === 0) {
    navigate('/menu')
    return null
  }

  const handlePlaceOrder = async () => {
    setError('')
    setLoading(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
        tableId: tableId ? parseInt(tableId) : undefined,
      }

      await createOrder(orderData)
      dispatch(clearCart())
      navigate('/my-orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
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
            <h3>Table Details</h3>
            <div className="form-group">
              <label>Table Number (optional)</label>
              <input
                type="number"
                placeholder="Enter table number"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
              />
              <small>Leave empty for takeaway</small>
            </div>

            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : '✓ Place Order'}
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
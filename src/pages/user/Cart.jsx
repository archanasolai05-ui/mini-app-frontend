import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  removeFromCart,
  increaseQty,
  decreaseQty,
} from '../../redux/slices/cartSlice'
import Navbar from '../../components/Navbar'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, totalPrice } = useSelector((state) => state.cart)

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <Navbar />
        <div className="cart-content">
          <h2 className="cart-title">🛒 Your Cart</h2>
          <div className="cart-empty">
            <p>Your cart is empty!</p>
            <Link to="/menu">Browse Menu →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-content">
        <h2 className="cart-title">🛒 Your Cart</h2>

        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>₹{item.price} each</p>
              </div>

              <div className="cart-item-controls">
                <button
                  className="qty-btn"
                  onClick={() => dispatch(decreaseQty(item.id))}
                >
                  −
                </button>
                <span className="qty-count">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => dispatch(increaseQty(item.id))}
                >
                  +
                </button>
              </div>

              <div className="cart-item-total">
                ₹{item.price * item.quantity}
              </div>

              <button
                className="remove-btn"
                onClick={() => dispatch(removeFromCart(item.id))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.id} className="summary-row">
              <span>{item.name} x{item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart
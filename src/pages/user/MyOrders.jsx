import { useState, useEffect } from 'react'
import { getMyOrders } from '../../services/orderService'
import Navbar from '../../components/Navbar'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders()
      setOrders(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

  if (loading) return (
    <div className="orders-page">
      <Navbar />
      <div className="loading">Loading orders...</div>
    </div>
  )

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-content">
        <h2>My Orders 📋</h2>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>No orders yet!</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <span className={`order-status status-${order.status}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span>{item.menuItem.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyOrders
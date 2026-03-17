import { useState, useEffect } from 'react'
import { getAllOrders } from '../../services/orderService'
import { getAllBookings } from '../../services/bookingService'
import { getAllMenuItems } from '../../services/menuService'
import { getAllTables } from '../../services/tableService'
import Navbar from '../../components/Navbar'

function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBookings: 0,
    totalMenuItems: 0,
    totalTables: 0,
    pendingOrders: 0,
    pendingBookings: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [orders, bookings, menu, tables] = await Promise.all([
        getAllOrders(),
        getAllBookings(),
        getAllMenuItems(),
        getAllTables(),
      ])

      setStats({
        totalOrders:    orders.data.length,
        totalBookings:  bookings.data.length,
        totalMenuItems: menu.data.length,
        totalTables:    tables.data.length,
        pendingOrders:  orders.data.filter((o) => o.status === 'PENDING').length,
        pendingBookings: bookings.data.filter((b) => b.status === 'PENDING').length,
      })

      setRecentOrders(orders.data.slice(0, 5))
      setRecentBookings(bookings.data.slice(0, 5))
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) return (
    <div className="dashboard-page">
      <Navbar />
      <div className="loading">Loading dashboard...</div>
    </div>
  )

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <h2>Admin Dashboard 📊</h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍛</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🪑</div>
            <div className="stat-info">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.pendingBookings}</h3>
              <p>Pending Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-info">
              <h3>{stats.totalMenuItems}</h3>
              <p>Menu Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-info">
              <h3>{stats.totalTables}</h3>
              <p>Tables</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-section">
          <h3>Recent Orders</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.user.name}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    <span className={`order-status status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Bookings */}
        <div className="recent-section">
          <h3>Recent Bookings</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Table</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.user.name}</td>
                  <td>Table {booking.table.tableNumber}</td>
                  <td>{formatDate(booking.date)}</td>
                  <td>
                    <span className={`booking-status status-${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
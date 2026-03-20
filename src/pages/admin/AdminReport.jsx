import { useState, useEffect } from 'react'
import { getAllOrders } from '../../services/orderService'
import { getAllBookings } from '../../services/bookingService'
import Navbar from '../../components/Navbar'

function AdminReport() {
  const [orders, setOrders]     = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        getAllOrders(),
        getAllBookings(),
      ])
      setOrders(ordersRes.data)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ─── CALCULATIONS ─────────────────────────────────────

  const ordersOnly       = orders.filter(o => !o.bookingId && !o.tableId)
  const tableBookingOnly = bookings.filter(b => !b.order)
  const bookingWithOrder = bookings.filter(b => b.order)

  // 1. Orders Only status — tracks FOOD order status
  const orderStatusCount = {
    PENDING:   ordersOnly.filter(o => o.status === 'PENDING').length,
    PREPARING: ordersOnly.filter(o => o.status === 'PREPARING').length,
    READY:     ordersOnly.filter(o => o.status === 'READY').length,
    DELIVERED: ordersOnly.filter(o => o.status === 'DELIVERED').length,
    CANCELLED: ordersOnly.filter(o => o.status === 'CANCELLED').length,
  }

  // 2. Table Booking Only — tracks RESERVATION status
  const tableOnlyStatusCount = {
    PENDING:   tableBookingOnly.filter(b => b.status === 'PENDING').length,
    CONFIRMED: tableBookingOnly.filter(b => b.status === 'CONFIRMED').length,
    CANCELLED: tableBookingOnly.filter(b => b.status === 'CANCELLED').length,
  }

  // ✅ 3. Booking + Order — tracks FOOD ORDER status (not booking status)
  // because food is being prepared in kitchen
  const bookingOrderStatusCount = {
    PENDING:   bookingWithOrder.filter(b => b.order?.status === 'PENDING').length,
    PREPARING: bookingWithOrder.filter(b => b.order?.status === 'PREPARING').length,
    READY:     bookingWithOrder.filter(b => b.order?.status === 'READY').length,
    DELIVERED: bookingWithOrder.filter(b => b.order?.status === 'DELIVERED').length,
    CANCELLED: bookingWithOrder.filter(b => b.order?.status === 'CANCELLED').length,
  }

  // 4. Most ordered items
  const itemCount = {}
  orders.forEach(order => {
    order.items?.forEach(item => {
      const name = item.menuItem?.name
      if (name) itemCount[name] = (itemCount[name] || 0) + item.quantity
    })
  })
  const topItems = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // 5. Total revenue
  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  const deliveredRevenue = orders
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  // 6. Category counts
  const categoryCount = {}
  orders.forEach(order => {
    order.items?.forEach(item => {
      const cat = item.menuItem?.category || 'Unknown'
      categoryCount[cat] = (categoryCount[cat] || 0) + item.quantity
    })
  })
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])

  // 7. Most active customers
  const customerCount = {}
  orders.forEach(order => {
    const name = order.user?.name
    if (name) customerCount[name] = (customerCount[name] || 0) + 1
  })
  const topCustomers = Object.entries(customerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // 8. Most booked tables
  const tableCount = {}
  bookings.forEach(booking => {
    const tableNum = `Table ${booking.table?.tableNumber}`
    if (tableNum) tableCount[tableNum] = (tableCount[tableNum] || 0) + 1
  })
  const topTables = Object.entries(tableCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const maxItem     = topItems[0]?.[1] || 1
  const maxCategory = topCategories[0]?.[1] || 1
  const maxCustomer = topCustomers[0]?.[1] || 1
  const maxTable    = topTables[0]?.[1] || 1

  const statusColors = {
    PENDING:   '#f59e0b',
    PREPARING: '#3b82f6',
    READY:     '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
    CONFIRMED: '#10b981',
  }

  // reusable bar component
  const StatusBar = ({ status, count, total, color }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600', color }}>{status}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{count}</span>
      </div>
      <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
        <div style={{
          width: `${total ? (count / total) * 100 : 0}%`,
          background: color,
          height: '100%',
          borderRadius: '999px',
          transition: 'width 0.5s ease'
        }} />
      </div>
    </div>
  )

  if (loading) return (
    <div className="dashboard-page">
      <Navbar />
      <div className="loading">Loading report...</div>
    </div>
  )

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <h2>Analytics Report 📈</h2>

        {/* ─── REVENUE CARDS ─── */}
        <div className="stats-grid" style={{ marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{totalRevenue}</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>₹{deliveredRevenue}</h3>
              <p>Delivered Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🍛</div>
            <div className="stat-info">
              <h3>{ordersOnly.length}</h3>
              <p>Orders Only</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🪑</div>
            <div className="stat-info">
              <h3>{bookings.length}</h3>
              <p>Bookings & Orders</p>
            </div>
          </div>
        </div>

        {/* ─── 3 STATUS BREAKDOWNS ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* Orders Only — food order status */}
          <div className="recent-section">
            <h3 style={{ color: '#6366f1', borderBottom: '2px solid #6366f1', paddingBottom: '8px', marginBottom: '16px' }}>
              📦 Orders Only Status
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px' }}>
              Total: {ordersOnly.length} orders
            </p>
            {Object.entries(orderStatusCount).map(([status, count]) => (
              <StatusBar key={status} status={status} count={count}
                total={ordersOnly.length} color={statusColors[status]} />
            ))}
          </div>

          {/* Table Booking Only — reservation status */}
          <div className="recent-section">
            <h3 style={{ color: '#8b5cf6', borderBottom: '2px solid #8b5cf6', paddingBottom: '8px', marginBottom: '16px' }}>
              🪑 Table Booking Only
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px' }}>
              Total: {tableBookingOnly.length} bookings
            </p>
            {Object.entries(tableOnlyStatusCount).map(([status, count]) => (
              <StatusBar key={status} status={status} count={count}
                total={tableBookingOnly.length} color={statusColors[status]} />
            ))}
          </div>

          {/* ✅ Booking + Order — FOOD ORDER status */}
          <div className="recent-section">
            <h3 style={{ color: '#f59e0b', borderBottom: '2px solid #f59e0b', paddingBottom: '8px', marginBottom: '16px' }}>
              🍛 Booking + Order
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>
              Total: {bookingWithOrder.length} bookings
            </p>
            <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '12px' }}>
              * shows food order status
            </p>
            {Object.entries(bookingOrderStatusCount).map(([status, count]) => (
              <StatusBar key={status} status={status} count={count}
                total={bookingWithOrder.length} color={statusColors[status]} />
            ))}
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* ─── TOP ORDERED ITEMS ─── */}
          <div className="recent-section">
            <h3>🏆 Most Ordered Items</h3>
            {topItems.length === 0 ? (
              <p style={{ color: '#888' }}>No data yet</p>
            ) : (
              topItems.map(([name, count], index) => (
                <div key={name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} {name}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6366f1' }}>
                      {count} orders
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxItem) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      height: '100%', borderRadius: '999px', transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─── TOP CATEGORIES ─── */}
          <div className="recent-section">
            <h3>🍽️ Orders by Category</h3>
            {topCategories.length === 0 ? (
              <p style={{ color: '#888' }}>No data yet</p>
            ) : (
              topCategories.map(([category, count]) => (
                <div key={category} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{category}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f59e0b' }}>
                      {count} items
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxCategory) * 100}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                      height: '100%', borderRadius: '999px', transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

          {/* ─── TOP CUSTOMERS ─── */}
          <div className="recent-section">
            <h3>👤 Most Active Customers</h3>
            {topCustomers.length === 0 ? (
              <p style={{ color: '#888' }}>No data yet</p>
            ) : (
              topCustomers.map(([name, count], index) => (
                <div key={name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      {index === 0 ? '⭐' : '👤'} {name}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>
                      {count} orders
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxCustomer) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                      height: '100%', borderRadius: '999px', transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ─── TOP TABLES ─── */}
          <div className="recent-section">
            <h3>🪑 Most Booked Tables</h3>
            {topTables.length === 0 ? (
              <p style={{ color: '#888' }}>No data yet</p>
            ) : (
              topTables.map(([table, count], index) => (
                <div key={table} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                      {index === 0 ? '🏆' : '🪑'} {table}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#8b5cf6' }}>
                      {count} bookings
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / maxTable) * 100}%`,
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                      height: '100%', borderRadius: '999px', transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* ─── ORDERS ONLY SUMMARY TABLE ─── */}
        <div className="recent-section">
          <h3>📋 Orders Only Summary</h3>
          <table className="recent-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(orderStatusCount).map(([status, count]) => (
                <tr key={status}>
                  <td>
                    <span className={`order-status status-${status}`}>
                      {status}
                    </span>
                  </td>
                  <td><strong>{count}</strong></td>
                  <td>
                    {ordersOnly.length
                      ? `${((count / ordersOnly.length) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid #e0e0e0' }}>
                <td><strong>Total</strong></td>
                <td><strong>{ordersOnly.length}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

export default AdminReport
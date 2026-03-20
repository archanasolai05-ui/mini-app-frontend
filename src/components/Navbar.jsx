import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../redux/slices/authSlice'
import { clearCart } from '../redux/slices/cartSlice'

function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/menu'}>
          🍽️ Mini Dine-In
        </Link>
      </div>

      <div className="navbar-links">
        {user?.role === 'ADMIN' ? (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/menu">Menu</Link>
            <Link to="/admin/tables">Tables</Link>
            {/* ✅ Orders & Bookings now has Book on Behalf + Take Order inside */}
            <Link to="/admin/orders">Orders & Bookings</Link>
            {/* ✅ REMOVED separate Book on Behalf link */}
            <Link to="/admin/report">Reports</Link>
          </>
        ) : (
          <>
            <Link to="/menu">Menu</Link>
            <Link to="/my-orders">My Orders</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/cart" className="cart-link">
              🛒 Cart
              {items.length > 0 && (
                <span className="cart-badge">{items.length}</span>
              )}
            </Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <span>👤 {user?.name}</span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
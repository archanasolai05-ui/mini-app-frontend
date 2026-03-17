import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setCredentials } from '../../redux/slices/authSlice'
import { loginUser } from '../../services/authService'

function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginUser(formData)
      dispatch(setCredentials({
        user: res.data.user,
        token: res.data.token,
      }))
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/menu')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">

        <div className="auth-header">
          <h1>🍽️ Mini Dine-In</h1>
          <p>Welcome back! Please login to continue</p>
        </div>

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '14px',
                cursor: 'pointer',
                fontSize: '1rem',
                color: '#aaa',
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>

        </form>

        <div className="auth-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>

      </div>
    </div>
  )
}

export default Login
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Ticket, Bell, Shield } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import tcLogo from '../../styles/TuloClicksLogo.png'
import '../../styles/Login.css'
import api from '../../services/api'

function Login() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      })

      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim().toLowerCase())
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      addToast(`Welcome back, ${user.name}!`, 'success')

      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'organizer') navigate('/organizer')
      else navigate('/home')

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Left panel ── */}
      <div className="login-left-panel">
        <div className="login-left-bg" />
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <div className="login-left-brand">
            <img className="login-left-brand-mark" src={tcLogo} alt="TuloClicks" />
            <span className="login-left-brand-name">TuloClicks</span>
          </div>

          <div className="login-left-body">
            <h2 className="login-left-headline">
              Your Next<br />Unforgettable<br />Experience<br />Awaits.
            </h2>
            <p className="login-left-sub">
              Join thousands of event-goers who discover, book,
              and enjoy events through TuloClicks.
            </p>
            <ul className="login-left-perks">
              <li><Ticket size={15} /> 500+ curated events every month</li>
              <li><Bell size={15} /> Instant ticket & reminder notifications</li>
              <li><Shield size={15} /> Secure, hassle-free booking</li>
            </ul>
          </div>

          <div className="login-left-testimonial">
            <p className="login-testimonial-quote">
              "TuloClicks made event discovery so easy — I found my favorite festival through it!"
            </p>
            <span className="login-testimonial-author">— Maria Santos, Event Enthusiast</span>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="login-right-panel">
        <div className="login-form-wrap">
          <button className="login-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div className="login-form-header">
            <h2>Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                required
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label>Password</label>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="login-form-footer">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <span
                className="login-forgot"
                onClick={() => addToast('Please contact admin to reset password', 'info')}
              >
                Forgot Password?
              </span>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="signup-link">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign Up</span>
          </p>
        </div>
      </div>

    </div>
  )
}

export default Login

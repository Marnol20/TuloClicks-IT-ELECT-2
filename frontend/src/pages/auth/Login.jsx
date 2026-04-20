import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import '../../styles/Login.css'
import { loginUser } from '../../services/auth'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordPasted, setPasswordPasted] = useState(false)

  const handlePasswordPaste = (e) => {
    e.preventDefault()
    setPasswordPasted(true)
    setError('❌ Password must be typed, not pasted. Please clear and type your password manually.')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (passwordPasted) {
      setError('❌ Password must be typed, not pasted. Please clear and type your password manually.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const user = await loginUser(email, password)

      // role-based redirect
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'organizer') {
        navigate('/organizer')
      } else {
        navigate('/home')
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setPasswordPasted(false)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand-outside">
          <div className="brand-mark-outside logo-mark-hover">TC</div>
          <div className="brand-outside-text">
            <div className="brand-name-outside">Event Management</div>
            <div className="brand-tagline-outside">Powered by TuloClicks</div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-body">
            <button
              className="login-back-btn"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>

            <p className="brand-description">
              Launch, manage, and grow your events with TuloClicks. From ticketing and attendee tracking to organizer workflows, our platform turns every event into an experience.
            </p>

            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account to continue</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  onPaste={handlePasswordPaste}
                />
              </div>

              {error && <p className="login-error">{error}</p>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="signup-link">
              Don’t have an account?{' '}
              <span onClick={() => navigate('/signup')}>
                Sign Up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
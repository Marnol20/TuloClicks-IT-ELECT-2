import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, Calendar } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import tcLogo from '../../styles/TuloClicksLogo.png'
import '../../styles/SignUp.css'
import api from '../../services/api'

function SignUp() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  function calculatePasswordStrength(pass) {
    let strength = 0
    if (pass.length >= 8) strength++
    if (pass.length >= 12) strength++
    if (/[A-Z]/.test(pass)) strength++
    if (/[a-z]/.test(pass)) strength++
    if (/[0-9]/.test(pass)) strength++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) strength++
    return Math.min(4, Math.ceil(strength / 1.5))
  }

  function getPasswordStrengthLabel(strength) {
    switch (strength) {
      case 0: return { text: 'No Password', color: '#9ca3af' }
      case 1: return { text: 'Weak Password', color: '#ef4444' }
      case 2: return { text: 'Fair Password', color: '#f59e0b' }
      case 3: return { text: 'Good Password', color: '#eab308' }
      case 4: return { text: 'Strong Password', color: '#22c55e' }
      default: return { text: 'No Password', color: '#9ca3af' }
    }
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const phoneRegex = /^09\d{9}$/

    if (!name || !email || !password || !confirmPassword || !phone) {
      setError('Please fill in all required fields')
      return
    }

    if (!phoneRegex.test(phone)) {
      setError('Phone number must be 11 digits starting with 09 (e.g. 09123456789)')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 4) {
      setError('Password must be Strong (uppercase, lowercase, numbers, and special characters)')
      return
    }

    try {
      setLoading(true)
      setError('')

      // 1. Create the account
      await api.post('/auth/signup', { name, email, phone, password })

      // 2. Notify success
      addToast('Account created successfully! Please sign in.', 'success')

      // 3. Redirect to Login page (Updated Fix)
      navigate('/login')

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">

      {/* ── Left panel ── */}
      <div className="signup-left-panel">
        <div className="signup-left-bg" />
        <div className="signup-left-overlay" />
        <div className="signup-left-content">
          <div className="signup-left-brand">
            <img className="signup-left-brand-mark" src={tcLogo} alt="TuloClicks" />
            <span className="signup-left-brand-name">TuloClicks</span>
          </div>

          <div className="signup-left-body">
            <h2 className="signup-left-headline">
              Start Your<br />Event Journey<br />Today.
            </h2>
            <p className="signup-left-sub">
              Create your free account and unlock access to hundreds of
              events happening near you.
            </p>
            <div className="signup-feature-cards">
              <div className="signup-feature-card">
                <Star size={18} />
                <div>
                  <strong>Curated Events</strong>
                  <span>Handpicked events across all categories</span>
                </div>
              </div>
              <div className="signup-feature-card">
                <MapPin size={18} />
                <div>
                  <strong>Local & Online</strong>
                  <span>Physical, online, and hybrid events</span>
                </div>
              </div>
              <div className="signup-feature-card">
                <Calendar size={18} />
                <div>
                  <strong>Easy Management</strong>
                  <span>Manage all your tickets in one place</span>
                </div>
              </div>
            </div>
          </div>

          <div className="signup-left-event-preview">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
              alt="Event preview"
              className="signup-preview-img"
            />
            <div className="signup-preview-badge">
              <span className="signup-preview-dot" />
              Live events available now
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="signup-right-panel">
        <div className="signup-form-wrap">
          <button className="signup-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div className="signup-form-header">
            <h2>Create Account</h2>
            <p>Sign up to start using TuloClicks</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="form-input"
                type="text"
                placeholder="09XXXXXXXXX"
                value={phone}
                maxLength={11}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
              />
              {password && (
                <div className="password-strength-container">
                  <div className="password-strength-bars">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`strength-bar ${bar <= passwordStrength ? 'active' : ''}`}
                        style={{ backgroundColor: bar <= passwordStrength ? getPasswordStrengthLabel(passwordStrength).color : undefined }}
                      />
                    ))}
                  </div>
                  <span className="password-strength-text" style={{ color: getPasswordStrengthLabel(passwordStrength).color }}>
                    {getPasswordStrengthLabel(passwordStrength).text}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
              />
            </div>

            {error && <p className="signup-error">{error}</p>}

            <button type="submit" className="signup-submit-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="login-link">
            Already have an account?{' '}
            <span onClick={() => navigate('/login')}>Sign In</span>
          </p>
        </div>
      </div>

    </div>
  )
}

export default SignUp
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, Ticket, Bell, Shield, AlertTriangle } from 'lucide-react'
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

  // NEW: State arrays configured for full blocking overlays and verification controls
  const [showBlockingModal, setShowBlockingModal] = useState(false)
  const [showOtpVerification, setShowOtpVerification] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')

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
      setShowBlockingModal(true) // NEW: Trigger modal display on form input error
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
      
      // NEW: Intercept explicit verification blocks to switch forms cleanly
      if (err.response?.data?.requiresVerification) {
        setVerificationEmail(email.trim().toLowerCase())
        setShowOtpVerification(true)
      } else {
        setShowBlockingModal(true) // NEW: Trigger structural screen-wide alert overlay
      }
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  // NEW: Controller processing function for active OTP code submissions
  async function handleVerifyOtp(e) {
    e.preventDefault()
    if (!otpCode) return

    try {
      setLoading(true)
      await api.post('/auth/verify-otp', {
        email: verificationEmail,
        otp: otpCode
      })
      addToast('Email verified successfully! You can now sign in.', 'success')
      setShowOtpVerification(false)
      setShowBlockingModal(false)
      setError('')
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed.'
      setError(msg)
      setShowBlockingModal(true)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const userEmail = window.prompt("Enter your registered email to notify admin:");
    
    if (userEmail) {
      try {
        const res = await api.post('/auth/forgot-password', { email: userEmail });
        addToast(res.data.message, 'success');
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Failed to notify admin'
        setError(errorMsg)
        setShowBlockingModal(true)
      }
    }
  }

  return (
    <div className="login-page">
      {/* NEW: Dako nga Blocking Error Notification Screen Overlay Container */}
      {showBlockingModal && error && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <AlertTriangle size={55} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 12px 0' }}>
              System Alert Encountered
            </h3>
            <p style={{ fontSize: '15px', color: '#d1d5db', lineHeight: '1.6', margin: '0 0 30px 0' }}>
              {error}
            </p>
            <button 
              type="button"
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onClick={() => setShowBlockingModal(false)}
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* NEW: Explicit Screen Overlay rendering layout for OTP entry form strings */}
      {showOtpVerification && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0b1220',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="login-form-wrap" style={{ maxWidth: '420px', width: '100%', border: '1px solid #334155', padding: '30px', borderRadius: '12px', backgroundColor: '#1e293b' }}>
            <div className="login-form-header" style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h2>Verify Email Address</h2>
              <p className="login-subtitle">A real 6-digit OTP code has been dispatched to <strong>{verificationEmail}</strong></p>
            </div>
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-group">
                <label>Enter 6-Digit OTP</label>
                <input 
                  className="form-input"
                  type="text"
                  maxLength={6}
                  placeholder="X X X X X X"
                  style={{ textAlign: 'center', fontSize: '22px', letterSpacing: '6px', fontWeight: 'bold' }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="login-submit-btn" style={{ marginTop: '15px' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Validate Verification Token'}
              </button>
              <button type="button" className="login-back-btn" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} onClick={() => setShowOtpVerification(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="login-left-panel">
        <div className="login-left-bg" />
        <div className="login-left-overlay" />
        <div className="login-left-content">
          <Link to="/" className="login-left-brand" style={{ textDecoration: 'none' }}>
            <img className="login-left-brand-mark" src={tcLogo} alt="TuloClicks" />
            <span className="login-left-brand-name">TuloClicks</span>
          </Link>

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

      <div className="login-right-panel">
        <div className="login-form-wrap">
          <button type="button" className="login-back-btn" onClick={() => navigate('/')}>
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
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </span>
            </div>

            {error && <p className="login-error" style={{ display: 'none' }}>{error}</p>}

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
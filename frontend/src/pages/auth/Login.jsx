import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
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
      <div className="login-panel">
        <div className="login-brand-outside">
          <div className="brand-mark-outside logo-mark-hover">TC</div>
          <div className="brand-outside-text">
            <div className="brand-name-outside">TuloClicks</div>
            <div className="brand-tagline-outside">Event Management Platform</div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-body">
            <button className="login-back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Back to Home
            </button>

            <h2 style={{ marginTop: '20px' }}>Sign In</h2>
            <p className="login-subtitle">Enter your credentials to access your account</p>

            <form className="login-form" onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Password</label>
                <input
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '38px', 
                    background: 'none', 
                    border: 'none', 
                    color: '#64748b', 
                    cursor: 'pointer' 
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="form-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#cbd5e1' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Remember Me
                </label>
                <span 
                  style={{ color: '#22c55e', fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => addToast('Please contact admin to reset password', 'info')}
                >
                  Forgot Password?
                </span>
              </div>

              {error && <p className="login-error" style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px' }}>{error}</p>}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <p className="signup-link" style={{ marginTop: '25px', textAlign: 'center' }}>
              Don't have an account?{' '}
              <span 
                style={{ color: '#22c55e', cursor: 'pointer', fontWeight: 'bold' }} 
                onClick={() => navigate('/signup')}
              >
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
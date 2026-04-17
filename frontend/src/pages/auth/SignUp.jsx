import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/SignUp.css'
import api from '../../services/api'

function SignUp() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Calculate password strength
  function calculatePasswordStrength(pass) {
    let strength = 0

    // Length check
    if (pass.length >= 8) strength++
    if (pass.length >= 12) strength++

    // Has uppercase letters
    if (/[A-Z]/.test(pass)) strength++

    // Has lowercase letters
    if (/[a-z]/.test(pass)) strength++

    // Has numbers
    if (/[0-9]/.test(pass)) strength++

    // Has special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) strength++

    // Normalize to 1-4 scale
    return Math.min(4, Math.ceil(strength / 1.5))
  }

  function getPasswordStrengthLabel(strength) {
    switch (strength) {
      case 0:
        return { text: 'No Password', color: '#9ca3af' }
      case 1:
        return { text: 'Weak Password', color: '#ef4444' }
      case 2:
        return { text: 'Fair Password', color: '#f59e0b' }
      case 3:
        return { text: 'Good Password', color: '#eab308' }
      case 4:
        return { text: 'Strong Password', color: '#22c55e' }
      default:
        return { text: 'No Password', color: '#9ca3af' }
    }
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 4) {
      setError('Password must be Strong. Include uppercase, lowercase, numbers, and special characters')
      return
    }

    try {
      setLoading(true)

      await api.post('/auth/signup', {
        name,
        email,
        phone,
        password
      })

      alert('Account created successfully')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create Account</h2>
        <p>Sign up to start using TuloClicks</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
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
                      className={`strength-bar ${
                        bar <= passwordStrength ? 'active' : ''
                      }`}
                      style={{
                        backgroundColor:
                          bar <= passwordStrength
                            ? getPasswordStrengthLabel(passwordStrength).color
                            : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
                <span
                  className="password-strength-text"
                  style={{ color: getPasswordStrengthLabel(passwordStrength).color }}
                >
                  {getPasswordStrengthLabel(passwordStrength).text}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setError('')
              }}
            />
          </div>

          {error && (
            <p className="signup-error" style={{ color: '#ef4444', marginBottom: '16px' }}>
              {error}
            </p>
          )}

          <button type="submit" className="signup-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{' '}
          <span
            style={{ color: '#22c55e', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}

export default SignUp
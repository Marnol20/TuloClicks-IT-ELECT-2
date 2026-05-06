import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Edit2, Save, X } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../components/common/ToastContext'
import { syncUserPhone } from '../../services/phoneSync'
import '../../styles/Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await api.get('/auth/me')
        const userData = res.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        })
        localStorage.setItem('user', JSON.stringify(userData))
        setLoading(false)
        return
      } catch (error) {
        console.error('API fetch failed:', error)
      }
    }

    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const localUser = JSON.parse(stored)
        if (!localUser.phone && token) {
          const syncedPhone = await syncUserPhone()
          if (syncedPhone) {
            localUser.phone = syncedPhone
            localStorage.setItem('user', JSON.stringify(localUser))
          }
        }
        setUser(localUser)
        setFormData({
          name: localUser.name || '',
          email: localUser.email || '',
          phone: localUser.phone || ''
        })
      } else {
        addToast('Please login to view profile', 'error')
        setTimeout(() => navigate('/login'), 1500)
      }
    } catch (parseError) {
      console.error('Failed to parse localStorage user:', parseError)
      addToast('Session error. Please login again.', 'error')
      setTimeout(() => navigate('/login'), 1500)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const updatedUser = await api.put('/users/profile', formData)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const newUser = { ...currentUser, ...updatedUser.data }
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(updatedUser.data)
      setIsEditing(false)
      window.dispatchEvent(new Event('profileUpdated'))
      addToast('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      addToast(error.response?.data?.error || 'Failed to update profile', 'error')
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '')
      if (phoneValue.length <= 11) {
        setFormData(prev => ({ ...prev, [name]: phoneValue }))
      }
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-page-hero">
          <p className="profile-hero-eyebrow">Account</p>
          <h1 className="profile-hero-title">My Profile</h1>
        </div>
        <div className="profile-content-area">
          <div className="profile-container">
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      {/* ── Hero Banner ── */}
      <div className="profile-page-hero">
        <p className="profile-hero-eyebrow">Account</p>
        <h1 className="profile-hero-title">My Profile</h1>
        <p className="profile-hero-sub">Manage your personal information and account settings.</p>
      </div>

      {/* ── Content ── */}
      <div className="profile-content-area">
        <div className="profile-container">
          {/* Action buttons row */}
          <div className="profile-header">
            <div className="profile-header-actions">
              {!isEditing ? (
                <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="profile-cancel-btn" onClick={() => setIsEditing(false)}>
                    <X size={16} />
                    Cancel
                  </button>
                  <button className="profile-save-btn" onClick={handleSubmit}>
                    <Save size={16} />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile card */}
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-large-avatar">
                <div className="profile-avatar-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="profile-user-info">
                <h2>{user?.name || 'User'}</h2>
                <p className="profile-role">{user?.role || 'User'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="profile-form-group">
                <label>
                  <User size={14} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="profile-value">{user?.name || 'Not set'}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  <Mail size={14} />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="profile-value">{user?.email || 'Not set'}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  <Phone size={14} />
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="phone-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      maxLength="11"
                      pattern="\d{11}"
                      title="Phone number must be 11 digits"
                    />
                    <span className="phone-digit-counter">{formData.phone.length}/11</span>
                  </div>
                ) : (
                  <p className="profile-value">{user?.phone || 'Not set'}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label>
                  <Calendar size={14} />
                  Member Since
                </label>
                <p className="profile-value">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

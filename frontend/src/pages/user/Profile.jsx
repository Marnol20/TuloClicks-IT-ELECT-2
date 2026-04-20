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
    console.log('=== Profile fetch started ===')
    
    // Try API first (requires token)
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await api.get('/auth/me')
        console.log('Profile API response:', res.data)
        const userData = res.data
        setUser(userData)
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        })
        // Store in localStorage for instant future loads
        localStorage.setItem('user', JSON.stringify(userData))
        setLoading(false)
        return
      } catch (error) {
        console.error('API fetch failed:', error)
        // Fall through to localStorage fallback
      }
    }
    
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const localUser = JSON.parse(stored)
        console.log('Using localStorage user data:', localUser)
        
        // If phone is missing but we have token, try to sync it
        if (!localUser.phone && token) {
          console.log('Phone missing, syncing from backend...')
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
      // Update localStorage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      const newUser = { ...currentUser, ...updatedUser.data }
      localStorage.setItem('user', JSON.stringify(newUser))
      setUser(updatedUser.data)
      setIsEditing(false)
      // Notify header to re-render
      window.dispatchEvent(new Event('profileUpdated'))
      addToast('Profile updated successfully!', 'success')
    } catch (error) {
      console.error('Failed to update profile:', error)
      addToast(error.response?.data?.error || 'Failed to update profile', 'error')
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing ? (
            <button
              className="profile-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={18} />
              Edit
            </button>
          ) : (
            <div className="profile-header-actions">
              <button
                className="profile-cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                className="profile-save-btn"
                onClick={handleSubmit}
              >
                <Save size={18} />
                Save
              </button>
            </div>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-large-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-user-info">
              <h2>{user?.name || 'User'}</h2>
              <p className="profile-role">{user?.role || 'User'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-form-group">
              <label>
                <User size={16} />
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
                <Mail size={16} />
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
                <Phone size={16} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="profile-value">{user?.phone || 'Not set'}</p>
              )}
            </div>

            <div className="profile-form-group">
              <label>
                <Calendar size={16} />
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
  )
}

export default Profile

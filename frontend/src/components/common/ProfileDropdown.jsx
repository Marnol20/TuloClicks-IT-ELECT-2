import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronDown, User, CreditCard, Settings, LogOut, Users, RefreshCw } from 'lucide-react'
import '../../styles/ProfileDropdown.css'

function ProfileDropdown() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Determine current dashboard mode
  const isUserMode = location.pathname.startsWith('/home')
  const isOrganizerMode = location.pathname.startsWith('/organizer')

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleNavigation(path) {
    setIsOpen(false)
    navigate(path)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  function handleProfileClick() {
  if (user.role === 'admin') {
    handleNavigation('/admin/profile')
  } else if (user.role === 'organizer') {
    handleNavigation('/organizer/profile')
  } else {
    handleNavigation('/home/profile')
  }
}

  if (!user) return null

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        className="profile-dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="profile-avatar">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <span className="profile-name">{user.name}</span>
        <ChevronDown
          size={16}
          className={`profile-dropdown-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu">
          <button
            className="profile-dropdown-item"
            onClick={handleProfileClick}
          >
            <User size={18} />
            <span>Profile</span>
          </button>

          <button
            className="profile-dropdown-item"
            onClick={() => handleNavigation('/home/tickets')}
          >
            <CreditCard size={18} />
            <span>My Tickets</span>
          </button>

          {/* Switch Dashboard - Only for organizers */}
          {user.role === 'organizer' && (
            <button
              className="profile-dropdown-item"
              onClick={() => handleNavigation(isUserMode ? '/organizer' : '/home')}
            >
              <RefreshCw size={18} />
              <span>{isUserMode ? 'Switch to Organizer' : 'Switch to User'}</span>
            </button>
          )}

          {/* Users can apply to become organizers */}
          {user.role === 'user' && (
            <button
              className="profile-dropdown-item"
              onClick={() => handleNavigation('/home/apply-organizer')}
            >
              <Users size={18} />
              <span>Apply as Organizer</span>
            </button>
          )}

          <div className="profile-dropdown-divider" />

          <button
            className="profile-dropdown-item"
            onClick={() => handleNavigation('/home/settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <button
            className="profile-dropdown-item profile-dropdown-item-danger"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown

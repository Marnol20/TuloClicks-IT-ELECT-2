import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../services/auth'
import NotificationBell from '../common/NotificationBell'
import ProfileDropdown from '../common/ProfileDropdown'
import tcLogo from '../../styles/TuloClicksLogo.png'
import '../../styles/ProfileDropdown.css'
import React, { useReducer, useEffect } from 'react'

function UserViewHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getCurrentUser()

  // Force re-render when profile is updated (via custom event)
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    const handler = () => forceUpdate()
    window.addEventListener('profileUpdated', handler)
    return () => window.removeEventListener('profileUpdated', handler)
  }, [])

  // Gidugangan nato og Support link diri sa navItems
  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Events', path: '/home/events' },
    { label: 'My Tickets', path: '/home/tickets' },
    { label: 'Support', path: '/home/support' } 
  ]

  function isActive(path) {
    if (path === '/home') {
      return location.pathname === '/home'
    }
    return location.pathname.startsWith(path)
  }

  function handleLogoClick() {
    if (!user) {
      navigate('/login')
      return
    }

    if (user.role === 'admin') {
      navigate('/admin')
      return
    }

    if (user.role === 'organizer') {
      navigate('/organizer')
      return
    }

    navigate('/home')
  }

  // NEW: Interactive notification interception click router algorithm setup
  function handleNotificationNavigation(notificationItem) {
    const { type, related_id, related_type } = notificationItem;
    
    if (type === 'payment_verified' || related_type === 'booking') {
      navigate(`/home/tickets/${related_id}`); // Direct to real ticket receipt layout
    } else if (type === 'event_approval' || related_type === 'event') {
      navigate(`/home/events/${related_id}`); // Route to specific event page layout
    } else if (type === 'organizer_request') {
      navigate('/admin/organizers'); // Route admin profile validations directly
    } else {
      navigate('/home/tickets'); // Default system fallback dashboard routing
    }
  }

  return (
    <header className="user-view-header">
      <div className="user-view-brand" onClick={handleLogoClick}>
        <img className="user-view-brand-mark logo-mark-hover" src={tcLogo} alt="TuloClicks" />
        <div className="user-view-brand-text">
          <h2>TuloClicks</h2>
          <p>Event Platform</p>
        </div>
      </div>

      <nav className="user-view-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`user-view-nav-link ${isActive(item.path) ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="user-view-actions">
        {/* UPDATED: Injected routing callback parameter triggers into the bell system */}
        {user && <NotificationBell onNotificationClick={handleNotificationNavigation} />}

        {user?.role === 'user' && (
          <button
            className="user-view-outline-btn"
            onClick={() => navigate('/home/apply-organizer')}
          >
            Apply as Organizer
          </button>
        )}

        {user && <ProfileDropdown />}
      </div>
    </header>
  )
}

export default UserViewHeader
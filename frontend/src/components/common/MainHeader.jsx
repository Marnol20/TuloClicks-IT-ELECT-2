import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../services/auth'
import NotificationBell from './NotificationBell'
import ProfileDropdown from './ProfileDropdown'
import '../../styles/ProfileDropdown.css'
import React, { useReducer, useEffect } from 'react'

function MainHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getCurrentUser()

  // Force re-render when profile is updated
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    const handler = () => forceUpdate()
    window.addEventListener('profileUpdated', handler)
    return () => window.removeEventListener('profileUpdated', handler)
  }, [])

  function getNavItems() {
    if (!user) return []

    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Organizers', path: '/admin/organizers' },
        { label: 'Events', path: '/admin/events' },
        { label: 'Venues', path: '/admin/venues' },
        { label: 'Payments', path: '/admin/payments' },
        { label: 'Reports', path: '/admin/reports' },
<<<<<<< HEAD
        { label: 'Activity Logs', path: '/admin/activity-logs' }
=======
        { label: 'Activity Logs', path: '/admin/activity-logs' },
        { label: 'Support', path: '/admin/support' }
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
      ]
    }

    if (user.role === 'organizer') {
      return [
        { label: 'Dashboard', path: '/organizer' },
        { label: 'Events', path: '/organizer/events' },
        { label: 'Speakers', path: '/organizer/speakers' },
        { label: 'Tickets', path: '/organizer/tickets' },
        { label: 'Bookings', path: '/organizer/bookings' },
<<<<<<< HEAD
        { label: 'Scan QR', path: '/organizer/scan-qr' }
=======
        { label: 'Scan QR', path: '/organizer/scan-qr' },
        { label: 'Support', path: '/home/support' }
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
      ]
    }

    return [
      { label: 'Home', path: '/home' },
      { label: 'Events', path: '/home/events' },
<<<<<<< HEAD
      { label: 'My Tickets', path: '/home/tickets' }
=======
      { label: 'My Tickets', path: '/home/tickets' },
      { label: 'Support', path: '/home/support' }
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
    ]
  }

  const navItems = getNavItems()

  function isActive(path) {
    if (path === '/admin') return location.pathname === '/admin'
    if (path === '/organizer') return location.pathname === '/organizer'
    if (path === '/home') return location.pathname === '/home'
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

  // Get current user role for profile dropdown
  const currentUser = getCurrentUser()

  return (
    <header className="user-view-header">
      <div className="user-view-brand" onClick={handleLogoClick}>
        <div className="user-view-brand-mark logo-mark-hover">T</div>
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
        {user && <NotificationBell />}
        {user && <ProfileDropdown />}
      </div>
    </header>
  )
}

export default MainHeader
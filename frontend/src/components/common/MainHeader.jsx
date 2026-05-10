import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../services/auth'
import NotificationBell from './NotificationBell'
import ProfileDropdown from './ProfileDropdown'
import tcLogo from '../../styles/TuloClicksLogo.png'
import '../../styles/ProfileDropdown.css'
import React, { useReducer, useEffect } from 'react'

function MainHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getCurrentUser()

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
        // UPDATED: Gi-add ang Categories diri
        { label: 'Categories', path: '/admin/categories' }, 
        { label: 'Venues', path: '/admin/venues' },
        { label: 'Payments', path: '/admin/payments' },
        { label: 'Reports', path: '/admin/reports' },
        { label: 'Activity Logs', path: '/admin/activity-logs' },
        { label: 'Support', path: '/admin/support' }
      ]
    }

    if (user.role === 'organizer') {
      return [
        { label: 'Dashboard', path: '/organizer' },
        { label: 'Events', path: '/organizer/events' },
        { label: 'Speakers', path: '/organizer/speakers' },
        { label: 'Tickets', path: '/organizer/tickets' },
        { label: 'Bookings', path: '/organizer/bookings' },
        { label: 'Scan QR', path: '/organizer/scan-qr' }
      ]
    }

    return [
      { label: 'Home', path: '/home' },
      { label: 'Events', path: '/home/events' },
      { label: 'My Tickets', path: '/home/tickets' },
      { label: 'Support', path: '/home/support' }
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
        {user && <NotificationBell />}
        {user && <ProfileDropdown />}
      </div>
    </header>
  )
}

export default MainHeader
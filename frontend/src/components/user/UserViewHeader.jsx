import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, logoutUser } from '../../services/auth'
import NotificationBell from '../common/NotificationBell'

function UserViewHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getCurrentUser()

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Events', path: '/home/events' },
    { label: 'My Tickets', path: '/home/tickets' }
  ]

  function isActive(path) {
    if (path === '/home') {
      return location.pathname === '/home'
    }
    return location.pathname.startsWith(path)
  }

  function handleLogout() {
    const ok = window.confirm('Are you sure you want to logout?')
    if (!ok) return

    logoutUser()
    navigate('/login')
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

        {user?.role === 'user' && (
          <button
            className="user-view-outline-btn"
            onClick={() => navigate('/home/apply-organizer')}
          >
            Apply as Organizer
          </button>
        )}

        {user && (
          <div className="user-view-user-chip">
            <span className="user-view-user-name">{user.name}</span>
          </div>
        )}

        <button className="user-view-signin" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

export default UserViewHeader
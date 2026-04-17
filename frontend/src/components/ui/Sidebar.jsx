import '../../styles/Sidebar.css'
import { logoutUser } from '../../services/auth'
import {
  LayoutDashboard,
  CalendarDays,
  Mic2,
  Users,
  MapPin,
  CreditCard,
  LifeBuoy,
  UserCheck,
  Ticket,
  LogOut
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

function Sidebar({ role = 'admin' }) {
  const navigate = useNavigate()

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/organizers', label: 'Organizers', icon: UserCheck },
    { to: '/admin/events', label: 'Events', icon: CalendarDays },
    { to: '/admin/venues', label: 'Venues', icon: MapPin },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/support', label: 'Support', icon: LifeBuoy },
    { to: '/admin/categories', label: 'Categories', icon: Ticket }
  ]

  const organizerLinks = [
    { to: '/organizer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/organizer/events', label: 'My Events', icon: CalendarDays },
    { to: '/organizer/speakers', label: 'Speakers', icon: Mic2 },
    { to: '/organizer/tickets', label: 'Tickets', icon: Ticket },
    { to: '/organizer/bookings', label: 'Bookings', icon: Users }
  ]

  const links = role === 'admin' ? adminLinks : organizerLinks

function handleLogout() {
  const ok = window.confirm('Are you sure you want to logout?')
  if (!ok) return

  logoutUser()
  navigate('/login')
}

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="sidebar-brand-mark logo-mark-hover">T</div>
          <div>
            <h2>TuloClicks</h2>
            <p>{role === 'admin' ? 'Admin Panel' : 'Organizer Panel'}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end || false}
                className="sidebar-link"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>

        <p className="sidebar-version">v2.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
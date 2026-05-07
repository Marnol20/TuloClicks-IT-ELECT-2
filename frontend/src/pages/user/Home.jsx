import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Ticket, Clock } from 'lucide-react'
import '../../styles/UserView.css'
import api from '../../services/api'

const CATEGORY_GRADIENTS = {
  'Music':      'linear-gradient(135deg, #7c3aed, #ec4899)',
  'Technology': 'linear-gradient(135deg, #2563eb, #38bdf8)',
  'Sports':     'linear-gradient(135deg, #16a34a, #84cc16)',
  'Business':   'linear-gradient(135deg, #d97706, #ef4444)',
  'Art':        'linear-gradient(135deg, #db2777, #f97316)',
  'Food':       'linear-gradient(135deg, #ea580c, #fbbf24)',
  'Education':  'linear-gradient(135deg, #0891b2, #6366f1)',
}

function getCardGradient(event) {
  return CATEGORY_GRADIENTS[event.category_name] || 'linear-gradient(135deg, #7c3aed, #6366f1)'
}

function Home() {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [ticketsRes, eventsRes] = await Promise.all([
        api.get('/bookings/my-bookings').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] }))
      ])
      setTickets(ticketsRes.data || [])
      setEvents(eventsRes.data || [])
    } catch (error) {
      console.error('User dashboard fetch error:', error)
    }
  }

  const upcomingTickets = tickets.filter((t) => t.booking_status !== 'cancelled')
  const paidTickets     = tickets.filter((t) => t.payment_status === 'paid')
  const pendingTickets  = tickets.filter((t) => t.payment_status !== 'paid')

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user')) || {} } catch { return {} }
  }, [])

  return (
    <div className="user-dashboard">
      {/* ── Hero ── */}
      <section className="user-dashboard-hero">
        <p className="user-dashboard-label">Welcome back{user.name ? `, ${user?.name?.split(' ')?.[0] || 'User'}` : ''}</p>
        <h1 className="user-dashboard-title">Discover and manage your event experience</h1>
        <p className="user-dashboard-text">
          Track your bookings, explore upcoming events, and stay updated with your tickets — all in one place.
        </p>
        <div className="user-dashboard-hero-actions">
          <button className="hero-btn-primary" onClick={() => navigate('/home/events')}>
            Browse Events →
          </button>
          <button className="hero-btn-secondary" onClick={() => navigate('/home/tickets')}>
            My Tickets
          </button>
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="user-dashboard-stats">
        <button className="user-stat-card clickable-card" onClick={() => navigate('/home/tickets')}>
          <div className="user-stat-icon blue">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="user-stat-label">Upcoming Tickets</p>
            <h3 className="user-stat-value">{upcomingTickets.length}</h3>
          </div>
        </button>

        <button className="user-stat-card clickable-card" onClick={() => navigate('/home/tickets')}>
          <div className="user-stat-icon green">
            <Ticket size={18} />
          </div>
          <div>
            <p className="user-stat-label">Paid Bookings</p>
            <h3 className="user-stat-value">{paidTickets.length}</h3>
          </div>
        </button>

        <button className="user-stat-card clickable-card" onClick={() => navigate('/home/tickets')}>
          <div className="user-stat-icon yellow">
            <Clock size={18} />
          </div>
          <div>
            <p className="user-stat-label">Pending Bookings</p>
            <h3 className="user-stat-value">{pendingTickets.length}</h3>
          </div>
        </button>
      </section>

      {/* ── Recent Tickets ── */}
      <section className="user-dashboard-section">
        <div className="user-dashboard-section-header">
          <div>
            <h2>My Recent Tickets</h2>
            <p>Your latest bookings and ticket activity</p>
          </div>
          <button className="user-view-outline-btn" onClick={() => navigate('/home/tickets')}>
            View All
          </button>
        </div>

        {tickets.length > 0 ? (
          <div className="user-dashboard-list">
            {tickets.slice(0, 4).map((ticket) => (
              <button
                className="user-dashboard-item clickable-card"
                key={ticket.id}
                onClick={() => navigate(`/home/tickets/${ticket.id}`)}
              >
                <div>
                  <h3>{ticket.event_title}</h3>
                  <p>Ref: {ticket.booking_reference} • {formatDate(ticket.start_date)}</p>
                </div>
                <span className={`user-dashboard-badge ${ticket.payment_status === 'paid' ? 'success' : 'pending'}`}>
                  {ticket.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="user-dashboard-empty">
            <p>No tickets yet. Browse events to get started.</p>
          </div>
        )}
      </section>

      {/* ── Featured Events ── */}
      <section className="user-dashboard-section">
        <div className="user-dashboard-section-header">
          <div>
            <h2>Featured Events</h2>
            <p>Browse available events you may want to attend</p>
          </div>
          <button className="user-view-outline-btn" onClick={() => navigate('/home/events')}>
            Explore More
          </button>
        </div>

        {events.length > 0 ? (
          <div className="user-dashboard-grid">
            {events.slice(0, 6).map((event) => (
              <button
                className="user-dashboard-event-card clickable-card"
                key={event.id}
                onClick={() => navigate(`/home/events/${event.id}`)}
              >
                {/* Image header */}
                <div className="udash-event-img-wrap">
                  {event.event_image ? (
                    <img
                      src={`http://localhost:5000/uploads/events/${event.event_image}`}
                      alt={event.title}
                      className="udash-event-img"
                    />
                  ) : (
                    <div
                      className="udash-event-img-fallback"
                      style={{ background: getCardGradient(event) }}
                    >
                      <span className="udash-event-initial">{event.title?.[0] ?? '?'}</span>
                    </div>
                  )}
                  <div className="udash-event-overlay" />
                  {event.category_name && (
                    <span className="udash-event-category">{event.category_name}</span>
                  )}
                </div>

                {/* Text content */}
                <div className="user-dashboard-event-content">
                  <p className="user-dashboard-event-date">{formatDate(event.start_date)}</p>
                  <h3>{event.title}</h3>
                  <p>
                    {event.description?.length > 90
                      ? `${event.description.slice(0, 90)}...`
                      : event.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="user-dashboard-empty">
            <p>No events available.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home

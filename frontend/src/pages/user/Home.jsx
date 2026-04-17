import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Ticket, Clock } from 'lucide-react'
import '../../styles/UserView.css'
import api from '../../services/api'

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

  const upcomingTickets = tickets.filter(
    (item) => item.booking_status !== 'cancelled'
  )

  const paidTickets = tickets.filter(
    (item) => item.payment_status === 'paid'
  )

  const pendingTickets = tickets.filter(
    (item) => item.payment_status !== 'paid'
  )

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="user-dashboard">
      <section className="user-dashboard-hero">
        <div>
          <p className="user-dashboard-label">Welcome to TuloClicks</p>
          <h1 className="user-dashboard-title">Discover and manage your event experience</h1>
          <p className="user-dashboard-text">
            Track your bookings, explore upcoming events, and stay updated with your tickets in one place.
          </p>
        </div>
      </section>

      <section className="user-dashboard-stats">
        <button
          className="user-stat-card clickable-card"
          onClick={() => navigate('/home/tickets')}
        >
          <div className="user-stat-icon blue">
            <CalendarDays size={18} />
          </div>
          <div>
            <p className="user-stat-label">Upcoming Tickets</p>
            <h3 className="user-stat-value">{upcomingTickets.length}</h3>
          </div>
        </button>

        <button
          className="user-stat-card clickable-card"
          onClick={() => navigate('/home/tickets')}
        >
          <div className="user-stat-icon green">
            <Ticket size={18} />
          </div>
          <div>
            <p className="user-stat-label">Paid Bookings</p>
            <h3 className="user-stat-value">{paidTickets.length}</h3>
          </div>
        </button>

        <button
          className="user-stat-card clickable-card"
          onClick={() => navigate('/home/tickets')}
        >
          <div className="user-stat-icon yellow">
            <Clock size={18} />
          </div>
          <div>
            <p className="user-stat-label">Pending Bookings</p>
            <h3 className="user-stat-value">{pendingTickets.length}</h3>
          </div>
        </button>
      </section>

      <section className="user-dashboard-section">
        <div className="user-dashboard-section-header">
          <div>
            <h2>My Recent Tickets</h2>
            <p>Your latest bookings and ticket activity</p>
          </div>

          <button
            className="user-view-outline-btn"
            onClick={() => navigate('/home/tickets')}
          >
            View All
          </button>
        </div>

        {tickets.length > 0 ? (
          <div className="user-dashboard-list">
            {tickets.slice(0, 4).map((ticket) => (
              <button
                className="user-dashboard-item clickable-card"
                key={ticket.id}
                onClick={() => navigate('/home/tickets')}
              >
                <div>
                  <h3>{ticket.event_title}</h3>
                  <p>
                    Ref: {ticket.booking_reference} • {formatDate(ticket.start_date)}
                  </p>
                </div>
                <span className={`user-dashboard-badge ${ticket.payment_status === 'paid' ? 'success' : 'pending'}`}>
                  {ticket.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="user-dashboard-empty">
            <p>No tickets yet.</p>
          </div>
        )}
      </section>

      <section className="user-dashboard-section">
        <div className="user-dashboard-section-header">
          <div>
            <h2>Featured Events</h2>
            <p>Browse available events you may want to attend</p>
          </div>

          <button
            className="user-view-outline-btn"
            onClick={() => navigate('/home/events')}
          >
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
                <div className="user-dashboard-event-content">
                  <p className="user-dashboard-event-date">
                    {formatDate(event.start_date)}
                  </p>
                  <h3>{event.title}</h3>
                  <p>
                    {event.description?.length > 110
                      ? `${event.description.slice(0, 110)}...`
                      : event.description}
                  </p>
                  <span>{event.category_name || 'Event'}</span>
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
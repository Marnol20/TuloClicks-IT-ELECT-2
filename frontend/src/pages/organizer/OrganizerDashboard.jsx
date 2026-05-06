import { useEffect, useState } from 'react'
import { CalendarDays, Users, CheckCircle2 } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerDashboard() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const totalEvents    = events.length
  const totalBookings  = bookings.length
  const checkedInCount = bookings.filter(
    (b) => b.booking_status === 'checked_in' || b.booking_status === 'attended'
  ).length

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (selectedEvent) fetchBookings(selectedEvent)
    else setBookings([])
  }, [selectedEvent])

  async function fetchEvents() {
    try {
      const res = await api.get('/events/organizer/my-events')
      setEvents(res.data || [])
    } catch {
      setEvents([])
    }
  }

  async function fetchBookings(eventId) {
    try {
      setLoading(true)
      const res = await api.get(`/bookings/event/${eventId}/manage`)
      setBookings(res.data || [])
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn(id) {
    try {
      await api.patch(`/bookings/${id}/check-in`)
      addToast('Attendee checked in successfully!', 'success')
      fetchBookings(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to check in attendee', 'error')
    }
  }

  const heroStats = [
    { label: 'Total Events',      value: totalEvents,    icon: CalendarDays },
    { label: 'Bookings Selected', value: totalBookings,  icon: Users        },
    { label: 'Checked In',        value: checkedInCount, icon: CheckCircle2 }
  ]

  return (
    <main className="attendees-page">
      <div className="organizer-hero-card">
        <div>
          <h2>Organizer Dashboard</h2>
          <p>Review event bookings, manage attendance, and keep your guests moving smoothly.</p>
        </div>

        <div className="organizer-hero-actions">
          {heroStats.map(({ label, value, icon: Icon }) => (
            <div className="organizer-hero-value" key={label}>
              <span>
                <Icon size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />
                {label}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="attendees-top" style={{ marginBottom: '16px' }}>
        <div className="user-events-filter">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Choose an event to view bookings</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="attendees-table">
        <div
          className="table-header"
          style={{ gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 0.8fr' }}
        >
          <span>Name</span>
          <span>Email</span>
          <span>Reference</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {!selectedEvent ? (
          <div className="table-empty">Select an event above to view its bookings.</div>
        ) : loading ? (
          <div className="table-empty">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="table-empty">No bookings found for this event.</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={`${booking.id}-${booking.booking_reference}`}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 0.8fr' }}
            >
              <span className="row-name">{booking.attendee_name}</span>
              <span className="row-muted">{booking.attendee_email}</span>
              <span className="row-muted">{booking.booking_reference}</span>
              <span className="row-muted">₱{Number(booking.total_amount).toLocaleString()}</span>

              <span
                className={`table-badge ${
                  booking.booking_status === 'checked_in' || booking.booking_status === 'attended'
                    ? 'success'
                    : booking.booking_status === 'cancelled'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {booking.booking_status.replace('_', ' ')}
              </span>

              <div className="row-actions">
                {booking.booking_status === 'checked_in' || booking.booking_status === 'attended' ? (
                  <span style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 14 }}>
                    <CheckCircle2 size={16} /> Admitted
                  </span>
                ) : booking.booking_status === 'cancelled' ? (
                  <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: 14, opacity: 0.8 }}>
                    ✕ Cancelled
                  </span>
                ) : (
                  <button
                    className="table-action-btn primary"
                    onClick={() => handleCheckIn(booking.id)}
                  >
                    Check-in
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default OrganizerDashboard

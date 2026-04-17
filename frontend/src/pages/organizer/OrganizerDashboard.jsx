import { useEffect, useState } from 'react'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerBookings() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalEvents = events.length
  const totalBookings = bookings.length
  const checkedInCount = bookings.filter((booking) => booking.booking_status === 'checked_in').length

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchBookings(selectedEvent)
    } else {
      setBookings([])
    }
  }, [selectedEvent])

  async function fetchEvents() {
    try {
      const res = await api.get('/events/organizer/my-events')
      setEvents(res.data || [])
    } catch (error) {
      console.error('Fetch organizer events error:', error)
      setEvents([])
    }
  }

  async function fetchBookings(eventId) {
    try {
      setLoading(true)
      const res = await api.get(`/bookings/event/${eventId}/manage`)
      setBookings(res.data || [])
    } catch (error) {
      console.error('Fetch bookings error:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn(id) {
    try {
      await api.patch(`/bookings/${id}/check-in`)
      setError('')
      fetchBookings(selectedEvent)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check in attendee')
    }
  }

  return (
    <main className="attendees-page">
      <div className="organizer-hero-card">
        <div>
          <h2>Organizer Dashboard</h2>
          <p>Review event bookings, manage attendance, and keep your guests moving smoothly.</p>
        </div>

        <div className="organizer-hero-actions">
          <div className="organizer-hero-value">
            <span>Total events</span>
            <strong>{totalEvents}</strong>
          </div>
          <div className="organizer-hero-value">
            <span>Bookings selected</span>
            <strong>{totalBookings}</strong>
          </div>
          <div className="organizer-hero-value">
            <span>Checked in</span>
            <strong>{checkedInCount}</strong>
          </div>
        </div>
      </div>

      <div className="attendees-top" style={{ marginBottom: '16px' }}>
        <div className="user-events-filter">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Choose an event</option>
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
          <div className="table-empty">Select an event first.</div>
        ) : loading ? (
          <div className="table-empty">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="table-empty">No bookings found for this event.</div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 0.8fr' }}
            >
              <span className="row-name">{booking.attendee_name}</span>
              <span className="row-muted">{booking.attendee_email}</span>
              <span className="row-muted">{booking.booking_reference}</span>
              <span className="row-muted">
                ₱{Number(booking.total_amount).toLocaleString()}
              </span>

              <span
                className={`table-badge ${
                  booking.booking_status === 'checked_in'
                    ? 'success'
                    : booking.booking_status === 'cancelled'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {booking.booking_status}
              </span>

              <div className="row-actions">
                <button
                  className="table-action-btn primary"
                  onClick={() => handleCheckIn(booking.id)}
                >
                  Check-in
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default OrganizerBookings
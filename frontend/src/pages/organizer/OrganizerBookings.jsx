import { useEffect, useState } from 'react'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerBookings() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [bookings, setBookings] = useState([])

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
      const res = await api.get(`/bookings/event/${eventId}/manage`)
      setBookings(res.data || [])
    } catch (error) {
      console.error('Fetch bookings error:', error)
      setBookings([])
    }
  }

  async function handleCheckIn(id) {
    try {
      await api.patch(`/bookings/${id}/check-in`)
      setError('')
      fetchBookings()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to check in attendee')
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Bookings</h2>
            <p>View bookings and check in attendees for your events</p>
          </div>
        </div>
      </div>

      <div className="create-form">
        <h3>Select Event</h3>
        <div className="form-grid">
          <select className="form-input" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
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
        <div className="table-header" style={{ gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 0.8fr' }}>
          <span>Name</span>
          <span>Email</span>
          <span>Reference</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="table-row"
            style={{ gridTemplateColumns: '1.2fr 1.4fr 1fr 1fr 1fr 0.8fr' }}
          >
            <span className="row-name">{booking.attendee_name}</span>
            <span className="row-muted">{booking.attendee_email}</span>
            <span className="row-muted">{booking.booking_reference}</span>
            <span className="row-muted">₱{Number(booking.total_amount).toLocaleString()}</span>
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
            <button className="new-event-btn" style={{ padding: '6px 10px' }} onClick={() => handleCheckIn(booking.id)}>
              Check-in
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerBookings
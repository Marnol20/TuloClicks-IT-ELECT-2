import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerBookings() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

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
      addToast('Attendee checked in successfully!', 'success')
      fetchBookings(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to check in attendee', 'error')
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

        {loading ? (
          <div className="table-empty">Loading bookings...</div>
        ) : !selectedEvent ? (
          <div className="table-empty">Please select an event to view bookings.</div>
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
              
              <div className="row-actions">
                {/* 1. Logic para sa Checked-in */}
                {booking.booking_status === 'checked_in' ? (
                  <span style={{ 
                    color: '#10b981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    <span style={{ fontSize: '18px' }}>✓</span> Admitted
                  </span>
                ) : /* 2. Logic para sa Cancelled */
                booking.booking_status === 'cancelled' ? (
                  <span style={{ 
                    color: '#ef4444', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    opacity: 0.8
                  }}>
                    <span style={{ fontSize: '18px' }}>✕</span> Cancelled
                  </span>
                ) : (
                  /* 3. Logic para sa Pending (Standard Check-in) */
                  <button 
                    className="table-action-btn primary" 
                    style={{ padding: '6px 10px' }} 
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

export default OrganizerBookings
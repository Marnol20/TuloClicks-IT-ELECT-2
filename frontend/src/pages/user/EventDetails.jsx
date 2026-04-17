import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Calendar
} from 'lucide-react'
import '../../styles/EventDetails.css'
import api from '../../services/api'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [speakers, setSpeakers] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [attendeeName, setAttendeeName] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState('')
  const [attendeePhone, setAttendeePhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  async function fetchEventDetails() {
    try {
      setLoading(true)

      const [eventRes, speakersRes, ticketsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/speakers/event/${id}`),
        api.get(`/tickets/event/${id}`)
      ])

      setEvent(eventRes.data)
      setSpeakers(speakersRes.data || [])
      setTickets(ticketsRes.data || [])
    } catch (error) {
      console.error('Fetch event details error:', error)
      setEvent(null)
      setSpeakers([])
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  function getLocation() {
    if (!event) return 'Location not available'
    if (event.location_type === 'online') return 'Online Event'
    if (event.custom_location) return event.custom_location
    if (event.venue_name) return event.venue_name
    return 'Location not available'
  }

  async function handleBook() {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please log in first to book tickets')
      navigate('/login')
      return
    }

    if (!selectedTicketId || !attendeeName || !attendeeEmail || !quantity) {
      setError('Please fill in all booking fields')
      return
    }

    try {
      setSubmitting(true)

      const bookingRes = await api.post('/bookings', {
        event_id: Number(id),
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
        attendee_phone: attendeePhone,
        items: [
          {
            ticket_type_id: Number(selectedTicketId),
            quantity: Number(quantity)
          }
        ]
      })

      const totalAmount = bookingRes.data.total_amount
      const bookingId = bookingRes.data.booking_id

      await api.post('/payments', {
        booking_id: bookingId,
        provider: 'manual',
        payment_method: 'manual',
        amount: totalAmount
      })

      setError('')
      navigate('/home/tickets')
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="empty-state">
          <h3>Loading event details...</h3>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="event-details-page">
        <div className="empty-state">
          <h3>Event not found</h3>
          <p>This event may not be published or available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="event-details-page">
      <div className="event-hero">
        <div className="event-hero-content">
          <div className="event-meta-header">
            <span className="event-day">{formatDate(event.start_date)}</span>
            <span className="event-type-badge session">
              {event.category_name || 'Event'}
            </span>
          </div>

          <h1 className="event-title">{event.title}</h1>
          <p className="event-description">{event.description}</p>

          <div className="event-details-info">
            <div className="detail-item">
              <Clock size={16} />
              <span>{event.start_time || 'Time not available'}</span>
            </div>

            <div className="detail-item">
              <MapPin size={16} />
              <span>{getLocation()}</span>
            </div>

            <div className="detail-item">
              <Calendar size={16} />
              <span>{formatDate(event.start_date)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="event-details-content">
        <div className="content-grid">
          <div className="main-content">
            <div className="speaker-section">
              <h2>Speakers</h2>

              {speakers.length > 0 ? (
                speakers.map((speaker) => (
                  <div className="speaker-card" key={speaker.event_speaker_id || speaker.speaker_id}>
                    <div className="speaker-info">
                      <h3>{speaker.name}</h3>
                      <p className="speaker-role">{speaker.title || 'Speaker'}</p>
                      <p className="speaker-company">{speaker.company || 'Guest Speaker'}</p>
                      <p className="speaker-bio">
                        {speaker.bio || speaker.topic_description || 'Speaker details will be updated soon.'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="speaker-card">
                  <div className="speaker-info">
                    <h3>No speakers listed yet</h3>
                    <p className="speaker-bio">Speaker information will be added soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-content">
            <div className="registration-section">
              <h3>Book Ticket</h3>
              <div className="registration-card">
                <div className="registration-info">
                  <h4>{event.title}</h4>
                  <p className="registration-date">{formatDate(event.start_date)}</p>
                  <p className="registration-time">{event.start_time || 'Time not available'}</p>
                  <p className="registration-location">{getLocation()}</p>
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                  <select
                    className="form-input"
                    value={selectedTicketId}
                    onChange={(e) => setSelectedTicketId(e.target.value)}
                  >
                    <option value="">Select Ticket</option>
                    {tickets.map((ticket) => (
                      <option key={ticket.id} value={ticket.id}>
                        {ticket.name} - ₱{Number(ticket.price).toLocaleString()}
                      </option>
                    ))}
                  </select>

                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />

                  <input
                    className="form-input"
                    placeholder="Full Name"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                  />

                  <input
                    className="form-input"
                    placeholder="Email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                  />

                  <input
                    className="form-input"
                    placeholder="Phone"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                  />

                  <button
                    className="register-btn"
                    onClick={handleBook}
                    disabled={submitting}
                  >
                    {submitting ? 'Booking...' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
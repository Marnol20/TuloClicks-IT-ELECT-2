import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import {
  MapPin,
  Clock,
  Calendar
} from 'lucide-react'
import BookingWizard from '../../components/user/BookingWizard'
import '../../styles/EventDetails.css'

function EventDetails() {
  const { id } = useParams()

  const [event, setEvent] = useState(null)
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    fetchEventDetails()
  }, [id])

  async function fetchEventDetails() {
    try {
      setLoading(true)

      const [eventRes, speakersRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/speakers/event/${id}`)
      ])

      setEvent(eventRes.data)
      setSpeakers(speakersRes.data || [])
    } catch (error) {
      console.error('Fetch event details error:', error)
      setEvent(null)
      setSpeakers([])
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
            {!showBooking ? (
              <div className="booking-popup">
                <div className="booking-popup-content">
                  <div className="booking-popup-icon">🎫</div>
                  <h3>Ready to Attend?</h3>
                  <p>Secure your spot for this event. Limited tickets available!</p>
                  <button 
                    className="btn-book-ticket"
                    onClick={() => setShowBooking(true)}
                  >
                    Book a Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div className="booking-wizard-container">
                <button 
                  className="btn-back-to-event"
                  onClick={() => setShowBooking(false)}
                >
                  ← Back to Event
                </button>
                <BookingWizard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  MapPin,
  Clock,
  Calendar,
  ArrowLeft,
  User
} from 'lucide-react'
import BookingWizard from '../../components/user/BookingWizard'
import EventReviews from '../../components/user/EventReviews' 
import '../../styles/EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

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

  const getCleanDate = (dateStr) => {
    if (!dateStr) return null;
    
    const d = new Date(dateStr);
    
    if (isNaN(d.getTime())) return dateStr.split('T')[0];

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  function formatDate(date) {
    const datePart = getCleanDate(date);
    if (!datePart) return 'No date';
    
    const d = new Date(datePart);
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString();
  }

  function formatDateTime(date, time) {
    const datePart = getCleanDate(date);
    if (!datePart || !time) return 'Not available';

    const combinedISO = `${datePart}T${time}`;
    const d = new Date(combinedISO);

    if (isNaN(d.getTime())) return 'Invalid Date';

    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function getEventStatus(event) {
    const now = new Date()
    
    try {
      let startDatePart = event.start_date
      if (startDatePart && startDatePart.includes('T')) {
        const utcDate = new Date(startDatePart)
        const offset = utcDate.getTimezoneOffset() * 60000
        const localDate = new Date(utcDate.getTime() - offset)
        startDatePart = localDate.toISOString().split('T')[0]
      }
      
      let endDatePart = event.end_date
      if (endDatePart && endDatePart.includes('T')) {
        const utcDate = new Date(endDatePart)
        const offset = utcDate.getTimezoneOffset() * 60000
        const localDate = new Date(utcDate.getTime() - offset)
        endDatePart = localDate.toISOString().split('T')[0]
      }
      
      const startTimeStr = event.start_time || '00:00:00'
      const endTimeStr = event.end_time || '23:59:59'
      
      const startDateTime = new Date(`${startDatePart}T${startTimeStr}`)
      const endDateTime = new Date(`${endDatePart}T${endTimeStr}`)
      
      if (now < startDateTime) {
        return '⏳ Not Yet Started'
      } else if (now >= startDateTime && now <= endDateTime) {
        return '🔴 Ongoing'
      } else {
        return '✓ Concluded'
      }
    } catch (error) {
      console.error('Date parsing error:', error)
      return '❓ Unknown'
    }
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
        {event.event_image ? (
          <div
            className="event-hero-bg"
            // UPDATED: Siguroha nga walay /api sa tunga sa image path
            style={{ backgroundImage: `url(${import.meta.env.VITE_API_URL}/uploads/events/${event.event_image})` }}
          />
        ) : (
          <div className="event-hero-bg-fallback" />
        )}

        <button
          className="btn-back-to-events"
          onClick={() => navigate('/home/events')}
          title="Back to Events"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
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
          </div>
        </div>
      </div>

      <div className="event-details-content">
        <div className="content-grid">
          <div className="main-content">
            <div className="event-info-section">
              <h2>Event Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <p className="info-label">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Start Date & Time
                  </p>
                  <p className="info-value">
                    {formatDateTime(event.start_date, event.start_time)}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    End Date & Time
                  </p>
                  <p className="info-value">
                    {formatDateTime(event.end_date, event.end_time)}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">
                    Event Status
                  </p>
                  <p style={{ fontSize: '1rem', color: '#f4f5f7', margin: 0, fontWeight: '500' }}>
                    {getEventStatus(event)}
                  </p>
                </div>
                <div className="info-item">
                  <p className="info-label">
                    <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Organizer
                  </p>
                  <p className="info-value">
                    {event.organizer_name || 'Not available'}
                  </p>
                </div>
              </div>
            </div>

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

            <hr className="my-10" style={{ borderColor: '#eee', margin: '40px 0' }} />
            <div className="reviews-section">
              <h2 className="section-title">Attendee Reviews</h2>
              <EventReviews eventId={id} />
            </div>
          </div>

          <div className="sidebar-content">
            {!showBooking ? (
              <div className="booking-popup">
                <div className="booking-popup-content">
                  <div className="booking-popup-icon">🎫</div>
                  
                  {getEventStatus(event) === '✓ Concluded' ? (
                    <>
                      <h3 style={{ color: '#ef4444' }}>Booking Closed</h3>
                      <p>Sorry, this event has concluded. Tickets are no longer available.</p>
                      <button 
                        className="btn-book-ticket"
                        style={{ backgroundColor: '#4b5563', cursor: 'not-allowed', opacity: 0.7 }}
                        disabled
                      >
                        Event Concluded
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>Ready to Attend?</h3>
                      <p>Secure your spot for this event. Limited tickets available!</p>
                      <button 
                        className="btn-book-ticket"
                        onClick={() => setShowBooking(true)}
                      >
                        Book a Ticket
                      </button>
                    </>
                  )}
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
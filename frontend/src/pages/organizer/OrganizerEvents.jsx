import { useEffect, useState } from 'react'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerEvents() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [venues, setVenues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [locationType, setLocationType] = useState('physical')
  const [customLocation, setCustomLocation] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchCategories()
    fetchVenues()
  }, [])

  async function fetchEvents() {
    try {
      const res = await api.get('/events/organizer/my-events')
      setEvents(res.data || [])
    } catch (error) {
      console.error('Fetch organizer events error:', error)
      setEvents([])
    }
  }

  async function fetchCategories() {
    try {
      const res = await api.get('/categories')
      setCategories(res.data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
      setCategories([])
    }
  }

  async function fetchVenues() {
    try {
      const res = await api.get('/venues')
      setVenues(res.data || [])
    } catch (error) {
      console.error('Fetch venues error:', error)
      setVenues([])
    }
  }

  async function handleCreate() {
    if (!title || !description || !categoryId || !startDate || !startTime) {
      setError('Please fill in all required fields')
      return
    }

    try {
      await api.post('/events', {
        title,
        description,
        category_id: Number(categoryId),
        venue_id: venueId ? Number(venueId) : null,
        start_date: startDate,
        start_time: startTime,
        location_type: locationType,
        custom_location: customLocation || null
      })

      setError('')
      setShowForm(false)
      setTitle('')
      setDescription('')
      setCategoryId('')
      setVenueId('')
      setStartDate('')
      setStartTime('')
      setLocationType('physical')
      setCustomLocation('')
      fetchEvents()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create event')
    }
  }

  async function handleSubmitForApproval(id) {
    try {
      await api.patch(`/events/${id}/submit`)
      setError('')
      fetchEvents()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit event')
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  return (
    <main className="events-page">
      <div className="events-top">
        <div className="events-title">
          <div>
            <h2>My Events</h2>
            <p>Create and manage your organizer events</p>
          </div>
        </div>

        <button className="new-event-btn" onClick={() => setShowForm(true)}>
          New Event
        </button>
      </div>

      {showForm && (
        <div className="create-form">
          <h3>Create New Event</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Event Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                className="form-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <select
                className="form-input"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
              >
                <option value="">Select Venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location Type</label>
              <select
                className="form-input"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
              >
                <option value="physical">Physical</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Custom Location</label>
              <input
                className="form-input"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Optional custom location"
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short event description"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate}>
              Create Event
            </button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-card-top">
              <div>
                <h3>{event.title}</h3>
                <p className="event-description">{event.description}</p>
              </div>

              <span
                className={`badge ${
                  event.approval_status === 'approved'
                    ? 'confirmed'
                    : event.approval_status === 'pending'
                    ? 'planning'
                    : 'cancelled'
                }`}
              >
                {event.approval_status}
              </span>
            </div>

            <div className="event-card-info">
              <div className="info-block">
                <span className="info-label">Date</span>
                <span className="info-value">{formatDate(event.start_date)}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Time</span>
                <span className="info-value">{event.start_time || 'N/A'}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Venue</span>
                <span className="info-value">
                  {event.venue_name || event.custom_location || 'N/A'}
                </span>
              </div>

              <div className="info-block">
                <span className="info-label">Category</span>
                <span className="info-value">{event.category_name || 'N/A'}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Publish</span>
                <span className="info-value">{event.publish_status}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button
                className="create-btn"
                onClick={() => handleSubmitForApproval(event.id)}
              >
                Submit for Approval
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerEvents
import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerEvents() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [venues, setVenues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [venueId, setVenueId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [locationType, setLocationType] = useState('physical')
  const [customLocation, setCustomLocation] = useState('')
  const [eventImage, setEventImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchData('/events/organizer/my-events', setEvents)
    fetchData('/categories', setCategories)
    fetchData('/venues', setVenues)
  }, [])

  async function fetchData(endpoint, setState) {
    try {
      const res = await api.get(endpoint)
      setState(res.data || [])
    } catch (error) {
      console.error(`Fetch error from ${endpoint}:`, error)
      setState([])
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setEventImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleCreate() {
    if (!title || !description || !categoryId || !startDate || !startTime) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    setLoading(true)
    try {
      if (eventImage) {
        // Send with FormData if image exists
        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('category_id', categoryId)
        formData.append('venue_id', venueId || '')
        formData.append('start_date', startDate)
        formData.append('end_date', endDate || '')
        formData.append('start_time', startTime)
        formData.append('end_time', endTime || '')
        formData.append('location_type', locationType)
        formData.append('custom_location', customLocation || '')
        formData.append('event_image', eventImage)

        if (editingId) {
          await api.put(`/events/${editingId}`, formData)
          addToast('Event updated successfully', 'success')
        } else {
          await api.post('/events', formData)
          addToast('Event created successfully', 'success')
        }
      } else {
        // Send without FormData if no image
        const payload = {
          title,
          description,
          category_id: Number(categoryId),
          venue_id: venueId ? Number(venueId) : null,
          start_date: startDate,
          end_date: endDate || null,
          start_time: startTime,
          end_time: endTime || null,
          location_type: locationType,
          custom_location: customLocation || null
        }

        if (editingId) {
          await api.put(`/events/${editingId}`, payload)
          addToast('Event updated successfully', 'success')
        } else {
          await api.post('/events', payload)
          addToast('Event created successfully', 'success')
        }
      }

      resetForm()
      fetchData('/events/organizer/my-events', setEvents)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save event', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/events/${id}`)
      addToast('Event deleted successfully', 'success')
      fetchData('/events/organizer/my-events', setEvents)
    } catch (error) {
      addToast('Failed to delete event', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitForApproval(id) {
    try {
      await api.patch(`/events/${id}/submit`)
      addToast('Event submitted for approval', 'success')
      fetchData('/events/organizer/my-events', setEvents)
    } catch (error) {
      addToast('Failed to submit event', 'error')
    }
  }

  function handleEdit(event) {
    setEditingId(event.id)
    setTitle(event.title)
    setDescription(event.description)
    setCategoryId(event.category_id)
    setVenueId(event.venue_id || '')
    
    // I-format ang dates para sa HTML5 date input (YYYY-MM-DD)
    if (event.start_date) {
      setStartDate(new Date(event.start_date).toISOString().split('T')[0])
    }
    if (event.end_date) {
      setEndDate(new Date(event.end_date).toISOString().split('T')[0])
    }
    
    setStartTime(event.start_time)
    setEndTime(event.end_time || '')
    setLocationType(event.location_type || 'physical')
    setCustomLocation(event.custom_location || '')

     // Show current event image
  if (event.event_image) {
    setPreviewUrl(`http://localhost:5000/uploads/events/${event.event_image}`)
  }
  
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setTitle('')
    setDescription('')
    setCategoryId('')
    setVenueId('')
    setStartDate('')
    setEndDate('')
    setStartTime('')
    setEndTime('')
    setLocationType('physical')
    setCustomLocation('')
    setEventImage(null)
    setPreviewUrl('')
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
          <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Event Title *</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
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
              <label>Start Date *</label>
              <input
                className="form-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                className="form-input"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Start Time *</label>
              <input
                className="form-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                className="form-input"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Venue</label>
              <select
                className="form-input"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short event description"
                disabled={loading}
              />
            </div>

            <div className="form-group full-width">
              <label>Event Poster (Image)</label>
              <div className="image-upload-wrapper" style={{ border: '1px dashed #374151', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px', borderRadius: '8px', objectFit: 'contain' }} />
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="form-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate} disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
            </button>
            <button className="cancel-btn" onClick={resetForm} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {events.map((event) => (
          <div key={event.id} className="event-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#1e293b', 
            borderRadius: '12px', 
            overflow: 'hidden',
            border: '1px solid #334155'
          }}>
            {/* Landscape Event Image */}
            <div style={{ width: '100%', height: '220px', backgroundColor: '#0f172a', position: 'relative' }}>
              {event.event_image ? (
                <img
                  src={`http://localhost:5000/uploads/events/${event.event_image}`}
                  alt={event.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  No Image Available
                </div>
              )}
              
              <span className={`badge ${event.approval_status === 'approved' ? 'confirmed' : event.approval_status === 'pending' ? 'planning' : 'cancelled'}`} 
                    style={{ position: 'absolute', top: '15px', right: '15px' }}>
                {event.approval_status}
              </span>
            </div>

            {/* Event Details */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: '#f8fafc' }}>{event.title}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>{event.description}</p>
              </div>

              <div className="event-card-info" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '15px',
                borderTop: '1px solid #334155',
                paddingTop: '15px'
              }}>
                <div className="info-block">
                  <span className="info-label">Date</span>
                  <span className="info-value">{formatDate(event.start_date)}</span>
                </div>

                <div className="info-block">
                  <span className="info-label">Time</span>
                  <span className="info-value">{event.start_time}</span>
                </div>

                <div className="info-block">
                  <span className="info-label">Venue</span>
                  <span className="info-value">{event.venue_name || event.custom_location || 'N/A'}</span>
                </div>

                <div className="info-block">
                  <span className="info-label">Category</span>
                  <span className="info-value">{event.category_name}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <div className="event-status" style={{ fontSize: '14px', fontWeight: 'bold', flex: 1 }}>
                  {event.approval_status === "pending" && <span style={{ color: '#eab308' }}>Waiting for approval</span>}
                  {event.approval_status === "approved" && <span style={{ color: '#10b981' }}>Event Approved</span>}
                  {event.approval_status === "rejected" && <span style={{ color: '#ef4444' }}>Event Rejected</span>}
                </div>
                
                <button className="create-btn" onClick={() => handleEdit(event)} disabled={loading}>Edit</button>
                <button className="cancel-btn" onClick={() => handleDelete(event.id)} disabled={loading} style={{ backgroundColor: '#ef4444' }}>Delete</button>
                
                {event.publish_status === "draft" && event.approval_status !== "pending" && (
                  <button className="create-btn" onClick={() => handleSubmitForApproval(event.id)} disabled={loading} style={{ backgroundColor: '#8b5cf6' }}>
                    Submit for Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerEvents
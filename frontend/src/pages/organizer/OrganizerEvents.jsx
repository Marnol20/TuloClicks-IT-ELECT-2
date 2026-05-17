import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import { Plus, Building } from 'lucide-react'
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

  const [showVenueProposalModal, setShowVenueProposalModal] = useState(false)
  const [vName, setVName] = useState('')
  const [vAddress, setVAddress] = useState('')
  const [vCity, setVCity] = useState('')
  const [vCapacity, setVCapacity] = useState('')
  const [vPhone, setVPhone] = useState('')

  useEffect(() => {
    fetchData('/events/organizer/my-events', setEvents)
    fetchData('/categories', setCategories)
    fetchData('/venues/approved', setVenues)
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

  async function handleProposeVenueSubmit(e) {
    e.preventDefault()
    if (!vName || !vAddress || !vCity || !vCapacity || !vPhone) {
      addToast('Please complete all venue fields.', 'warning')
      return
    }
    if (vPhone.length !== 11) {
      addToast('Contact phone must be exactly 11 digits.', 'error')
      return
    }

    try {
      setLoading(true)
      await api.post('/venues', {
        name: vName,
        address: vAddress,
        city: vCity,
        capacity: Number(vCapacity),
        contact_phone: vPhone
      })
      addToast('Venue proposal submitted successfully! Pending admin verification routing clearance.', 'success')
      
      setVName(''); setVAddress(''); setVCity(''); setVCapacity(''); setVPhone('');
      setShowVenueProposalModal(false)
      fetchData('/venues/approved', setVenues)
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit proposal', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!title || !description || !categoryId || !startDate || !startTime) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    if (locationType === 'physical' && !venueId && !customLocation) {
      addToast('Physical events strictly require a verified Venue selection or a Custom Location text description input.', 'warning')
      return
    }

    if (locationType === 'hybrid' && !venueId && !customLocation) {
      addToast('Hybrid formats require a physical venue binding or location description to coordinate physical attendee routing setup.', 'warning')
      return
    }

    setLoading(true)
    try {
      if (eventImage) {
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
    
    if (event.start_date) {
      const utcDate = new Date(event.start_date)
      const offset = utcDate.getTimezoneOffset() * 60000
      const localDate = new Date(utcDate.getTime() - offset)
      const startDateStr = localDate.toISOString().split('T')[0]
      setStartDate(startDateStr)
    }
    if (event.end_date) {
      const utcDate = new Date(event.end_date)
      const offset = utcDate.getTimezoneOffset() * 60000
      const localDate = new Date(utcDate.getTime() - offset)
      const endDateStr = localDate.toISOString().split('T')[0]
      setEndDate(endDateStr)
    }
    
    setStartTime(event.start_time)
    setEndTime(event.end_time || '')
    setLocationType(event.location_type || 'physical')
    setCustomLocation(event.custom_location || '')

    if (event.event_image) {
      setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/events/${event.event_image}`)
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

  return (
    <main className="events-page">
      {/* ORGANIZER PROPOSAL MODAL WINDOW OVERLAY CONTAINER */}
      {showVenueProposalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(6, 10, 22, 0.9)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '30px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Building size={22} color="#8b5cf6" />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Propose New Physical Venue</h3>
            </div>
            <form onSubmit={handleProposeVenueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Venue / Establishment Name *</label>
                <input className="form-input" type="text" placeholder="e.g. University of Cebu Theater" value={vName} onChange={(e) => setVName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Full Physical Address *</label>
                <input className="form-input" type="text" placeholder="Street name, Barangay description" value={vAddress} onChange={(e) => setVAddress(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>City Location *</label>
                <input className="form-input" type="text" placeholder="e.g. Cebu City" value={vCity} onChange={(e) => setVCity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Maximum Audience Capacity *</label>
                <input className="form-input" type="number" placeholder="Maximum seating allocation count" value={vCapacity} onChange={(e) => setVCapacity(e.target.value)} required />
              </div>
              <div className="form-group">
                <label style={{ color: '#cbd5e1' }}>Contact Phone (11-Digits) *</label>
                <input className="form-input" type="text" placeholder="09XXXXXXXXX" maxLength={11} value={vPhone} onChange={(e) => setVPhone(e.target.value.replace(/\D/g, ''))} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="create-btn" style={{ flex: 1 }}>Submit Proposal</button>
                <button type="button" className="cancel-btn" style={{ flex: 1 }} onClick={() => setShowVenueProposalModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED TOP BUTTONS CONTAINER: Perfectly groups action controls at the top layout bar */}
      <div className="events-top">
        <div className="events-title">
          <div>
            <h2>My Events</h2>
            <p>Create and manage your organizer events</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* FIXED LINK LOCATION: Moved proposal link to the main navigation header */}
          <button type="button" className="new-event-btn" style={{ backgroundColor: '#1e293b', color: '#a78bfa', border: '1px solid #4c1d95' }} onClick={() => setShowVenueProposalModal(true)}>
            <Plus size={14} /> Propose New Venue
          </button>
          <button className="new-event-btn" onClick={() => setShowForm(true)}>
            New Event
          </button>
        </div>
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

            <div className="form-section">
              <h4 className="form-section-title">Event Schedule</h4>
              <div className="date-time-grid">
                <div className="date-time-group">
                  <label>Start Date *</label>
                  <div className="date-time-input-wrapper">
                    <input
                      className="form-input date-time-input"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={loading}
                    />
                    {startDate && (
                      <span className="date-preview">
                        {new Date(startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="date-time-group">
                  <label>Start Time *</label>
                  <div className="date-time-input-wrapper">
                    <input
                      className="form-input date-time-input"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={loading}
                    />
                    {startTime && (
                      <span className="time-preview">
                        {new Date(`2000-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="date-time-group">
                  <label>End Date</label>
                  <div className="date-time-input-wrapper">
                    <input
                      className="form-input date-time-input"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={loading}
                    />
                    {endDate && (
                      <span className="date-preview">
                        {new Date(endDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="date-time-group">
                  <label>End Time</label>
                  <div className="date-time-input-wrapper">
                    <input
                      className="form-input date-time-input"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={loading}
                    />
                    {endTime && (
                      <span className="time-preview">
                        {new Date(`2000-01-01T${endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {startDate && startTime && (
                <div className="event-duration-summary">
                  <div className="duration-item">
                    <span className="duration-label">Event Start:</span>
                    <span className="duration-value">
                      {new Date(`${startDate}T${startTime}`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    </span>
                  </div>
                  {endDate && endTime && (
                    <div className="duration-item">
                      <span className="duration-label">Event End:</span>
                      <span className="duration-value">
                        {new Date(`${endDate}T${endTime}`).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CLEAN DROPDOWN CONTAINER Layout */}
            <div className="form-group">
              <label>Venue {(locationType === 'physical' || locationType === 'hybrid') && '*'}</label>
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
            <div style={{ width: '100%', height: '220px', backgroundColor: '#0f172a', position: 'relative' }}>
              {event.event_image ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/events/${event.event_image}`}
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
                  <span className="info-label">Start Date</span>
                  <span className="info-value">{formatDate(event.start_date)} at {event.start_time}</span>
                </div>
                <div className="info-block">
                  <span className="info-label">End Date</span>
                  <span className="info-value">{formatDate(event.end_date)} at {event.end_time}</span>
                </div>
                <div className="info-block">
                  <span className="info-label">Status</span>
                  <span className="info-value">{getEventStatus(event)}</span>
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
import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerSpeakers() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [speakers, setSpeakers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // State para sa Edit mode

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchSpeakers(selectedEvent)
    } else {
      setSpeakers([])
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

  async function fetchSpeakers(eventId) {
    try {
      const res = await api.get(`/speakers/manage/event/${eventId}`)
      setSpeakers(res.data || [])
    } catch (error) {
      console.error('Fetch speakers error:', error)
      setSpeakers([])
    }
  }

  // Handle Create and Update
  async function handleSave() {
    if (!selectedEvent || !name) {
      addToast('Please select an event and enter a speaker name', 'warning')
      return
    }

    try {
      const payload = {
        event_id: Number(selectedEvent),
        name,
        title,
        company,
        email,
        bio
      }

      if (editingId) {
        // UPDATE Logic
        await api.put(`/speakers/${editingId}`, payload)
        addToast('Speaker updated successfully', 'success')
      } else {
        // CREATE Logic
        await api.post('/speakers', payload)
        addToast('Speaker created successfully', 'success')
      }

      resetForm()
      fetchSpeakers(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save speaker', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this speaker?')) return

    try {
      await api.delete(`/speakers/${id}`)
      addToast('Speaker deleted successfully', 'success')
      fetchSpeakers(selectedEvent)
    } catch (error) {
      addToast('Failed to delete speaker', 'error')
    }
  }

  function handleEdit(speaker) {
    setEditingId(speaker.speaker_id || speaker.id)
    setName(speaker.name)
    setTitle(speaker.title || '')
    setCompany(speaker.company || '')
    setEmail(speaker.email || '')
    setBio(speaker.bio || '')
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setTitle('')
    setCompany('')
    setEmail('')
    setBio('')
  }

  return (
    <main className="speakers-page">
      <div className="speakers-top">
        <div className="speakers-title">
          <div>
            <h2>Speakers</h2>
            <p>Manage speakers for your events</p>
          </div>
        </div>

        <button className="add-speaker-btn" onClick={() => setShowForm(true)}>
          Add Speaker
        </button>
      </div>

      <div className="create-form">
        <h3>Select Event</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Event</label>
            <select
              className="form-input"
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
      </div>

      {showForm && (
        <div className="create-form">
          <h3>{editingId ? 'Edit Speaker' : 'Add New Speaker'}</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter speaker name"
              />
            </div>
            {/* ... (uban nga input fields title, company, email) */}
            <div className="form-group">
              <label>Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Speaker title"
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                className="form-input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company or organization"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Speaker email"
              />
            </div>

            <div className="form-group full-width">
              <label>Bio</label>
              <textarea
                className="form-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short speaker bio"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button className="create-btn" onClick={handleSave}>
              {editingId ? 'Update Speaker' : 'Create Speaker'}
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <div key={speaker.speaker_id || speaker.id} className="speaker-card">
            <div className="speaker-card-header">
              <div>
                <h3 className="speaker-name">{speaker.name}</h3>
                <p className="speaker-role" style={{ color: '#10b981' }}>{speaker.title || 'Speaker'}</p>
                <p className="speaker-company">{speaker.company || 'Guest Speaker'}</p>
              </div>
            </div>

            <div className="speaker-body">
              <p className="speaker-email" style={{ fontSize: '13px', opacity: 0.8 }}>{speaker.email}</p>
              <p className="speaker-bio" style={{ marginTop: '10px', fontSize: '14px' }}>{speaker.bio}</p>
            </div>

            <div className="speaker-footer" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button 
                className="create-btn" 
                onClick={() => handleEdit(speaker)}
                style={{ padding: '5px 15px', fontSize: '12px' }}
              >
                Edit
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => handleDelete(speaker.speaker_id || speaker.id)}
                style={{ padding: '5px 15px', fontSize: '12px', backgroundColor: '#ef4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerSpeakers
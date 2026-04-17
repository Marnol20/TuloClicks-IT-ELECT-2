import { useEffect, useState } from 'react'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerSpeakers() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [speakers, setSpeakers] = useState([])
  const [showForm, setShowForm] = useState(false)

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

  async function handleCreate() {
    if (!selectedEvent || !name) {
      alert('Please select an event and enter a speaker name')
      return
    }

    try {
      await api.post('/speakers', {
        event_id: Number(selectedEvent),
        name,
        title,
        company,
        email,
        bio
      })

      alert('Speaker created successfully')
      setShowForm(false)
      setName('')
      setTitle('')
      setCompany('')
      setEmail('')
      setBio('')
      fetchSpeakers(selectedEvent)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create speaker')
    }
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
          <h3>Add New Speaker</h3>

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
            <button className="create-btn" onClick={handleCreate}>
              Create Speaker
            </button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="speakers-grid">
        {speakers.map((speaker) => (
          <div key={speaker.event_speaker_id || speaker.speaker_id} className="speaker-card">
            <div className="speaker-card-header">
              <div>
                <h3 className="speaker-name">{speaker.name}</h3>
                <p className="speaker-role">{speaker.title || 'Speaker'}</p>
                <p className="speaker-event-label">{speaker.company || 'Guest Speaker'}</p>
              </div>
            </div>

            <div className="speaker-footer">
              <p className="speaker-email">{speaker.email || 'No email'}</p>
              <p className="speaker-email">{speaker.bio || 'No bio available'}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerSpeakers
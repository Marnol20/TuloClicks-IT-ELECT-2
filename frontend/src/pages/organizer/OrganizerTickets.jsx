import { useEffect, useState } from 'react'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerTickets() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchTickets(selectedEvent)
    } else {
      setTickets([])
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

  async function fetchTickets(eventId) {
    try {
      const res = await api.get(`/tickets/manage/event/${eventId}`)
      setTickets(res.data || [])
    } catch (error) {
      console.error('Fetch tickets error:', error)
      setTickets([])
    }
  }

  async function handleCreate() {
    if (!selectedEvent || !name || !price || !quantity) {
      setError('Please fill in all required fields')
      return
    }

    try {
      await api.post('/tickets', {
        event_id: Number(selectedEvent),
        name,
        description,
        price: Number(price),
        quantity_available: Number(quantity)
      })

      setError('')
      setShowForm(false)
      setName('')
      setDescription('')
      setPrice('')
      setQuantity('')
      fetchTickets(selectedEvent)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create ticket')
    }
  }

  return (
    <main className="events-page">
      <div className="events-top">
        <div className="events-title">
          <div>
            <h2>Tickets</h2>
            <p>Manage ticket types and prices for your events</p>
          </div>
        </div>

        <button className="new-event-btn" onClick={() => setShowForm(true)}>
          Add Ticket
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
          <h3>Create Ticket Type</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Ticket Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter ticket name"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short ticket description"
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                className="form-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Quantity Available</label>
              <input
                className="form-input"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter available quantity"
              />
            </div>
          </div>

          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate}>
              Create Ticket
            </button>
            <button className="cancel-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="event-card">
            <div className="event-card-top">
              <div>
                <h3>{ticket.name}</h3>
                <p className="event-description">{ticket.description || 'No description'}</p>
              </div>

              <span className={`badge ${ticket.is_active ? 'confirmed' : 'cancelled'}`}>
                {ticket.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="event-card-info">
              <div className="info-block">
                <span className="info-label">Price</span>
                <span className="info-value">₱{Number(ticket.price).toLocaleString()}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Available</span>
                <span className="info-value">{ticket.quantity_available}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Sold</span>
                <span className="info-value">{ticket.quantity_sold}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Sale Start</span>
                <span className="info-value">{ticket.sale_start || 'N/A'}</span>
              </div>

              <div className="info-block">
                <span className="info-label">Sale End</span>
                <span className="info-value">{ticket.sale_end || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default OrganizerTickets
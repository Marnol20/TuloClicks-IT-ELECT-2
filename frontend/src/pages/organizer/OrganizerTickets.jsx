import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Events.css'
import api from '../../services/api'

function OrganizerTickets() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [tickets, setTickets] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null) // Para sa Edit mode

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

  async function handleSave() {
    if (!selectedEvent || !name || !price || !quantity) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    try {
      const payload = {
        event_id: Number(selectedEvent),
        name,
        description,
        price: Number(price),
        quantity_available: Number(quantity)
      }

      if (editingId) {
        // UPDATE
        await api.put(`/tickets/${editingId}`, payload)
        addToast('Ticket type updated successfully', 'success')
      } else {
        // CREATE
        await api.post('/tickets', payload)
        addToast('Ticket type created successfully', 'success')
      }

      resetForm()
      fetchTickets(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save ticket', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this ticket type? This cannot be undone.')) return

    try {
      await api.delete(`/tickets/${id}`)
      addToast('Ticket deleted successfully', 'success')
      fetchTickets(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to delete ticket', 'error')
    }
  }

  function handleEdit(ticket) {
    setEditingId(ticket.id)
    setName(ticket.name)
    setDescription(ticket.description || '')
    setPrice(ticket.price)
    setQuantity(ticket.quantity_available)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setDescription('')
    setPrice('')
    setQuantity('')
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
          <h3>{editingId ? 'Edit Ticket Type' : 'Create Ticket Type'}</h3>

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
            <button className="create-btn" onClick={handleSave}>
              {editingId ? 'Update Ticket' : 'Create Ticket'}
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-list">
        {tickets.length === 0 && selectedEvent && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>No tickets found for this event.</p>
        )}
        
        {tickets.map((ticket) => (
          <div key={ticket.id} className="event-card">
            <div className="event-card-top">
              <div>
                <h3>{ticket.name}</h3>
                <p className="event-description">{ticket.description || 'No description'}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${ticket.is_active ? 'confirmed' : 'cancelled'}`}>
                  {ticket.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
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
            </div>

            <div className="event-card-footer" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button 
                className="create-btn" 
                onClick={() => handleEdit(ticket)}
                style={{ padding: '6px 15px', fontSize: '12px' }}
              >
                Edit
              </button>
              <button 
                className="cancel-btn" 
                onClick={() => handleDelete(ticket.id)}
                style={{ padding: '6px 15px', fontSize: '12px', backgroundColor: '#ef4444' }}
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

export default OrganizerTickets
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
  const [editingId, setEditingId] = useState(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0.00')
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
        await api.put(`/tickets/${editingId}`, payload)
        addToast('Ticket updated successfully', 'success')
      } else {
        await api.post('/tickets', payload)
        addToast('Ticket created successfully', 'success')
      }

      resetForm()
      fetchTickets(selectedEvent)
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to save ticket', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ticket type?')) return
    try {
      await api.delete(`/tickets/${id}`)
      addToast('Ticket deleted', 'success')
      fetchTickets(selectedEvent)
    } catch (error) {
      addToast('Failed to delete', 'error')
    }
  }

  function handleEdit(ticket) {
    setEditingId(ticket.id)
    setName(ticket.name)
    setDescription(ticket.description || '')
    setPrice(ticket.price)
    setQuantity(ticket.quantity_available)
    setShowForm(true)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setDescription('')
    setPrice('0.00')
    setQuantity('')
  }

  return (
    <main className="events-page">
      <div className="events-top">
        <div className="events-title">
          <h2>Ticket Management</h2>
          <p>Manage access and pricing for your events</p>
        </div>
        <button 
          className="new-event-btn" 
          onClick={() => setShowForm(true)}
          disabled={!selectedEvent}
          title={!selectedEvent ? "Select an event first" : ""}
        >
          + Add New Ticket Type
        </button>
      </div>

      <div className="create-form" style={{ marginBottom: '20px' }}>
        <label>Step 1: Select Event to Manage</label>
        <select
          className="form-input"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{ marginTop: '10px' }}
        >
          <option value="">-- Select an Event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="create-form" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#1a202c' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Update Ticket' : 'Create New Ticket Type'}</h3>
            
            <div className="form-group">
              <label>Ticket Name (Type)</label>
              <select className="form-input" value={name} onChange={(e) => setName(e.target.value)}>
                <option value="">-- Select Type --</option>
                <option value="VIP">VIP</option>
                <option value="Normal">Normal</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Student">Student</option>
              </select>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Price (₱)</label>
              <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Quantity</label>
              <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Description (Optional)</label>
              <textarea 
                className="form-input" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                style={{ height: '80px', paddingTop: '10px' }}
                placeholder="e.g. Includes free drinks"
              />
            </div>

            <div className="form-buttons" style={{ marginTop: '25px' }}>
              <button className="create-btn" onClick={handleSave}>Save Ticket</button>
              <button className="cancel-btn" onClick={resetForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TICKETS LIST --- */}
      <div className="events-list">
        {tickets.length === 0 && selectedEvent ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>No tickets created for this event yet.</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="event-card">
              <div className="event-card-top">
                <div>
                  <h3 style={{ color: '#6366f1' }}>{ticket.name}</h3>
                  <p>{ticket.description || 'No description'}</p>
                </div>
                <span className={`badge ${ticket.is_active ? 'confirmed' : 'cancelled'}`}>
                  {ticket.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="event-card-info" style={{ marginTop: '15px' }}>
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="create-btn" onClick={() => handleEdit(ticket)} style={{ padding: '5px 15px' }}>Edit</button>
                <button className="cancel-btn" onClick={() => handleDelete(ticket.id)} style={{ padding: '5px 15px', backgroundColor: '#ef4444' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default OrganizerTickets
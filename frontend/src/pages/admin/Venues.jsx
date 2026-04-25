import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Events.css'
import api from '../../services/api'

function Venues() {
  const { addToast } = useToast()
  const [venues, setVenues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  // Form States
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [country, setCountry] = useState('Philippines')
  const [postalCode, setPostalCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  useEffect(() => {
    fetchVenues()
  }, [])

  async function fetchVenues() {
    try {
      const res = await api.get('/venues')
      setVenues(res.data || [])
    } catch (error) {
      console.error('Fetch venues error:', error)
      setVenues([])
    }
  }

  // Function para i-handle ang phone input (numero ra ug 11 digits max)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Tangtangon ang dili numero
    if (value.length <= 11) {
      setContactPhone(value)
    }
  }

  async function handleSave() {
    // Basic Validation
    if (!name || !address || !city || !capacity || !contactPhone) {
      addToast('Please fill in all required fields', 'warning')
      return
    }

    // Phone Validation (11 digits check)
    if (contactPhone.length !== 11) {
      addToast('Contact phone must be exactly 11 digits (e.g., 09XXXXXXXXX)', 'error')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        name,
        address,
        city,
        province,
        country,
        postal_code: postalCode, 
        capacity: Number(capacity),
        contact_person: contactPerson,
        contact_phone: contactPhone,
        contact_email: contactEmail
      }

      if (editingId) {
        // UPDATE Logic
        await api.put(`/venues/${editingId}`, payload)
        addToast('Venue updated successfully', 'success')
      } else {
        // CREATE Logic
        await api.post('/venues', payload)
        addToast('Venue created successfully', 'success')
      }

      resetForm()
      fetchVenues()
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to save venue'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this venue?')) return

    setLoading(true)
    try {
      await api.delete(`/venues/${id}`)
      addToast('Venue deleted successfully', 'success')
      fetchVenues()
    } catch (error) {
      addToast('Failed to delete venue', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(venue) {
    setEditingId(venue.id)
    setName(venue.name)
    setAddress(venue.address)
    setCity(venue.city)
    setProvince(venue.province || '')
    setCountry(venue.country || 'Philippines')
    setPostalCode(venue.postal_code || '')
    setCapacity(venue.capacity)
    setContactPerson(venue.contact_person || '')
    setContactPhone(venue.contact_phone || '')
    setContactEmail(venue.contact_email || '')
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setName('')
    setAddress('')
    setCity('')
    setProvince('')
    setCountry('Philippines')
    setPostalCode('')
    setCapacity('')
    setContactPerson('')
    setContactPhone('')
    setContactEmail('')
    setError('')
  }

  return (
    <main className="venues-page">
      <div className="venues-top">
        <div className="venues-title">
          <div>
            <h2>Venues</h2>
            <p>Admin Control: Manage event venues and locations</p>
          </div>
        </div>
        <button className="add-venue-btn" onClick={() => setShowForm(true)}>Add Venue</button>
      </div>

      {showForm && (
        <div className="create-form">
          <h3>{editingId ? 'Edit Venue' : 'Add New Venue'}</h3>
          
          <div className="form-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px' 
          }}>
            <div className="form-group">
              <label>Venue Name</label>
              <input 
                className="form-input" 
                placeholder="Enter venue name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input 
                className="form-input" 
                placeholder="Enter full address"
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input 
                className="form-input" 
                placeholder="Enter city"
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label>Province</label>
              <input 
                className="form-input" 
                placeholder="Enter province"
                value={province} 
                onChange={(e) => setProvince(e.target.value)} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label>Capacity</label>
              <input 
                className="form-input" 
                type="number" 
                placeholder="Enter capacity"
                value={capacity} 
                onChange={(e) => setCapacity(e.target.value)} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input 
                className="form-input" 
                type="text"
                placeholder="09XXXXXXXXX" 
                value={contactPhone} 
                onChange={handlePhoneChange} 
                maxLength={11}
                disabled={loading} 
              />
              <small style={{ color: '#64748b', fontSize: '12px' }}>
                {contactPhone.length}/11 digits
              </small>
            </div>
          </div>

          <div className="form-buttons" style={{ display: 'flex', gap: '10px' }}>
            <button className="create-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Venue' : 'Create Venue'}
            </button>
            <button className="cancel-btn" onClick={resetForm} disabled={loading}>Cancel</button>
          </div>
        </div>
      )}

      <div className="venues-list">
        {venues.map((venue) => (
          <div key={venue.id} className="venue-card">
            <div className="venue-card-top">
              <div>
                <h3>{venue.name}</h3>
                <p className="venue-address">{venue.address}</p>
              </div>
            </div>
            <div className="venue-card-info">
              <div className="info-block">
                <span className="info-label">City</span>
                <span className="info-value">{venue.city}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Capacity</span>
                <span className="info-value">{venue.capacity}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Contact</span>
                <span className="info-value contact-blue">{venue.contact_phone || 'N/A'}</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button className="create-btn" onClick={() => handleEdit(venue)} disabled={loading}>Edit</button>
              <button className="cancel-btn" onClick={() => handleDelete(venue.id)} disabled={loading} style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default Venues
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Venues.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function Venues() {
  const { addToast } = useToast()
  const [venues, setVenues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => { fetchVenues() }, [])

  async function fetchVenues() {
    try {
      const res = await api.get('/venues')
      setVenues(res.data || [])
    } catch {
      setVenues([])
    }
  }

  function handlePhoneChange(e) {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) setContactPhone(value)
  }

  async function handleSave() {
    if (!name || !address || !city || !capacity || !contactPhone) {
      addToast('Please fill in all required fields', 'warning')
      return
    }
    if (contactPhone.length !== 11) {
      addToast('Contact phone must be exactly 11 digits (e.g. 09XXXXXXXXX)', 'error')
      return
    }

    setLoading(true)
    setError('')
    try {
      const payload = { name, address, city, province, country, postal_code: postalCode, capacity: Number(capacity), contact_person: contactPerson, contact_phone: contactPhone, contact_email: contactEmail }
      if (editingId) {
        await api.put(`/venues/${editingId}`, payload)
        addToast('Venue updated successfully', 'success')
      } else {
        await api.post('/venues', payload)
        addToast('Venue created successfully', 'success')
      }
      resetForm()
      fetchVenues()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save venue'
      setError(msg)
      addToast(msg, 'error')
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
    } catch {
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
    setName(''); setAddress(''); setCity(''); setProvince('')
    setCountry('Philippines'); setPostalCode(''); setCapacity('')
    setContactPerson(''); setContactPhone(''); setContactEmail('')
    setError('')
  }

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(245,158,11,0.38) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Venues</h2>
          <p>Manage event venues and locations used by organizers across the platform.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat yellow">
            <span className="admin-hero-stat-val">{venues.length}</span>
            <span className="admin-hero-stat-label">Total Venues</span>
          </div>
          <div>
            <button className="admin-add-btn" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Venue
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="create-form">
          <h3>{editingId ? 'Edit Venue' : 'Add New Venue'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Venue Name <span style={{ color: '#f87171' }}>*</span></label>
              <input className="form-input" placeholder="Enter venue name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Address <span style={{ color: '#f87171' }}>*</span></label>
              <input className="form-input" placeholder="Enter full address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>City <span style={{ color: '#f87171' }}>*</span></label>
              <input className="form-input" placeholder="Enter city" value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input className="form-input" placeholder="Enter province" value={province} onChange={(e) => setProvince(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Capacity <span style={{ color: '#f87171' }}>*</span></label>
              <input className="form-input" type="number" placeholder="Enter capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} disabled={loading} />
            </div>
            <div className="form-group">
              <label>Contact Phone <span style={{ color: '#f87171' }}>*</span></label>
              <input className="form-input" type="text" placeholder="09XXXXXXXXX" value={contactPhone} onChange={handlePhoneChange} maxLength={11} disabled={loading} />
              <small style={{ color: '#64748b', fontSize: '11px', marginTop: '4px' }}>{contactPhone.length}/11 digits</small>
            </div>
          </div>
          {error && <p className="admin-error-msg">{error}</p>}
          <div className="form-buttons">
            <button className="create-btn" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving…' : editingId ? 'Update Venue' : 'Create Venue'}
            </button>
            <button className="cancel-btn" onClick={resetForm} disabled={loading}>Cancel</button>
          </div>
        </div>
      )}

      <div className="venues-list">
        {venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.4)' }}>No venues found.</div>
        ) : (
          venues.map((venue) => (
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
              <div className="row-actions" style={{ marginTop: '14px' }}>
                <button className="table-action-btn" onClick={() => handleEdit(venue)} disabled={loading}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="table-action-btn danger" onClick={() => handleDelete(venue.id)} disabled={loading}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default Venues

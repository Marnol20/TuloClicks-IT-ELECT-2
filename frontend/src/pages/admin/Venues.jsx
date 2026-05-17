import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react' // Added CheckCircle & XCircle
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
  const [actionLoading, setActionLoading] = useState(false) // Added action loading state

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

  // NEW: Handler to approve or reject proposed venue profiles instantly
  async function handleStatusChange(id, status) {
    if (!window.confirm(`Are you sure you want to mark this venue as ${status}?`)) return
    setActionLoading(true)
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      await api.patch(`/venues/${id}/${endpoint}`)
      addToast(`Venue status marked as ${status}`, 'success')
      fetchVenues()
    } catch (err) {
      addToast(err.response?.data?.error || `Failed to update venue status`, 'error')
    } finally {
      setActionLoading(false)
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

  // Dynamic counter variables calculating verification statuses cleanly
  const pendingCount  = venues.filter((v) => v.status === 'pending' || !v.status).length
  const approvedCount = venues.filter((v) => v.status === 'approved').length
  const rejectedCount = venues.filter((v) => v.status === 'rejected').length

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(245,158,11,0.38) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Venues Verification</h2>
          <p>Review and verify event venues proposed by organizers to maintain geospatial legitimacy.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat yellow">
            <span className="admin-hero-stat-val">{pendingCount}</span>
            <span className="admin-hero-stat-label">Pending</span>
          </div>
          <div className="admin-hero-stat green">
            <span className="admin-hero-stat-val">{approvedCount}</span>
            <span className="admin-hero-stat-label">Approved</span>
          </div>
          <div className="admin-hero-stat red">
            <span className="admin-hero-stat-val">{rejectedCount}</span>
            <span className="admin-hero-stat-label">Rejected</span>
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
            <div key={venue.id} className="venue-card" style={{ opacity: actionLoading ? 0.7 : 1 }}>
              <div className="venue-card-top" style={{ display: 'flex', justifyContent: 'between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ display: 'inline-block', marginRight: '10px' }}>{venue.name}</h3>
                  
                  {/* NEW STATUS BADGES: Rendered to show active layout validation parameters */}
                  <span className={`table-badge ${
                    venue.status === 'approved' ? 'success' : venue.status === 'rejected' ? 'danger' : 'warning'
                  }`} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '2px 8px' }}>
                    {venue.status || 'pending'}
                  </span>
                  
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
              
              <div className="row-actions" style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* NEW VERIFICATION CONTROLLER ACTIONS BUTTONS */}
                {venue.status !== 'approved' && (
                  <button className="table-action-btn success" onClick={() => handleStatusChange(venue.id, 'approved')} disabled={actionLoading}>
                    <CheckCircle size={13} /> Approve
                  </button>
                )}
                {venue.status !== 'rejected' && venue.status !== 'approved' && (
                  <button className="table-action-btn danger" onClick={() => handleStatusChange(venue.id, 'rejected')} disabled={actionLoading}>
                    <XCircle size={13} /> Reject
                  </button>
                )}
                
                <span style={{ borderLeft: '1px solid #334155', margin: '0 4px', height: '16px' }} />
                
                <button className="table-action-btn" onClick={() => handleEdit(venue)} disabled={loading || actionLoading}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="table-action-btn danger" onClick={() => handleDelete(venue.id)} disabled={loading || actionLoading}>
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
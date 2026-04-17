import { useEffect, useState } from 'react'
import '../../styles/Events.css'
import api from '../../services/api'

function Venues() {
  const [venues, setVenues] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

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

  async function handleCreate() {
    if (!name || !address || !city || !capacity) {
      setError('Please fill in required fields')
      return
    }

    try {
      await api.post('/venues', {
        name,
        address,
        city,
        province,
        country,
        postal_code: postalCode,
        capacity,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        contact_email: contactEmail
      })

      setError('')
      resetForm()
      fetchVenues()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create venue')
    }
  }

  function resetForm() {
    setShowForm(false)
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
  }

  return (
    <main className="venues-page">
      <div className="venues-top">
        <div className="venues-title">
          <div>
            <h2>Venues</h2>
            <p>Manage event venues and locations</p>
          </div>
        </div>

        <button className="add-venue-btn" onClick={() => setShowForm(true)}>
          Add Venue
        </button>
      </div>

      {showForm && (
        <div className="create-form">
          <h3>Add New Venue</h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Venue Name</label>
              <input
                className="form-input"
                placeholder="Enter venue name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                className="form-input"
                placeholder="Enter full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                className="form-input"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Province</label>
              <input
                className="form-input"
                placeholder="Enter province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                className="form-input"
                placeholder="Enter country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Postal Code</label>
              <input
                className="form-input"
                placeholder="Enter postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
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
              />
            </div>

            <div className="form-group">
              <label>Contact Person</label>
              <input
                className="form-input"
                placeholder="Enter contact person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                className="form-input"
                placeholder="Enter contact phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                className="form-input"
                placeholder="Enter contact email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="form-error" style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate}>
              Create Venue
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="venues-list">
        {venues.length === 0 ? (
          <div className="venue-card">
            <p className="venue-address">No venues found.</p>
          </div>
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
                  <span className="info-label">Province</span>
                  <span className="info-value">{venue.province || 'N/A'}</span>
                </div>

                <div className="info-block">
                  <span className="info-label">Capacity</span>
                  <span className="info-value">{venue.capacity}</span>
                </div>

                <div className="info-block">
                  <span className="info-label">Contact</span>
                  <span className="info-value contact-blue">
                    {venue.contact_phone || 'N/A'}
                  </span>
                </div>

                <div className="info-block">
                  <span className="info-label">Email</span>
                  <span className="info-value">{venue.contact_email || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default Venues
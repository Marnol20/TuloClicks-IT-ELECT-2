import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Venues.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function Venues() {
  const { addToast } = useToast()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchVenues() }, [])

  async function fetchVenues() {
    try {
      setLoading(true)
      const res = await api.get('/venues')
      setVenues(res.data || [])
    } catch {
      setVenues([])
    } finally {
      setLoading(false)
    }
  }

  // PATCH status handler linking verification states seamlessly directly on target elements
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

  // Real-time metric computations mapping out live database registers
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
        </div>
      </div>

      <div className="venues-list" style={{ marginTop: '24px' }}>
        {loading ? (
          <div className="table-empty">Loading venues…</div>
        ) : venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.4)' }}>No venues found.</div>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="venue-card" style={{ opacity: actionLoading ? 0.7 : 1, marginBottom: '16px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <div className="venue-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ display: 'inline-block', marginRight: '10px', color: '#f8fafc', margin: '0 0 8px 0' }}>{venue.name}</h3>
                  
                  <span className={`table-badge ${
                    venue.status === 'approved' ? 'success' : venue.status === 'rejected' ? 'danger' : 'warning'
                  }`} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {venue.status || 'pending'}
                  </span>
                  
                  <p className="venue-address" style={{ color: '#94a3b8', margin: '4px 0 0 0' }}>{venue.address}</p>
                </div>
              </div>
              <div className="venue-card-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                <div className="info-block">
                  <span className="info-label" style={{ color: '#64748b', fontSize: '12px' }}>City</span>
                  <span className="info-value" style={{ color: '#e2e8f0', display: 'block', fontWeight: 'bold' }}>{venue.city}</span>
                </div>
                <div className="info-block">
                  <span className="info-label" style={{ color: '#64748b', fontSize: '12px' }}>Capacity</span>
                  <span className="info-value" style={{ color: '#e2e8f0', display: 'block', fontWeight: 'bold' }}>{venue.capacity}</span>
                </div>
                <div className="info-block">
                  <span className="info-label" style={{ color: '#64748b', fontSize: '12px' }}>Contact Phone</span>
                  <span className="info-value contact-blue" style={{ display: 'block', fontWeight: 'bold' }}>{venue.contact_phone || 'N/A'}</span>
                </div>
              </div>
              
              <div className="row-actions" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                {(venue.status === 'pending' || !venue.status) && (
                  <>
                    <button className="table-action-btn success" onClick={() => handleStatusChange(venue.id, 'approved')} disabled={actionLoading} style={{ cursor: 'pointer' }}>
                      <CheckCircle size={13} /> Approve Venue
                    </button>
                    <button className="table-action-btn danger" onClick={() => handleStatusChange(venue.id, 'rejected')} disabled={actionLoading} style={{ cursor: 'pointer' }}>
                      <XCircle size={13} /> Reject Proposal
                    </button>
                  </>
                )}
                {venue.status === 'approved' && (
                  <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Legitimate Verified Location
                  </span>
                )}
                {venue.status === 'rejected' && (
                  <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={14} /> Rejected / Disallowed Location
                  </span>
                )}
                
                <div style={{ flex: 1 }} />
                
                <button className="table-action-btn danger" onClick={() => handleDelete(venue.id)} disabled={actionLoading} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                  <Trash2 size={13} /> Delete Record
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
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function OrganizerApprovals() {
  const { addToast } = useToast()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchOrganizers() }, [])

  async function fetchOrganizers() {
    try {
      setLoading(true)
      const res = await api.get('/organizers')
      setOrganizers(res.data || [])
    } catch {
      setOrganizers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    let reason = ''
    if (status === 'rejected') {
      reason = window.prompt('Enter rejection reason:', 'Application does not meet requirements.')
      if (reason === null) return
    }
    if (!window.confirm(`Are you sure you want to ${status} this organizer?`)) return

    setActionLoading(true)
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      await api.patch(`/organizers/${id}/${endpoint}`, { rejection_reason: reason })
      addToast(`Organizer ${status} successfully`, 'success')
      fetchOrganizers()
    } catch (err) {
      addToast(err.response?.data?.error || `Failed to ${status} organizer`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const pending  = organizers.filter((o) => o.approval_status === 'pending').length
  const approved = organizers.filter((o) => o.approval_status === 'approved').length
  const rejected = organizers.filter((o) => o.approval_status === 'rejected').length

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(59,130,246,0.4) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Organizer Approvals</h2>
          <p>Review and verify organizer applications submitted through the platform.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat yellow">
            <span className="admin-hero-stat-val">{pending}</span>
            <span className="admin-hero-stat-label">Pending</span>
          </div>
          <div className="admin-hero-stat green">
            <span className="admin-hero-stat-val">{approved}</span>
            <span className="admin-hero-stat-label">Approved</span>
          </div>
          <div className="admin-hero-stat red">
            <span className="admin-hero-stat-val">{rejected}</span>
            <span className="admin-hero-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.85fr 1.2fr' }}>
          <span>Organization</span>
          <span>Applicant</span>
          <span>Type</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading applications…</div>
        ) : organizers.length === 0 ? (
          <div className="table-empty">No organizer applications found.</div>
        ) : (
          organizers.map((item) => (
            <div
              key={item.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.85fr 1.2fr', opacity: actionLoading ? 0.6 : 1 }}
            >
              <span className="row-name">{item.organization_name}</span>
              <span className="row-muted">{item.user_name}</span>
              <span className="row-muted">{item.organization_type || 'N/A'}</span>
              <span className="row-muted">{item.email}</span>

              <span className={`table-badge ${
                item.approval_status === 'approved' ? 'success'
                : item.approval_status === 'rejected' ? 'danger'
                : 'warning'
              }`}>
                {item.approval_status}
              </span>

              <div className="row-actions">
                {item.approval_status === 'pending' && (
                  <>
                    <button
                      className="table-action-btn success"
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      className="table-action-btn danger"
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      disabled={actionLoading}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {item.approval_status === 'approved' && (
                  <span className="admin-verified-badge">
                    <CheckCircle size={12} /> Verified
                  </span>
                )}
                {item.approval_status === 'rejected' && (
                  <span className="admin-rejected-badge">
                    <XCircle size={12} /> Rejected
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default OrganizerApprovals

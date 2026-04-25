import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerApprovals() {
  const { addToast } = useToast()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOrganizers()
  }, [])

  async function fetchOrganizers() {
    try {
      setLoading(true)
      const res = await api.get('/organizers')
      setOrganizers(res.data || [])
    } catch (error) {
      console.error('Fetch organizers error:', error)
      setOrganizers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    let reason = '';
    if (status === 'rejected') {
      reason = window.prompt('Enter rejection reason:', 'Application does not meet requirements.');
      if (reason === null) return; // Cancelled prompt
    }

    const confirmAction = window.confirm(`Are you sure you want to ${status} this organizer?`)
    if (!confirmAction) return

    setActionLoading(true)
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      await api.patch(`/organizers/${id}/${endpoint}`, {
        rejection_reason: reason
      })
      
      addToast(`Organizer ${status} successfully`, 'success')
      fetchOrganizers()
    } catch (error) {
      addToast(error.response?.data?.error || `Failed to ${status} organizer`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Organizer Approvals</h2>
            <p>Admin Control: Review and verify organizer applications</p>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div
          className="table-header"
          style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1.2fr' }}
        >
          <span>Organization</span>
          <span>Applicant</span>
          <span>Type</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading applications...</div>
        ) : organizers.length === 0 ? (
          <div className="table-empty">No organizer applications found.</div>
        ) : (
          organizers.map((item) => (
            <div
              key={item.id}
              className="table-row"
              style={{ 
                gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1.2fr',
                opacity: actionLoading ? 0.6 : 1 
              }}
            >
              <span className="row-name">{item.organization_name}</span>
              <span className="row-muted">{item.user_name}</span>
              <span className="row-muted">{item.organization_type || 'N/A'}</span>
              <span className="row-muted">{item.email}</span>

              <span
                className={`table-badge ${
                  item.approval_status === 'approved'
                    ? 'success'
                    : item.approval_status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {item.approval_status}
              </span>

              <div className="row-actions">
                {/* 1. Logic para sa PENDING: Ipakita ang Buttons */}
                {item.approval_status === 'pending' && (
                  <>
                    <button
                      className="table-action-btn success"
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      disabled={actionLoading}
                    >
                      Approve
                    </button>
                    <button
                      className="table-action-btn danger"
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      disabled={actionLoading}
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* 2. Logic para sa APPROVED: Ipakita ang Verified Label */}
                {item.approval_status === 'approved' && (
                  <span style={{ 
                    color: '#10b981', 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ✓ Verified
                  </span>
                )}

                {/* 3. Logic para sa REJECTED: Ipakita ang Rejected Label */}
                {item.approval_status === 'rejected' && (
                  <span style={{ 
                    color: '#ef4444', 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: 0.8
                  }}>
                    ✕ Rejected
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
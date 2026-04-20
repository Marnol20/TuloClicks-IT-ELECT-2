import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function OrganizerApprovals() {
  const { addToast } = useToast()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)

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

  async function handleApprove(id) {
    try {
      await api.patch(`/organizers/${id}/approve`)
      addToast('Organizer approved successfully', 'success')
      fetchOrganizers()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to approve organizer', 'error')
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Enter rejection reason:', 'Application rejected.')
    if (reason === null) return

    try {
      await api.patch(`/organizers/${id}/reject`, {
        rejection_reason: reason
      })
      addToast('Organizer rejected successfully', 'success')
      fetchOrganizers()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to reject organizer', 'error')
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Organizer Approvals</h2>
            <p>Review and manage organizer applications</p>
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
          <div className="table-empty">Loading organizer applications...</div>
        ) : organizers.length === 0 ? (
          <div className="table-empty">No organizer applications found.</div>
        ) : (
          organizers.map((item) => (
            <div
              key={item.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr 1.2fr' }}
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
                <button
                  className="table-action-btn success"
                  onClick={() => handleApprove(item.id)}
                >
                  Approve
                </button>
                <button
                  className="table-action-btn danger"
                  onClick={() => handleReject(item.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default OrganizerApprovals
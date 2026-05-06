import { useEffect, useState } from 'react'
import { Star, StarOff, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function EventApprovals() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const res = await api.get('/events/admin/all')
      setEvents(res.data || [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status, notes = '') {
    setActionLoading(true)
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      await api.patch(`/events/${id}/${endpoint}`, {
        approval_notes: notes || `Event ${status} by admin`,
      })
      addToast(`Event ${status} successfully`, 'success')
      fetchEvents()
    } catch (err) {
      addToast(err.response?.data?.error || `Failed to ${status} event`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleFeature(id, currentStatus) {
    try {
      await api.patch(`/events/${id}/feature`, { featured: !currentStatus })
      addToast(currentStatus ? 'Feature removed' : 'Event featured!', 'success')
      fetchEvents()
    } catch {
      addToast('Failed to update featured status', 'error')
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const pending  = events.filter((e) => e.approval_status === 'pending').length
  const approved = events.filter((e) => e.approval_status === 'approved').length
  const rejected = events.filter((e) => e.approval_status === 'rejected').length

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(34,197,94,0.38) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Event Approvals</h2>
          <p>Review and verify event submissions from organizers.</p>
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
        <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 0.9fr 0.9fr 0.85fr 1.6fr' }}>
          <span>Event</span>
          <span>Organizer</span>
          <span>Date</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="table-empty">No events found.</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.5fr 1fr 0.9fr 0.9fr 0.85fr 1.6fr', opacity: actionLoading ? 0.6 : 1 }}
            >
              <span className="row-name">{event.title}</span>
              <span className="row-muted">{event.organizer_name || 'N/A'}</span>
              <span className="row-muted">{formatDate(event.start_date)}</span>
              <span className="row-muted">{event.category_name || 'N/A'}</span>

              <span className={`table-badge ${
                event.approval_status === 'approved' ? 'success'
                : event.approval_status === 'rejected' ? 'danger'
                : 'warning'
              }`}>
                {event.approval_status}
              </span>

              <div className="row-actions">
                {event.approval_status === 'pending' && (
                  <>
                    <button
                      className="table-action-btn success"
                      onClick={() => handleStatusChange(event.id, 'approved')}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      className="table-action-btn danger"
                      onClick={() => {
                        const n = window.prompt('Reason for rejection?')
                        if (n) handleStatusChange(event.id, 'rejected', n)
                      }}
                      disabled={actionLoading}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}

                {event.featured ? (
                  <button className="admin-unfeature-btn" onClick={() => handleFeature(event.id, event.featured)}>
                    <StarOff size={12} /> Unfeature
                  </button>
                ) : (
                  <button className="admin-feature-btn" onClick={() => handleFeature(event.id, event.featured)}>
                    <Star size={12} /> Feature
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default EventApprovals

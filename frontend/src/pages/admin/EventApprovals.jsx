import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function EventApprovals() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const res = await api.get('/events/admin/all')
      setEvents(res.data || [])
    } catch (error) {
      console.error('Fetch admin events error:', error)
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
        approval_notes: notes || `Event ${status} by admin`
      })
      addToast(`Event ${status} successfully`, 'success')
      fetchEvents()
    } catch (error) {
      addToast(error.response?.data?.error || `Failed to ${status} event`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleFeature(id, currentStatus) {
    try {
      await api.patch(`/events/${id}/feature`, { featured: !currentStatus })
      addToast(currentStatus ? 'Feature removed' : 'Event featured!', 'success')
      fetchEvents()
    } catch (error) {
      addToast('Failed to update featured status', 'error')
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Event Approvals</h2>
            <p>Admin Control: Review and verify event submissions</p>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}>
          <span>Event</span>
          <span>Organizer</span>
          <span>Date</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading events...</div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="table-row" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr', opacity: actionLoading ? 0.6 : 1 }}>
              <span className="row-name">{event.title}</span>
              <span className="row-muted">{event.organizer_name || 'N/A'}</span>
              <span className="row-muted">{formatDate(event.start_date)}</span>
              <span className="row-muted">{event.category_name || 'N/A'}</span>

              <span className={`table-badge ${event.approval_status === 'approved' ? 'success' : event.approval_status === 'rejected' ? 'danger' : 'warning'}`}>
                {event.approval_status}
              </span>

              <div className="row-actions">
                {event.approval_status === 'pending' && (
                  <>
                    <button className="table-action-btn success" onClick={() => handleStatusChange(event.id, 'approved')} disabled={actionLoading}>
                      Approve
                    </button>
                    <button className="table-action-btn danger" onClick={() => {
                      const n = window.prompt('Reason for rejection?');
                      if(n) handleStatusChange(event.id, 'rejected', n);
                    }} disabled={actionLoading}>
                      Reject
                    </button>
                  </>
                )}
                
                <button 
                  className="table-action-btn primary" 
                  onClick={() => handleFeature(event.id, event.featured)}
                  style={{ backgroundColor: event.featured ? '#f59e0b' : '' }}
                >
                  {event.featured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default EventApprovals
import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function EventApprovals() {
  const { addToast } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

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

  async function handleApprove(id) {
    try {
      await api.patch(`/events/${id}/approve`, {
        approval_notes: 'Approved by admin'
      })
      addToast('Event approved successfully', 'success')
      fetchEvents()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to approve event', 'error')
    }
  }

  async function handleReject(id) {
    const notes = window.prompt('Enter rejection note:', 'Event rejected.')
    if (notes === null) return

    try {
      await api.patch(`/events/${id}/reject`, {
        approval_notes: notes
      })
      addToast('Event rejected successfully', 'success')
      fetchEvents()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to reject event', 'error')
    }
  }

  async function handleFeature(id) {
    try {
      await api.patch(`/events/${id}/feature`, {
        featured: true
      })
      addToast('Event featured successfully', 'success')
      fetchEvents()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to feature event', 'error')
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
            <p>Review and manage submitted events</p>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div
          className="table-header"
          style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}
        >
          <span>Event</span>
          <span>Organizer</span>
          <span>Date</span>
          <span>Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="table-empty">No events found.</div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1.5fr' }}
            >
              <span className="row-name">{event.title}</span>
              <span className="row-muted">{event.organizer_name || 'N/A'}</span>
              <span className="row-muted">{formatDate(event.start_date)}</span>
              <span className="row-muted">{event.category_name || 'N/A'}</span>

              <span
                className={`table-badge ${
                  event.approval_status === 'approved'
                    ? 'success'
                    : event.approval_status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {event.approval_status}
              </span>

              <div className="row-actions">
                <button
                  className="table-action-btn success"
                  onClick={() => handleApprove(event.id)}
                >
                  Approve
                </button>

                <button
                  className="table-action-btn danger"
                  onClick={() => handleReject(event.id)}
                >
                  Reject
                </button>

                <button
                  className="table-action-btn primary"
                  onClick={() => handleFeature(event.id)}
                >
                  Feature
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
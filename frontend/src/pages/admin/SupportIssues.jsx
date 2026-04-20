import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function SupportIssues() {
  const { addToast } = useToast()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssues()
  }, [])

  async function fetchIssues() {
    try {
      setLoading(true)
      const res = await api.get('/support/admin/all')
      setIssues(res.data || [])
    } catch (error) {
      console.error('Fetch support issues error:', error)
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(id) {
    try {
      await api.patch(`/support/${id}`, {
        status: 'resolved',
        resolution_notes: 'Resolved by admin'
      })
      addToast('Issue resolved successfully', 'success')
      fetchIssues()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to resolve issue', 'error')
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Support Issues</h2>
            <p>Handle complaints, refund requests, and technical concerns</p>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div
          className="table-header"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}
        >
          <span>User</span>
          <span>Email</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading support issues...</div>
        ) : issues.length === 0 ? (
          <div className="table-empty">No support issues found.</div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="table-row"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}
            >
              <span className="row-name">{issue.user_name}</span>
              <span className="row-muted">{issue.user_email}</span>
              <span className="row-muted">{issue.subject}</span>
              <span className="row-muted">{issue.issue_type}</span>

              <span
                className={`table-badge ${
                  issue.status === 'resolved'
                    ? 'success'
                    : issue.status === 'closed'
                    ? 'info'
                    : issue.status === 'open'
                    ? 'warning'
                    : 'warning'
                }`}
              >
                {issue.status}
              </span>

              <div className="row-actions">
                <button
                  className="table-action-btn primary"
                  onClick={() => handleResolve(issue.id)}
                >
                  Resolve
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default SupportIssues
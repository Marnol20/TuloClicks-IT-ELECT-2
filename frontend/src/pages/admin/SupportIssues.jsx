import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, CheckCheck } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminSupport.css'
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
    } catch {
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(id) {
    try {
      await api.patch(`/support/${id}`, {
        status: 'resolved',
        resolution_notes: 'Resolved by admin',
      })
      addToast('Issue resolved', 'success')
      fetchIssues()
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to resolve issue', 'error')
    }
  }

  async function handleClose(id) {
    try {
      await api.patch(`/support/${id}`, {
        status: 'closed',
        resolution_notes: 'Closed by admin',
      })
      addToast('Issue closed', 'success')
      fetchIssues()
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to close issue', 'error')
    }
  }

  const openCount     = issues.filter((i) => i.status === 'open').length
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length
  const closedCount   = issues.filter((i) => i.status === 'closed').length

  function statusBadgeClass(status) {
    if (status === 'resolved') return 'success'
    if (status === 'closed')   return 'info'
    return 'warning'
  }

  return (
    <main className="admin-support-page">

      {/* ── Hero ── */}
      <div className="support-admin-hero">
        <div>
          <h2>Support Issues</h2>
          <p>Handle complaints, refund requests, and technical concerns from users.</p>
        </div>
        <div className="support-admin-stats">
          <div className="support-admin-stat open">
            <span className="support-admin-stat-val">{openCount}</span>
            <span className="support-admin-stat-label">Open</span>
          </div>
          <div className="support-admin-stat resolved">
            <span className="support-admin-stat-val">{resolvedCount}</span>
            <span className="support-admin-stat-label">Resolved</span>
          </div>
          <div className="support-admin-stat closed">
            <span className="support-admin-stat-val">{closedCount}</span>
            <span className="support-admin-stat-label">Closed</span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1fr 1.2fr 1.4fr 0.9fr 0.8fr 1fr' }}>
          <span>User</span>
          <span>Email</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading support issues…</div>
        ) : issues.length === 0 ? (
          <div className="table-empty">No support issues found.</div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="table-row"
              style={{ gridTemplateColumns: '1fr 1.2fr 1.4fr 0.9fr 0.8fr 1fr' }}
            >
              <span className="row-name">{issue.user_name}</span>
              <span className="row-muted">{issue.user_email}</span>
              <span className="row-muted">{issue.subject}</span>
              <span className="row-muted" style={{ textTransform: 'capitalize' }}>{issue.issue_type}</span>

              <span className={`table-badge ${statusBadgeClass(issue.status)}`}>
                {issue.status}
              </span>

              <div className="row-actions">
                {issue.status === 'open' && (
                  <button
                    className="support-resolve-btn"
                    onClick={() => handleResolve(issue.id)}
                  >
                    <CheckCircle size={13} /> Resolve
                  </button>
                )}
                {issue.status === 'resolved' && (
                  <button
                    className="support-close-btn"
                    onClick={() => handleClose(issue.id)}
                  >
                    <XCircle size={13} /> Close
                  </button>
                )}
                {issue.status === 'closed' && (
                  <span className="support-done-badge">
                    <CheckCheck size={12} /> Done
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

export default SupportIssues

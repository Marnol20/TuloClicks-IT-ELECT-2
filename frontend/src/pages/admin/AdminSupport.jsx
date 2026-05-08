import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, CheckCheck, Clock, KeyRound, Mail } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminSupport.css'
import api from '../../services/api'

function AdminSupport() {
  const { addToast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  async function fetchTickets() {
    try {
      setLoading(true)
      const res = await api.get('/support/admin/all')
      setTickets(res.data || [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  async function copyEmailToClipboard(email) {
    try {
      await navigator.clipboard.writeText(email);
      addToast(`Email copied: ${email}`, 'success');
    } catch (err) {
      addToast('Failed to copy email', 'error');
    }
  }

  async function handleQuickReset(email) {
    if (!window.confirm(`Are you sure you want to reset the password for ${email}?`)) return;
    
    try {
      const res = await api.post('/auth/admin-reset-password', { email });
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(res.data.tempPassword);
        addToast(`Password reset to: ${res.data.tempPassword} (Copied to clipboard!)`, 'success');
      } else {
        addToast(`Password reset to: ${res.data.tempPassword}`, 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to reset password', 'error');
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/support/${id}/status`, { status: newStatus })
      addToast('Ticket status updated', 'success')
      fetchTickets()
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update status', 'error')
    }
  }

  const openCount       = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount   = tickets.filter((t) => t.status === 'resolved').length
  const closedCount     = tickets.filter((t) => t.status === 'closed').length
  // BAG-ONG STAT: Ihapon ang mga password reset requests
  const resetRequests   = tickets.filter(t => t.subject.toLowerCase().includes('password')).length

  function statusBadgeClass(status) {
    if (status === 'resolved')    return 'success'
    if (status === 'closed')      return 'info'
    if (status === 'in_progress') return 'info'
    return 'warning'
  }

  function statusLabel(status) {
    if (status === 'in_progress') return 'In Progress'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <main className="admin-support-page">

      <div className="support-admin-hero">
        <div>
          <h2>Support Tickets</h2>
          <p>Manage refund requests and Password Resets in one place.</p>
        </div>
        <div className="support-admin-stats">
          <div className="support-admin-stat open">
            <span className="support-admin-stat-val">{openCount}</span>
            <span className="support-admin-stat-label">Open</span>
          </div>
          {/* Highlighted Stat para sa Resets */}
          <div className="support-admin-stat" style={{ '--val-color': '#8b5cf6' }}>
            <span className="support-admin-stat-val" style={{ color: '#8b5cf6' }}>{resetRequests}</span>
            <span className="support-admin-stat-label">Reset Requests</span>
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

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1fr 1.3fr 1.5fr 0.85fr 0.85fr 0.8fr 1.3fr' }}>
          <span>User</span>
          <span>Email</span>
          <span>Subject</span>
          <span>Type</span>
          <span>Status</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="table-empty">No support tickets found.</div>
        ) : (
          tickets.map((ticket) => {
            // Check kon password reset ba kini nga ticket
            const isPasswordRequest = ticket.subject.toLowerCase().includes('password');
            
            return (
              <div
                key={ticket.id}
                className="table-row"
                style={{ 
                  gridTemplateColumns: '1fr 1.3fr 1.5fr 0.85fr 0.85fr 0.8fr 1.3fr',
                  // Highlighted style para sa password requests
                  borderLeft: isPasswordRequest ? '4px solid #8b5cf6' : '1px solid transparent',
                  background: isPasswordRequest ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
                }}
              >
                <span className="row-name">{ticket.user_name}</span>
                <span className="row-muted">{ticket.user_email}</span>
                <span style={{ color: isPasswordRequest ? '#a78bfa' : 'inherit', fontWeight: isPasswordRequest ? '600' : '400' }}>
                  {ticket.subject}
                </span>
                <span className="row-muted" style={{ textTransform: 'capitalize' }}>
                  {ticket.issue_type?.replace(/_/g, ' ')}
                </span>

                <span className={`table-badge ${statusBadgeClass(ticket.status)}`}>
                  {statusLabel(ticket.status)}
                </span>

                <span className="row-muted">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>

                <div className="row-actions" style={{ gap: '6px' }}>
                  {isPasswordRequest && (
                    <>
                      <button
                        className="support-progress-btn"
                        style={{ backgroundColor: '#10b981', color: 'white' }}
                        onClick={() => copyEmailToClipboard(ticket.user_email)}
                        title="Copy User Email"
                      >
                        <Mail size={12} />
                      </button>

                      <button
                        className="support-progress-btn"
                        style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                        onClick={() => handleQuickReset(ticket.user_email)}
                        title="Quick Password Reset"
                      >
                        <KeyRound size={12} /> Reset
                      </button>
                    </>
                  )}

                  {ticket.status === 'open' && !isPasswordRequest && (
                    <button
                      className="support-progress-btn"
                      onClick={() => updateStatus(ticket.id, 'in_progress')}
                    >
                      <Clock size={12} />
                    </button>
                  )}
                  {ticket.status !== 'resolved' && (
                    <button
                      className="support-resolve-btn"
                      onClick={() => updateStatus(ticket.id, 'resolved')}
                    >
                      <CheckCircle size={12} />
                    </button>
                  )}
                  {ticket.status === 'resolved' && (
                    <button
                      className="support-close-btn"
                      onClick={() => updateStatus(ticket.id, 'closed')}
                    >
                      <XCircle size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}

export default AdminSupport
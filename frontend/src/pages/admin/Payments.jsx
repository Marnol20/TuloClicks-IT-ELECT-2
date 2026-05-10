import { useEffect, useState } from 'react'
import { Eye, X, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function Payments() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => { fetchPayments() }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      const res = await api.get('/payments/admin/all')
      setPayments(res.data || [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id, status) {
    let reason = ''
    if (status === 'refund') {
      reason = window.prompt('Enter refund reason:', 'Refund processed by admin')
      if (reason === null) return
    }
    if (!window.confirm(`Mark this payment as ${status}?`)) return

    setActionLoading(true)
    try {
      // Gigamitan og PATCH para sa status updates, siguroha nga gi-allow kini sa imong CORS
      await api.patch(`/payments/${id}/${status}`, { refund_reason: reason })
      addToast(`Payment marked as ${status}`, 'success')
      fetchPayments()
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const pending  = payments.filter((p) => p.payment_status === 'pending').length
  const success  = payments.filter((p) => p.payment_status === 'success').length
  const refunded = payments.filter((p) => p.payment_status === 'refunded').length

  function statusBadge(status) {
    if (status === 'success')  return 'success'
    if (status === 'refunded') return 'info'
    if (status === 'failed')   return 'danger'
    return 'warning'
  }

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(16,185,129,0.38) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Payment Transactions</h2>
          <p>Verify GCash screenshots and manage transaction status for all bookings.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat yellow">
            <span className="admin-hero-stat-val">{pending}</span>
            <span className="admin-hero-stat-label">Pending</span>
          </div>
          <div className="admin-hero-stat green">
            <span className="admin-hero-stat-val">{success}</span>
            <span className="admin-hero-stat-label">Verified</span>
          </div>
          <div className="admin-hero-stat blue">
            <span className="admin-hero-stat-val">{refunded}</span>
            <span className="admin-hero-stat-label">Refunded</span>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 0.8fr 1.8fr' }}>
          <span>Reference</span>
          <span>Attendee</span>
          <span>Event</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading payments…</div>
        ) : payments.length === 0 ? (
          <div className="table-empty">No payments found.</div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 0.8fr 1.8fr', opacity: actionLoading ? 0.6 : 1 }}
            >
              <span className="row-name">{payment.payment_reference || payment.booking_reference}</span>
              <span className="row-muted">{payment.attendee_name}</span>
              <span className="row-muted">{payment.event_title}</span>
              <span className="row-muted">₱{Number(payment.amount).toLocaleString()}</span>

              <span className={`table-badge ${statusBadge(payment.payment_status)}`}>
                {payment.payment_status}
              </span>

              <div className="row-actions">
                {payment.attachment && (
                  <button className="admin-proof-btn" onClick={() => setSelectedImage(payment.attachment)}>
                    <Eye size={13} /> Proof
                  </button>
                )}

                {payment.payment_status === 'pending' && (
                  <>
                    <button className="table-action-btn success" onClick={() => handleUpdateStatus(payment.id, 'success')} disabled={actionLoading}>
                      <CheckCircle size={13} /> Verify
                    </button>
                    <button className="table-action-btn danger" onClick={() => handleUpdateStatus(payment.id, 'fail')} disabled={actionLoading}>
                      <XCircle size={13} /> Fail
                    </button>
                  </>
                )}

                {payment.payment_status === 'success' && (
                  <button className="table-action-btn danger" onClick={() => handleUpdateStatus(payment.id, 'refund')} disabled={actionLoading}>
                    Refund
                  </button>
                )}

                {(payment.payment_status === 'refunded' || payment.payment_status === 'failed') && (
                  <span className="admin-no-action">No actions available</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <div className="admin-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedImage(null)}>
              <X size={16} />
            </button>
            <p className="admin-modal-title">GCash Proof of Payment</p>
            <img
              className="admin-modal-img"
              src={`${import.meta.env.VITE_API_URL}/uploads/payments/${selectedImage}`}
              alt="GCash Proof"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'
                addToast('Could not load image.', 'error')
              }}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default Payments
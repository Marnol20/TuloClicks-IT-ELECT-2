import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import { Eye, X } from 'lucide-react' // Gidugangan og icons
import '../../styles/Attendees.css'
import api from '../../services/api'

function Payments() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  
  // State para sa pag-preview sa image
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    try {
      setLoading(true)
      const res = await api.get('/payments/admin/all')
      setPayments(res.data || [])
    } catch (error) {
      console.error('Fetch payments error:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(id, status) {
    let reason = '';
    if (status === 'refund') {
      reason = window.prompt('Enter refund reason:', 'Refund processed by admin');
      if (reason === null) return;
    }

    const confirm = window.confirm(`Mark this payment as ${status}?`)
    if (!confirm) return

    setActionLoading(true)
    try {
      await api.patch(`/payments/${id}/${status}`, {
        refund_reason: reason
      })
      addToast(`Payment marked as ${status}`, 'success')
      fetchPayments()
    } catch (error) {
      addToast(error.response?.data?.error || 'Update failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Payment Transactions</h2>
            <p>Admin Control: Verify GCash screenshots and manage transaction status</p>
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
          <div className="table-empty">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="table-empty">No payments found.</div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="table-row" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr 0.8fr 1.8fr', opacity: actionLoading ? 0.7 : 1 }}>
              <span className="row-name">{payment.payment_reference || payment.booking_reference}</span>
              <span className="row-muted">{payment.attendee_name}</span>
              <span className="row-muted">{payment.event_title}</span>
              <span className="row-muted">₱{Number(payment.amount).toLocaleString()}</span>

              <span className={`table-badge ${
                  payment.payment_status === 'success' ? 'success' : 
                  payment.payment_status === 'refunded' ? 'info' : 
                  payment.payment_status === 'failed' ? 'danger' : 'warning'
                }`}>
                {payment.payment_status}
              </span>

              <div className="row-actions" style={{ display: 'flex', gap: '8px' }}>
                {/* PROOF BUTTON: Mugawas lang kon naay attachment sa database */}
                {payment.attachment && (
                  <button 
                    className="table-action-btn info" 
                    onClick={() => setSelectedImage(payment.attachment)}
                    style={{ backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={14} /> Proof
                  </button>
                )}

                {payment.payment_status === 'pending' && (
                  <>
                    <button className="table-action-btn success" onClick={() => handleUpdateStatus(payment.id, 'success')} disabled={actionLoading}>
                      Verify
                    </button>
                    <button className="table-action-btn danger" onClick={() => handleUpdateStatus(payment.id, 'fail')} disabled={actionLoading}>
                      Fail
                    </button>
                  </>
                )}

                {payment.payment_status === 'success' && (
                  <button className="table-action-btn danger" onClick={() => handleUpdateStatus(payment.id, 'refund')} disabled={actionLoading}>
                    Refund
                  </button>
                )}

                {(payment.payment_status === 'refunded' || payment.payment_status === 'failed') && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>No actions available</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP MODAL PARA SA SCREENSHOT PREVIEW */}
      {selectedImage && (
        <div 
          className="image-modal-overlay" 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', 
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="image-modal-content" 
            style={{ position: 'relative', background: '#1e293b', padding: '20px', borderRadius: '12px', maxWidth: '90%', maxHeight: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', padding: '5px' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '15px', textAlign: 'center', color: '#fff' }}>GCash Proof of Payment</h3>
            <img 
              src={`http://localhost:5000/uploads/payments/${selectedImage}`} 
              alt="GCash Proof" 
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px', display: 'block' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                addToast('Could not load image. Check backend folder.', 'error');
              }}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default Payments
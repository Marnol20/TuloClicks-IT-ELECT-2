import { useEffect, useState } from 'react'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import api from '../../services/api'

function Payments() {
  const { addToast } = useToast()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

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

  async function handleMarkSuccess(id) {
    try {
      await api.patch(`/payments/${id}/success`)
      addToast('Payment marked as successful', 'success')
      fetchPayments()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to update payment', 'error')
    }
  }

  async function handleRefund(id) {
    try {
      await api.patch(`/payments/${id}/refund`, {
        refund_reason: 'Refund processed by admin'
      })
      addToast('Payment refunded successfully', 'success')
      fetchPayments()
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to refund payment', 'error')
    }
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>Payments</h2>
            <p>Monitor transactions and manage payment status</p>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div
          className="table-header"
          style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}
        >
          <span>Booking Ref</span>
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
            <div
              key={payment.id}
              className="table-row"
              style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr' }}
            >
              <span className="row-name">{payment.booking_reference}</span>
              <span className="row-muted">{payment.attendee_name}</span>
              <span className="row-muted">{payment.event_title}</span>
              <span className="row-muted">
                ₱{Number(payment.amount).toLocaleString()}
              </span>

              <span
                className={`table-badge ${
                  payment.payment_status === 'success'
                    ? 'success'
                    : payment.payment_status === 'refunded'
                    ? 'info'
                    : payment.payment_status === 'failed'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {payment.payment_status}
              </span>

              <div className="row-actions">
                <button
                  className="table-action-btn success"
                  onClick={() => handleMarkSuccess(payment.id)}
                >
                  Success
                </button>
                <button
                  className="table-action-btn danger"
                  onClick={() => handleRefund(payment.id)}
                >
                  Refund
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default Payments
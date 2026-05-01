import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/UserView.css'
import api from '../../services/api'
import { useToast } from '../../components/common/ToastContext'
import ConfirmModal from '../../components/common/ConfirmModal'


function MyTickets() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancelLoadingId, setCancelLoadingId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  useEffect(() => {
    fetchMyTickets()
  }, [])

  async function fetchMyTickets() {
    try {
      setLoading(true)
      const res = await api.get('/bookings/my-bookings')
      setTickets(res.data || [])
    } catch (error) {
      console.error('Fetch my tickets error:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  function openCancelModal(id) {
    setSelectedBookingId(id)
    setShowCancelModal(true)
  }

  function closeCancelModal() {
    setShowCancelModal(false)
    setSelectedBookingId(null)
  }

  async function handleCancelBooking(id) {
    try {
      setCancelLoadingId(id)
      await api.patch(`/bookings/${id}/cancel`, {
        cancellation_reason: 'Cancelled by user'
      })
      setError('')
      addToast('Booking cancelled successfully', 'success')
      fetchMyTickets()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to cancel booking')
      addToast(error.response?.data?.error || 'Failed to cancel booking', 'error')
    } finally {
      setCancelLoadingId(null)
      closeCancelModal()
    }
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.event_title?.toLowerCase().includes(search.toLowerCase()) ||
        ticket.booking_reference?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        ticket.payment_status === statusFilter ||
        ticket.booking_status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tickets, search, statusFilter])

  return (
    <section className="user-view-tickets">
      <div className="section-header">
        <p className="section-label">Tickets</p>
        <h2 className="section-title">My Tickets</h2>
      </div>

      <div className="user-events-toolbar tickets-toolbar">
        <div className="user-events-search">
          <input
            type="text"
            placeholder="Search by event or booking reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-events-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="checked_in">Checked In</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <h3>Loading tickets...</h3>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="tickets-list">
          {filteredTickets.map((ticket) => (
            <div className="ticket-card upgraded-ticket-card" key={ticket.id}>
              <div className="ticket-info">
                <h4>{ticket.event_title}</h4>
                <p><strong>Booking Ref:</strong> {ticket.booking_reference}</p>
                <p><strong>Date:</strong> {formatDate(ticket.start_date)}</p>
                <p><strong>Time:</strong> {ticket.start_time || 'Time not available'}</p>
                <p><strong>Total:</strong> ₱{Number(ticket.total_amount || 0).toLocaleString()}</p>

                <div className="ticket-status-row">
                  <span className={`ticket-type ${ticket.payment_status === 'paid' ? 'ticket-paid' : 'ticket-pending'}`}>
                    Payment: {ticket.payment_status}
                  </span>

                  <span className={`ticket-type ${ticket.booking_status === 'cancelled' ? 'ticket-cancelled' : 'ticket-confirmed'}`}>
                    Booking: {ticket.booking_status}
                  </span>
                </div>
              </div>

              <div className="ticket-actions">
                {ticket.booking_status !== 'cancelled' && ticket.booking_status !== 'checked_in' && (
                  <button
                    className="ticket-action-btn danger"
                    onClick={() => openCancelModal(ticket.id)}
                    disabled={cancelLoadingId === ticket.id}
                  >
                    {cancelLoadingId === ticket.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}

                <button
                  className="ticket-action-btn"
                  onClick={() => navigate(`/home/tickets/${ticket.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎫</div>
          <h3>No matching tickets</h3>
          <p>Try changing your search or status filter.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        onConfirm={() => selectedBookingId && handleCancelBooking(selectedBookingId)}
        onCancel={closeCancelModal}
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        isLoading={cancelLoadingId === selectedBookingId}
      />
    </section>
  )
}

export default MyTickets
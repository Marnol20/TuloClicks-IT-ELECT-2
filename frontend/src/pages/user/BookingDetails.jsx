import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarDays,
  Receipt,
  User,
  CreditCard
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import '../../styles/EventDetails.css'
import api from '../../services/api'

function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ticketRef = useRef(null)

  const [booking, setBooking] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetchBookingDetails()
  }, [id])

  async function fetchBookingDetails() {
    try {
      setLoading(true)

      const [bookingRes, paymentsRes] = await Promise.all([
        api.get(`/bookings/${id}`),
        api.get(`/payments/booking/${id}`).catch(() => ({ data: [] }))
      ])

      setBooking(bookingRes.data)
      setPayments(paymentsRes.data || [])
    } catch (error) {
      console.error('Fetch booking details error:', error)
      setBooking(null)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  async function handleDownloadTicket() {
    if (!ticketRef.current || !booking?.booking_reference) return

    try {
      setDownloading(true)

      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0b1220',
        scale: 2,
        useCORS: true
      })

      const link = document.createElement('a')
      link.download = `${booking.booking_reference}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Download ticket error:', error)
      alert('Failed to download ticket.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="event-details-page">
        <div className="empty-state">
          <h3>Loading booking details...</h3>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="event-details-page">
        <div className="empty-state">
          <h3>Booking not found</h3>
          <p>This booking may not exist or may not be accessible.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="event-details-page">
      <div className="event-hero">
        <div className="event-hero-content">
          <div className="event-meta-header">
            <span className="event-day">Booking Details</span>
            <span className="event-type-badge session">
              {booking.payment_status || 'Status'}
            </span>
          </div>

          <h1 className="event-title">{booking.event_title || 'Event Booking'}</h1>
          <p className="event-description">
            View your booking information, purchased ticket items, attendee details, and payment records.
          </p>

          <div className="event-details-info">
            <div className="detail-item">
              <Receipt size={16} />
              <span>{booking.booking_reference}</span>
            </div>

            <div className="detail-item">
              <CalendarDays size={16} />
              <span>{formatDate(booking.booked_at || booking.created_at)}</span>
            </div>

            <div className="detail-item">
              <CreditCard size={16} />
              <span>₱{Number(booking.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="event-details-content">
        <div className="content-grid">
          <div className="main-content">
            <div className="speaker-section">
              <h2>Attendee Information</h2>

              <div className="speaker-card">
                <div className="speaker-info">
                  <h3>
                    <User size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    {booking.attendee_name}
                  </h3>
                  <p className="speaker-role">{booking.attendee_email}</p>
                  <p className="speaker-company">{booking.attendee_phone || 'No phone provided'}</p>
                  <p className="speaker-bio">
                    Booking Status: <strong>{booking.booking_status}</strong><br />
                    Payment Status: <strong>{booking.payment_status}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="speaker-section">
              <h2>Ticket Items</h2>

              {booking.items && booking.items.length > 0 ? (
                booking.items.map((item) => (
                  <div className="speaker-card" key={item.id}>
                    <div className="speaker-info">
                      <h3>{item.ticket_name}</h3>
                      <p className="speaker-role">Quantity: {item.quantity}</p>
                      <p className="speaker-company">
                        Unit Price: ₱{Number(item.unit_price || 0).toLocaleString()}
                      </p>
                      <p className="speaker-bio">
                        Subtotal: ₱{Number(item.subtotal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="speaker-card">
                  <div className="speaker-info">
                    <h3>No ticket items found</h3>
                    <p className="speaker-bio">This booking does not have any item details yet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-content">
            <div className="registration-section">
              <h3>Ticket QR</h3>
              <div className="registration-card">
                <div
                  ref={ticketRef}
                  className="ticket-qr-wrapper"
                  style={{
                    background: '#0b1220',
                    border: '1px dashed #334155',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  {booking.booking_reference ? (
                    <>
                      <QRCodeCanvas
                        value={booking.booking_reference}
                        size={180}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin={true}
                      />
                      <p
                        style={{
                          margin: 0,
                          color: '#cbd5e1',
                          fontSize: '14px'
                        }}
                      >
                        Scan this ticket for verification
                      </p>
                      <span
                        style={{
                          color: '#22c55e',
                          fontWeight: 700,
                          letterSpacing: '0.5px'
                        }}
                      >
                        {booking.booking_reference}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          marginTop: '6px',
                          paddingTop: '12px',
                          borderTop: '1px solid #1e293b',
                          textAlign: 'center'
                        }}
                      >
                        <p style={{ margin: '0 0 4px', color: '#fff', fontWeight: 700 }}>
                          {booking.event_title || 'Event Ticket'}
                        </p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                          {booking.attendee_name}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#94a3b8' }}>QR code not available.</p>
                  )}
                </div>

                <button
                  className="register-btn ticket-download-btn"
                  onClick={handleDownloadTicket}
                  disabled={!booking.booking_reference || downloading}
                >
                  {downloading ? 'Downloading...' : 'Download Ticket'}
                </button>
              </div>
            </div>

            <div className="registration-section">
              <h3>Booking Summary</h3>
              <div className="registration-card">
                <div className="registration-info">
                  <h4>{booking.event_title || 'Booked Event'}</h4>
                  <p className="registration-date">Reference: {booking.booking_reference}</p>
                  <p className="registration-time">Booking: {booking.booking_status}</p>
                  <p className="registration-location">Payment: {booking.payment_status}</p>
                </div>

                <div style={{ marginTop: '18px', display: 'grid', gap: '10px' }}>
                  <div className="detail-item">
                    <span>Total Amount: ₱{Number(booking.total_amount || 0).toLocaleString()}</span>
                  </div>

                  {booking.checked_in_at && (
                    <div className="detail-item">
                      <span>Checked In: {formatDate(booking.checked_in_at)}</span>
                    </div>
                  )}

                  {booking.cancellation_reason && (
                    <div className="detail-item">
                      <span>Cancellation: {booking.cancellation_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="registration-section">
              <h3>Payment Records</h3>

              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div className="registration-card" key={payment.id} style={{ marginBottom: '14px' }}>
                    <div className="registration-info">
                      <h4>{payment.provider || 'Payment Record'}</h4>
                      <p className="registration-date">
                        Amount: ₱{Number(payment.amount || 0).toLocaleString()}
                      </p>
                      <p className="registration-time">
                        Method: {payment.payment_method || 'N/A'}
                      </p>
                      <p className="registration-location">
                        Status: {payment.payment_status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="registration-card">
                  <p className="registration-location">No payment records available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
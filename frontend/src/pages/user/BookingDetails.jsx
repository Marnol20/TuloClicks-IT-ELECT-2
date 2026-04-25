import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CalendarDays,
  Receipt,
  User,
  CreditCard,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/EventDetails.css'
import api from '../../services/api'

function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const ticketRef = useRef(null)

  const [booking, setBooking] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  
  // New States for Upload
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handle Proof Upload
  async function handleUploadProof() {
    if (!selectedFile) return
    
    const formData = new FormData()
    formData.append('proof', selectedFile)
    formData.append('booking_id', id)

    setUploading(true)
    try {
      // Mag-create o mag-update og payment record nga naay attachment
      await api.post(`/payments/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      addToast('Proof of payment uploaded! Admin will verify it soon.', 'success')
      setSelectedFile(null)
      setPreviewUrl(null)
      fetchBookingDetails() // Refresh data
    } catch (error) {
      addToast(error.response?.data?.error || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
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
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="event-details-page"><div className="empty-state"><h3>Loading...</h3></div></div>
  if (!booking) return <div className="event-details-page"><div className="empty-state"><h3>Booking not found</h3></div></div>

  return (
    <div className="event-details-page">
      {/* Hero Section */}
      <div className="event-hero">
        <div className="event-hero-content">
          <div className="event-meta-header">
            <span className="event-day">Booking Details</span>
            <span className={`event-type-badge ${booking.payment_status === 'paid' ? 'success' : 'warning'}`}>
              {booking.payment_status?.toUpperCase() || 'PENDING'}
            </span>
          </div>
          <h1 className="event-title">{booking.event_title}</h1>
          <div className="event-details-info">
            <div className="detail-item"><Receipt size={16} /><span>{booking.booking_reference}</span></div>
            <div className="detail-item"><CreditCard size={16} /><span>₱{Number(booking.total_amount).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      <div className="event-details-content">
        <div className="content-grid">
          <div className="main-content">
            <section className="speaker-section">
              <h2>Attendee Information</h2>
              <div className="speaker-card">
                <div className="speaker-info">
                  <h3><User size={18} /> {booking.attendee_name}</h3>
                  <p className="speaker-role">{booking.attendee_email}</p>
                  <p className="speaker-company">{booking.attendee_phone}</p>
                </div>
              </div>
            </section>

            <section className="speaker-section">
              <h2>Ticket Items</h2>
              {booking.items?.map((item) => (
                <div className="speaker-card" key={item.id}>
                  <div className="speaker-info">
                    <h3>{item.ticket_name}</h3>
                    <p className="speaker-role">Qty: {item.quantity} x ₱{Number(item.unit_price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          <div className="sidebar-content">
            {/* 1. QR Code Section */}
            <div className="registration-section">
              <h3>Digital Ticket</h3>
              <div className="registration-card">
                <div ref={ticketRef} className="ticket-qr-wrapper" style={{ background: '#0b1220', padding: '20px', textAlign: 'center' }}>
                  <QRCodeCanvas value={booking.booking_reference} size={150} includeMargin={true} />
                  <p style={{ color: '#22c55e', fontWeight: 700, marginTop: '10px' }}>{booking.booking_reference}</p>
                </div>
                <button className="register-btn" onClick={handleDownloadTicket} disabled={downloading}>
                  {downloading ? 'Processing...' : 'Download PNG'}
                </button>
              </div>
            </div>

            {/* 2. NEW: Proof of Payment Upload */}
            {booking.payment_status !== 'paid' && (
              <div className="registration-section">
                <h3>Upload GCash Proof</h3>
                <div className="registration-card" style={{ border: '1px dashed #8b5cf6' }}>
                  {!previewUrl ? (
                    <label className="upload-label" style={{ cursor: 'pointer', textAlign: 'center', display: 'block', padding: '20px' }}>
                      <Upload size={32} style={{ color: '#8b5cf6', marginBottom: '10px' }} />
                      <p style={{ fontSize: '13px' }}>Click to select GCash Screenshot</p>
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="register-btn" onClick={handleUploadProof} disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                        <button className="cancel-btn" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Summary */}
            <div className="registration-section">
              <h3>Booking Summary</h3>
              <div className="registration-card">
                <p>Status: <strong>{booking.booking_status}</strong></p>
                <p>Payment: <strong>{booking.payment_status}</strong></p>
                <h4 style={{ color: '#22c55e', marginTop: '10px' }}>Total: ₱{Number(booking.total_amount).toLocaleString()}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
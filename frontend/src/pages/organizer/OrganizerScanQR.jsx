import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useToast } from '../../components/common/ToastContext'
import api from '../../services/api'

function OrganizerScanQR() {
  const { addToast } = useToast()
  const scannerRef = useRef(null)
  const [scanResult, setScanResult] = useState('')
  const [booking, setBooking] = useState(null)
  const [message, setMessage] = useState('Waiting for scanner...')
  const [scannerReady, setScannerReady] = useState(false)

  useEffect(() => {
    let scannerInstance = null

    async function startScanner() {
      try {
        scannerInstance = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )

        scannerRef.current = scannerInstance

        scannerInstance.render(
          async (decodedText) => {
<<<<<<< HEAD
            // Likayan ang double scan sa parehas nga code
=======
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
            if (decodedText === scanResult) return;
            
            setScanResult(decodedText)
            setMessage(`Scanned: ${decodedText}`)

            try {
              // 1. I-verify ang ticket
              const res = await api.get(`/bookings/verify/${decodedText}`)
              const foundBooking = res.data.booking;
              setBooking(foundBooking)

<<<<<<< HEAD
              // 2. Kon valid ug wala pa na check-in, i-automatic check-in dayon
              if (foundBooking && foundBooking.booking_status !== 'checked_in') {
=======
              // --- BAG-ONG LOGIC PARA SA CHECK-IN UG CHECK-OUT (TIME-OUT) ---
              
              if (foundBooking.booking_status === 'confirmed') {
                // FIRST SCAN: Check-in Process
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
                await api.patch(`/bookings/${foundBooking.id}/check-in`)
                
                setBooking(prev => ({ ...prev, booking_status: 'checked_in' }))
                addToast(`Success! ${foundBooking.attendee_name} is now checked in.`, 'success')
<<<<<<< HEAD
                setMessage('Check-in successful!')
              } else if (foundBooking.booking_status === 'checked_in') {
                addToast('This attendee is already checked in.', 'warning')
                setMessage('Already checked in.')
              }
=======
                setMessage('Check-in successful! (Time-in)')

              } else if (foundBooking.booking_status === 'checked_in') {
                // SECOND SCAN: Check-out Process (Time-out)
                // Kini nga status 'attended' mao ang mo-unlock sa Review feature
                await api.patch(`/bookings/${foundBooking.id}/status`, { status: 'attended' })
                
                setBooking(prev => ({ ...prev, booking_status: 'attended' }))
                addToast(`${foundBooking.attendee_name} has completed the event. Reviews enabled!`, 'info')
                setMessage('Check-out successful! (Event Completed)')

              } else if (foundBooking.booking_status === 'attended') {
                addToast('This ticket has already been checked out.', 'warning')
                setMessage('Already completed.')
              }
              
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
            } catch (error) {
              setBooking(null)
              const errorMsg = error.response?.data?.error || 'Invalid or unreadable ticket.'
              setMessage(errorMsg)
              addToast(errorMsg, 'error')
            }
          },
          () => { /* ignore live scan errors */ }
        )

        setScannerReady(true)
      } catch (error) {
        console.error('Scanner init error:', error)
        addToast('Failed to start QR scanner.', 'error')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [addToast, scanResult])

<<<<<<< HEAD
  // Helper para ma-reset ang scanner para sa sunod nga attendee
=======
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
  const handleReset = () => {
    setScanResult('')
    setBooking(null)
    setMessage('Ready to scan next ticket...')
  }

<<<<<<< HEAD
=======
  // Helper function para sa status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'checked_in': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: '#10b981', label: '✓ ADMITTED' };
      case 'attended': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '#3b82f6', label: '★ COMPLETED' };
      default: return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: '#eab308', label: 'PENDING' };
    }
  }

>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
  return (
    <main className="reports-page">
      <div className="reports-header">
        <div>
          <h2>QR Ticket Scanner</h2>
<<<<<<< HEAD
          <p>Scan attendee ticket QR codes for automatic event check-in</p>
=======
          <p>Scan attendee ticket QR codes for automatic event check-in and check-out</p>
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
        </div>
      </div>

      <section className="reports-grid">
        <div className="reports-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Scanner</h3>
            <button className="reports-refresh-btn" onClick={handleReset} style={{ padding: '5px 15px', fontSize: '12px' }}>
              Reset / Next Scan
            </button>
          </div>
          
          <div
            id="qr-reader"
            style={{
              width: '100%',
              minHeight: '320px',
              background: '#0b1220',
              borderRadius: '12px',
              padding: '12px'
            }}
          />
          {!scannerReady && (
            <p style={{ marginTop: '12px', color: '#94a3b8' }}>
              Initializing camera scanner...
            </p>
          )}
        </div>

        <div className="reports-panel">
          <h3>Scan Result</h3>
          <div style={{ 
            padding: '15px', 
            background: '#1a2235', 
            borderRadius: '8px', 
            border: '1px solid #2d3748',
            marginTop: '10px'
          }}>
            <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>
              <strong>Status:</strong> {message}
            </p>

            {booking && (
              <div style={{ borderTop: '1px solid #2d3748', paddingTop: '15px' }}>
                <p style={{ marginBottom: '8px' }}><strong>Attendee:</strong> {booking.attendee_name}</p>
                <p style={{ marginBottom: '8px' }}><strong>Reference:</strong> {booking.booking_reference}</p>
                <p style={{ marginBottom: '8px' }}><strong>Event:</strong> {booking.event_title}</p>
                
                <div style={{ 
                  marginTop: '15px', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  textAlign: 'center',
                  fontWeight: 'bold',
<<<<<<< HEAD
                  background: booking.booking_status === 'checked_in' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  color: booking.booking_status === 'checked_in' ? '#10b981' : '#eab308',
                  border: `1px solid ${booking.booking_status === 'checked_in' ? '#10b981' : '#eab308'}`
                }}>
                  {booking.booking_status === 'checked_in' ? '✓ ADMITTED' : 'PENDING'}
=======
                  background: getStatusColor(booking.booking_status).bg,
                  color: getStatusColor(booking.booking_status).text,
                  border: `1px solid ${getStatusColor(booking.booking_status).border}`
                }}>
                  {getStatusColor(booking.booking_status).label}
>>>>>>> 1f8375c (feat: refactor ticket inventory, add support UI, and implement QR-based review system)
                </div>
              </div>
            )}
          </div>
          
          {scanResult && (
            <p style={{ marginTop: '15px', fontSize: '12px', color: '#64748b' }}>
              <strong>Last Raw Code:</strong> {scanResult}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default OrganizerScanQR
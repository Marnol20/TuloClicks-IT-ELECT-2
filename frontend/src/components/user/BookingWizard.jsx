import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../common/ToastContext'
import api from '../../services/api'
import ConfirmModal from '../common/ConfirmModal'
import { Ticket, User, CreditCard, CheckCircle, Calendar, MapPin, Minus, Plus } from 'lucide-react'
import '../../styles/BookingWizard.css'

const BookingWizard = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // ✅ NEW: Track if event is concluded
  const [isEventConcluded, setIsEventConcluded] = useState(false)
  // ✅ NEW: Track if confirm modal is open
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  // ✅ NEW: Track if booking is being processed
  const [isBookingProcessing, setIsBookingProcessing] = useState(false)

  const [currentStage, setCurrentStage] = useState(1)
  const [formData, setFormData] = useState({
    ticketId: '',
    quantity: 1,
    fullName: '',
    contactNumber: '',
    email: '',
    paymentMethod: '',
    paymentOption: '',
    gcashNumber: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: ''
  })

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        contactNumber: user.phone || ''
      }))
    }
  }, [])

  useEffect(() => {
      if (id) {
        fetchEventDetails()
      }
  }, [id])

  // ✅ UPDATED: Enhanced to check event status early
  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [eventRes, ticketsRes, statusRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets/event/${id}`),
        // ✅ NEW: Fetch event status to check if concluded
        api.get(`/events/${id}/status`)
      ])

      setEvent(eventRes.data)
      setTickets(ticketsRes.data || [])
      
      // ✅ NEW: Check if event is concluded and set state
      if (statusRes.data.is_concluded) {
        setIsEventConcluded(true)
        setError('This event has already concluded. Bookings are no longer available.')
      }
      
      if (!ticketsRes.data || ticketsRes.data.length === 0) {
        setError('No tickets available for this event.')
      }
    } catch (error) {
      console.error('Fetch event details error:', error)
      setError('Failed to load event details. Please try again.')
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPDATED: Added early event status check
  const handleStage1Submit = (e) => {
    e.preventDefault()
    
    // ✅ NEW: Prevent progression if event is concluded
    if (isEventConcluded) {
      addToast('This event has concluded. No new bookings are allowed.', 'error')
      return
    }
    
    if (!formData.ticketId || !formData.quantity) {
      addToast('Please select a ticket and quantity', 'warning')
      return
    }
    
    const selectedTicket = tickets.find(t => t.id === Number(formData.ticketId))
    if (!selectedTicket) {
      addToast('Selected ticket not found', 'error')
      return
    }
    
    const available = selectedTicket.quantity_available
    if (available <= 0) {
      addToast('This ticket is no longer available', 'error')
      return
    }
    
    if (formData.quantity > available) {
      addToast(`Only ${available} tickets available`, 'warning')
      return
    }
    
    setCurrentStage(2)
  }

  const handleStage2Submit = (e) => {
    e.preventDefault()
    if (!formData.fullName || !formData.contactNumber || !formData.email) {
      addToast('Please fill in all required fields', 'warning')
      return
    }
    // Final check for contact number length
    if (formData.contactNumber.length !== 11) {
      addToast('Contact number must be exactly 11 digits', 'warning')
      return
    }
    setCurrentStage(3)
  }

  // ✅ UPDATED: Better validation and logging for Stage 3->4 progression
  const handleStage3Submit = (e) => {
    e.preventDefault()
    if (!formData.paymentMethod) {
      addToast('Please select a payment method', 'warning')
      return
    }
    
    if (formData.paymentMethod === 'online') {
      if (!formData.paymentOption) {
        addToast('Please select an online payment option', 'warning')
        return
      }
      
      if (formData.paymentOption === 'gcash') {
        if (!formData.gcashNumber) {
          addToast('Please enter your GCash number', 'warning')
          return
        }
        if (formData.gcashNumber.length !== 11 || !formData.gcashNumber.startsWith('09')) {
          addToast('GCash number must be 11 digits and start with 09', 'error')
          return
        }
      }
      
      if (formData.paymentOption === 'card') {
        if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv) {
          addToast('Please fill in all card details', 'warning')
          return
        }
        if (formData.cardNumber.length !== 16) {
          addToast('Card number must be 16 digits', 'error')
          return
        }
        if (formData.cardCvv.length !== 3) {
          addToast('CVV must be 3 digits', 'error')
          return
        }
      }
    }
    
    // ✅ NEW: Ensure stage progresses to 4 (confirm stage)
    console.log('✅ Moving to Stage 4 - Review & Confirm')
    setCurrentStage(4)
  }

  // ✅ IMPROVED: Better concluded event check with backend verification
  const handleBookNow = async () => {
    try {
      setIsBookingProcessing(true)
      
      // ✅ DOUBLE CHECK: Prevent booking if frontend says event is concluded
      if (isEventConcluded) {
        addToast('Cannot book concluded events. This event has already ended.', 'error')
        setIsBookingProcessing(false)
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        addToast('Please log in first', 'error')
        navigate('/login')
        return
      }

      // ✅ Final check with backend before booking
      const statusRes = await api.get(`/events/${id}/status`)
      console.log('🔍 Final status check:', statusRes.data)
      
      if (statusRes.data.is_concluded) {
        addToast('This event has already concluded. No new bookings are allowed.', 'error')
        setIsBookingProcessing(false)
        return
      }

      const bookingRes = await api.post('/bookings', {
        event_id: Number(id),
        attendee_name: formData.fullName,
        attendee_email: formData.email,
        attendee_phone: formData.contactNumber,
        items: [
          {
            ticket_type_id: Number(formData.ticketId),
            quantity: Number(formData.quantity)
          }
        ]
      })

      const totalAmount = bookingRes.data.total_amount
      const bookingId = bookingRes.data.booking_id

      await api.post('/payments', {
        booking_id: bookingId,
        provider: formData.paymentMethod === 'cash' ? 'manual' : 'online',
        payment_method: formData.paymentMethod === 'cash' ? 'cash' : formData.paymentOption,
        amount: totalAmount
      })

      addToast('Booking successful! Your tickets have been reserved.', 'success')
      setTimeout(() => {
        navigate('/home/tickets')
      }, 1500)
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create booking'
      addToast(errorMsg, 'error')
      console.error('❌ Booking error:', errorMsg)
    } finally {
      setIsBookingProcessing(false)
    }
  }

  // ✅ UPDATED: Confirm booking with event conclusion check
  const handleConfirmBooking = async () => {
    if (isEventConcluded) {
      addToast('Event has concluded. Booking cannot proceed.', 'error')
      setShowConfirmModal(false)
      return
    }
    console.log('✅ Confirm Booking - Modal confirmed, processing booking')
    setShowConfirmModal(false)
    await handleBookNow()
  }

  // ✅ NEW: Cancel modal without confirming
  const handleCancelConfirm = () => {
    console.log('✅ Booking cancelled by user')
    setShowConfirmModal(false)
  }

  const goBack = (stage) => {
    setCurrentStage(stage)
  }

  const getSelectedTicket = () => {
    return tickets.find(t => t.id === Number(formData.ticketId))
  }

  const getTicketPrice = () => {
    const ticket = getSelectedTicket()
    return ticket ? Number(ticket.price) : 0
  }

  const incrementQuantity = () => {
    const selectedTicket = getSelectedTicket()
    if (selectedTicket) {
      const available = selectedTicket.quantity_available
      if (formData.quantity < available) {
        setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))
      } else {
        addToast(`Only ${available} tickets available`, 'warning')
      }
    }
  }

  const decrementQuantity = () => {
    if (formData.quantity > 1) {
      setFormData(prev => ({ ...prev, quantity: prev.quantity - 1 }))
    }
  }

  const getTotalAmount = () => {
    return getTicketPrice() * formData.quantity
  }

  const formatDate = (date) => {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  const getLocation = () => {
    if (!event) return 'Location not available'
    if (event.location_type === 'online') return 'Online Event'
    if (event.custom_location) return event.custom_location
    if (event.venue_name) return event.venue_name
    return 'Location not available'
  }

  if (loading) {
    return (
      <div className="booking-wizard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  const progressPercent = currentStage === 1 ? 0 : currentStage === 2 ? 33 : currentStage === 3 ? 66 : 100

  return (
    <div className="booking-wizard">
      <div className="progress-indicator" style={{ '--progress': progressPercent }}>
        <div className={`progress-step ${currentStage >= 1 ? 'active' : ''} ${currentStage > 1 ? 'completed' : ''}`}>
          <div className="progress-icon">
            {currentStage > 1 ? <CheckCircle size={18} /> : <Ticket size={18} />}
          </div>
          <span>Select Ticket</span>
        </div>
        <div className={`progress-step ${currentStage >= 2 ? 'active' : ''} ${currentStage > 2 ? 'completed' : ''}`}>
          <div className="progress-icon">
            {currentStage > 2 ? <CheckCircle size={18} /> : <User size={18} />}
          </div>
          <span>Your Details</span>
        </div>
        <div className={`progress-step ${currentStage >= 3 ? 'active' : ''} ${currentStage > 3 ? 'completed' : ''}`}>
          <div className="progress-icon">
            {currentStage > 3 ? <CheckCircle size={18} /> : <CreditCard size={18} />}
          </div>
          <span>Payment</span>
        </div>
        <div className={`progress-step ${currentStage >= 4 ? 'active' : ''}`}>
          <div className="progress-icon">
            <CheckCircle size={18} />
          </div>
          <span>Confirm</span>
        </div>
      </div>

      <div className="wizard-content">
        {currentStage === 1 && (
          <div className="stage-panel">
            <div className="stage-header">
              <Ticket className="stage-icon" size={24} />
              <h2>Select Your Ticket</h2>
            </div>
            
            {/* ✅ BUG 1 COMPLETE FIX: Completely hide tickets if event is concluded */}
            {isEventConcluded ? (
              <>
                <div className="event-summary-card">
                  <div className="event-summary-main">
                    <h3>{event.title}</h3>
                    <div className="event-summary-details">
                      <span><Calendar size={14} /> {formatDate(event.start_date)}</span>
                      <span><MapPin size={14} /> {getLocation()}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ BUG 1 FIX: Show this message instead of tickets */}
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ color: '#fca5a5', marginBottom: '0.5rem', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                    ⏰ Event Concluded
                  </h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', margin: '0.5rem 0' }}>
                    This event has already ended and is no longer accepting bookings.
                  </p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    Please check our available events and try booking another one.
                  </p>
                </div>

                <div className="stage-footer">
                  <button 
                    type="button" 
                    className="btn-continue"
                    onClick={() => navigate('/home/events')}
                  >
                    Browse Other Events
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="event-summary-card">
                  <div className="event-summary-main">
                    <h3>{event.title}</h3>
                    <div className="event-summary-details">
                      <span><Calendar size={14} /> {formatDate(event.start_date)}</span>
                      <span><MapPin size={14} /> {getLocation()}</span>
                    </div>
                  </div>
                </div>

                {/* ✅ Original ticket selection code - only show if NOT concluded */}
                <div className="ticket-selection">
                  <label className="section-label">Choose Ticket Type</label>
                  <div className="ticket-grid">
                    {tickets.map((ticket) => {
                      const available = ticket.quantity_available;
                      return (
                        <div
                          key={ticket.id}
                          className={`ticket-card ${formData.ticketId === ticket.id ? 'selected' : ''} ${available === 0 ? 'disabled' : ''}`}
                          onClick={() => {
                            if (available > 0) {
                              setFormData(prev => ({ ...prev, ticketId: ticket.id }));
                            }
                          }}
                        >
                          <div className="ticket-card-header">
                            <span className="ticket-type">{ticket.name}</span>
                            <span className="ticket-avail">
                              {available === 0 ? 'Sold Out' : `${available} left`}
                            </span>
                          </div>
                          <div className="ticket-price-tag">₱{Number(ticket.price).toLocaleString()}</div>
                          {formData.ticketId === ticket.id && (
                            <div className="ticket-check"><CheckCircle size={20} /></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="quantity-section">
                  <label className="section-label">Number of Tickets</label>
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={decrementQuantity} disabled={formData.quantity <= 1}><Minus size={18} /></button>
                    <span className="qty-value">{formData.quantity}</span>
                    <button className="qty-btn" onClick={incrementQuantity}><Plus size={18} /></button>
                  </div>
                  {formData.ticketId && (
                    <div className="quantity-total">Total: <span>₱{getTotalAmount().toLocaleString()}</span></div>
                  )}
                </div>

                <div className="stage-footer">
                  <button 
                    type="button" 
                    className="btn-continue" 
                    onClick={handleStage1Submit}
                  >
                    Continue to Details
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {currentStage === 2 && (
          <div className="stage-panel">
            <div className="stage-header">
              <User className="stage-icon" size={24} />
              <h2>Your Details</h2>
            </div>

            <form onSubmit={handleStage2Submit} id="stage2-form">
              <div className="form-section">
                <div className="input-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Contact Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setFormData(prev => ({ ...prev, contactNumber: val }));
                    }}
                    placeholder="09XXXXXXXXX (11 digits)"
                    maxLength="11"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
            </form>

            <div className="stage-footer">
              <button type="button" onClick={() => goBack(1)} className="btn-back">Back</button>
              <button type="submit" form="stage2-form" className="btn-continue">Continue to Payment</button>
            </div>
          </div>
        )}

        {currentStage === 3 && (
          <div className="stage-panel">
            <div className="stage-header">
              <CreditCard className="stage-icon" size={24} />
              <h2>Payment Method</h2>
            </div>

            <form onSubmit={handleStage3Submit} id="stage3-form">
              <div className="payment-options">
                <label className={`payment-card ${formData.paymentMethod === 'cash' ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash', paymentOption: '' }))}>
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} readOnly />
                  <div className="payment-card-content">
                    <div className="payment-card-icon cash">💵</div>
                    <div className="payment-card-info">
                      <span className="payment-card-title">Cash Payment</span>
                      <span className="payment-card-desc">Pay at the venue</span>
                    </div>
                  </div>
                </label>

                <label className={`payment-card ${formData.paymentMethod === 'online' ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'online', paymentOption: '' }))}>
                  <input type="radio" name="paymentMethod" value="online" checked={formData.paymentMethod === 'online'} readOnly />
                  <div className="payment-card-content">
                    <div className="payment-card-icon online">💳</div>
                    <div className="payment-card-info">
                      <span className="payment-card-title">Online Payment</span>
                      <span className="payment-card-desc">Pay securely online</span>
                    </div>
                  </div>
                </label>
              </div>

              {formData.paymentMethod === 'online' && (
                <div className="online-options">
                  <label className="section-label">Select Payment Option</label>
                  <div className="online-options-grid">
                    <div className={`online-option ${formData.paymentOption === 'gcash' ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'gcash' }))}>
                      <span className="online-option-icon">📱</span><span>GCash</span>
                    </div>
                    <div className={`online-option ${formData.paymentOption === 'card' ? 'selected' : ''}`} onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'card' }))}>
                      <span className="online-option-icon">💳</span><span>Card</span>
                    </div>
                  </div>

                  {formData.paymentOption === 'gcash' && (
                    <div className="payment-details">
                      <div className="input-group">
                        <label>GCash Number</label>
                        <input
                          type="tel"
                          value={formData.gcashNumber}
                          onChange={(e) => {
                             const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                             setFormData(prev => ({ ...prev, gcashNumber: val }));
                          }}
                          placeholder="09XXXXXXXXX (11 digits)"
                          maxLength="11"
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentOption === 'card' && (
                    <div className="payment-details">
                      <div className="input-group">
                        <label>Card Number</label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setFormData(prev => ({ ...prev, cardNumber: val }));
                          }}
                          placeholder="16-digit card number"
                          maxLength="16"
                        />
                      </div>
                      <div className="input-group">
                        <label>Cardholder Name</label>
                        <input type="text" value={formData.cardName} onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))} placeholder="John Doe" />
                      </div>
                      <div className="input-row">
                        <div className="input-group">
                          <label>Expiry Date</label>
                          <input 
                            type="text" 
                            value={formData.cardExpiry} 
                            onChange={(e) => {
                               let val = e.target.value.replace(/\D/g, '');
                               if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2,4);
                               setFormData(prev => ({ ...prev, cardExpiry: val }));
                            }} 
                            placeholder="MM/YY" 
                            maxLength="5" 
                          />
                        </div>
                        <div className="input-group">
                          <label>CVV</label>
                          <input 
                            type="text" 
                            value={formData.cardCvv} 
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                               setFormData(prev => ({ ...prev, cardCvv: val }));
                            }} 
                            placeholder="123" 
                            maxLength="3" 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="stage-footer">
              <button type="button" onClick={() => goBack(2)} className="btn-back">Back</button>
              <button type="submit" form="stage3-form" className="btn-continue">Review Order</button>
            </div>
          </div>
        )}

        {/* ✅ BUG 2 FIX: Stage 4 (Review & Confirm) - Proper ConfirmModal implementation */}
        {currentStage === 4 && (
          <div className="stage-panel">
            <div className="stage-header">
              <CheckCircle className="stage-icon" size={24} />
              <h2>Review & Confirm</h2>
            </div>

            <div className="confirmation-card">
               <div className="confirm-section">
                <div className="confirm-section-header"><span>Event Details</span></div>
                <div className="confirm-item"><span className="confirm-label">Event</span><span className="confirm-value">{event.title}</span></div>
                <div className="confirm-item"><span className="confirm-label">Date</span><span className="confirm-value">{formatDate(event.start_date)}</span></div>
                <div className="confirm-item"><span className="confirm-label">Location</span><span className="confirm-value">{getLocation()}</span></div>
              </div>
              <div className="confirm-section">
                <div className="confirm-section-header"><span>Ticket Information</span></div>
                <div className="confirm-item"><span className="confirm-label">Ticket Type</span><span className="confirm-value">{getSelectedTicket()?.name}</span></div>
                <div className="confirm-item"><span className="confirm-label">Quantity</span><span className="confirm-value">x{formData.quantity}</span></div>
                <div className="confirm-item total"><span className="confirm-label">Total</span><span className="confirm-value price">₱{getTotalAmount().toLocaleString()}</span></div>
              </div>
              <div className="confirm-section">
                <div className="confirm-section-header"><span>Your Information</span></div>
                <div className="confirm-item"><span className="confirm-label">Name</span><span className="confirm-value">{formData.fullName}</span></div>
                <div className="confirm-item"><span className="confirm-label">Phone</span><span className="confirm-value">{formData.contactNumber}</span></div>
              </div>
            </div>

            <div className="stage-footer">
              <button type="button" onClick={() => goBack(3)} className="btn-back">Back</button>
              {/* ✅ FIXED: Button with improved concluded event check */}
              <button 
                type="button"
                className="btn-confirm"
                onClick={() => {
                  if (isEventConcluded) {
                    addToast('Cannot book concluded events', 'error')
                    return
                  }
                  setShowConfirmModal(true)
                }}
                disabled={isBookingProcessing}
                style={{ 
                  opacity: isBookingProcessing ? 0.6 : 1, 
                  cursor: isBookingProcessing ? 'not-allowed' : 'pointer' 
                }}
              >
                {isBookingProcessing ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>

            {/* ✅ FIXED: Proper ConfirmModal with isOpen state management */}
            <ConfirmModal
              isOpen={showConfirmModal}
              title="Confirm Booking"
              message="Are you sure you want to proceed with this booking?"
              confirmText="Confirm"
              cancelText="Cancel"
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelConfirm}
              isLoading={isBookingProcessing}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingWizard
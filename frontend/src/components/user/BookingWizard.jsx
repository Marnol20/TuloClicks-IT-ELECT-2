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

  const fetchEventDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('Fetching event details for ID:', id)
      
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets/event/${id}`)
      ])

      console.log('Event data:', eventRes.data)
      console.log('Tickets data:', ticketsRes.data)

      setEvent(eventRes.data)
      setTickets(ticketsRes.data || [])
      
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

  const handleStage1Submit = (e) => {
    e.preventDefault()
    if (!formData.ticketId || !formData.quantity) {
      addToast('Please select a ticket and quantity', 'warning')
      return
    }
    
    // Check if selected ticket has availability
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
    setCurrentStage(3)
  }

  const handleStage3Submit = (e) => {
    e.preventDefault()
    if (!formData.paymentMethod) {
      addToast('Please select a payment method', 'warning')
      return
    }
    
    if (formData.paymentMethod === 'online' && !formData.paymentOption) {
      addToast('Please select an online payment option', 'warning')
      return
    }
    
    if (formData.paymentMethod === 'online' && formData.paymentOption === 'gcash' && !formData.gcashNumber) {
      addToast('Please enter your GCash number', 'warning')
      return
    }
    
    if (formData.paymentMethod === 'online' && formData.paymentOption === 'card' && 
        (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvv)) {
      addToast('Please fill in all card details', 'warning')
      return
    }
    
    setCurrentStage(4)
  }

  const handleBookNow = async () => {
    try {
      // Check if event is concluded
      const statusRes = await api.get(`/events/${id}/status`)
      if (statusRes.data.is_concluded) {
        addToast('This event has concluded. No new bookings are allowed.', 'error')
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        addToast('Please log in first', 'error')
        navigate('/login')
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
    }
  }

  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addToast('Please log in first', 'error')
        navigate('/login')
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
    }
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

  if (!event) {
    return (
      <div className="booking-wizard">
        <div className="error-container">
          <h2>Event Not Found</h2>
          <p>This event may not be published or available.</p>
          <button onClick={() => navigate('/home/events')} className="btn-primary">
            Browse Events
          </button>
        </div>
      </div>
    )
  }

  const progressPercent = currentStage === 1 ? 0 : currentStage === 2 ? 33 : currentStage === 3 ? 66 : 100

  return (
    <div className="booking-wizard">
      {/* Progress Indicator */}
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
        {/* Stage 1: Select Ticket */}
        {currentStage === 1 && (
          <div className="stage-panel">
            <div className="stage-header">
              <Ticket className="stage-icon" size={24} />
              <h2>Select Your Ticket</h2>
            </div>
            
            <div className="event-summary-card">
              <div className="event-summary-main">
                <h3>{event.title}</h3>
                <div className="event-summary-details">
                  <span><Calendar size={14} /> {formatDate(event.start_date)}</span>
                  <span><MapPin size={14} /> {getLocation()}</span>
                </div>
              </div>
            </div>

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
                      style={{ opacity: available === 0 ? 0.5 : 1, cursor: available === 0 ? 'not-allowed' : 'pointer' }}
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
                <button 
                  className="qty-btn" 
                  onClick={decrementQuantity}
                  disabled={formData.quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="qty-value">{formData.quantity}</span>
                <button className="qty-btn" onClick={incrementQuantity}>
                  <Plus size={18} />
                </button>
              </div>
              {formData.ticketId && (
                <div className="quantity-total">
                  Total: <span>₱{getTotalAmount().toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="stage-footer">
              <button type="submit" form="stage1-form" className="btn-continue" onClick={handleStage1Submit}>
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Your Details */}
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
                      const phoneNumber = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setFormData(prev => ({ ...prev, contactNumber: phoneNumber }));
                    }}
                    placeholder="Enter your contact number (11 digits max)"
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
              <button type="button" onClick={() => goBack(1)} className="btn-back">
                Back
              </button>
              <button type="submit" form="stage2-form" className="btn-continue" onClick={handleStage2Submit}>
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Payment */}
        {currentStage === 3 && (
          <div className="stage-panel">
            <div className="stage-header">
              <CreditCard className="stage-icon" size={24} />
              <h2>Payment Method</h2>
            </div>

            <form onSubmit={handleStage3Submit} id="stage3-form">
              <div className="payment-options">
                <label 
                  className={`payment-card ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cash', paymentOption: '' }))}
                >
                  <input
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentMethod: e.target.value,
                      paymentOption: ''
                    }))}
                  />
                  <div className="payment-card-content">
                    <div className="payment-card-icon cash">💵</div>
                    <div className="payment-card-info">
                      <span className="payment-card-title">Cash Payment</span>
                      <span className="payment-card-desc">Pay at the venue</span>
                    </div>
                  </div>
                </label>

                <label 
                  className={`payment-card ${formData.paymentMethod === 'online' ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'online', paymentOption: '' }))}
                >
                  <input
                    type="radio"
                    id="online"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentMethod: e.target.value,
                      paymentOption: ''
                    }))}
                  />
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
                    <div 
                      className={`online-option ${formData.paymentOption === 'gcash' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'gcash' }))}
                    >
                      <span className="online-option-icon">📱</span>
                      <span>GCash</span>
                    </div>
                    <div 
                      className={`online-option ${formData.paymentOption === 'card' ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentOption: 'card' }))}
                    >
                      <span className="online-option-icon">💳</span>
                      <span>Card</span>
                    </div>
                  </div>

                  {formData.paymentOption === 'gcash' && (
                    <div className="payment-details">
                      <div className="input-group">
                        <label>GCash Number</label>
                        <input
                          type="tel"
                          value={formData.gcashNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, gcashNumber: e.target.value }))}
                          placeholder="Enter your GCash number"
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
                          onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="input-group">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          value={formData.cardName}
                          onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="input-row">
                        <div className="input-group">
                          <label>Expiry Date</label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData(prev => ({ ...prev, cardExpiry: e.target.value }))}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="input-group">
                          <label>CVV</label>
                          <input
                            type="text"
                            value={formData.cardCvv}
                            onChange={(e) => setFormData(prev => ({ ...prev, cardCvv: e.target.value }))}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="stage-footer">
              <button type="button" onClick={() => goBack(2)} className="btn-back">
                Back
              </button>
              <div className="btn-group">
                <button type="submit" form="stage3-form" className="btn-continue">
                  Review Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stage 4: Confirmation */}
        {currentStage === 4 && (
          <div className="stage-panel">
            <div className="stage-header">
              <CheckCircle className="stage-icon" size={24} />
              <h2>Review & Confirm</h2>
            </div>

            <div className="confirmation-card">
              <div className="confirm-section">
                <div className="confirm-section-header">
                  <span>Event Details</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Event</span>
                  <span className="confirm-value">{event.title}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Date</span>
                  <span className="confirm-value">{formatDate(event.start_date)}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Location</span>
                  <span className="confirm-value">{getLocation()}</span>
                </div>
              </div>

              <div className="confirm-section">
                <div className="confirm-section-header">
                  <span>Ticket Information</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Ticket Type</span>
                  <span className="confirm-value">{getSelectedTicket()?.name || 'N/A'}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Quantity</span>
                  <span className="confirm-value">x{formData.quantity}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Unit Price</span>
                  <span className="confirm-value">₱{getTicketPrice().toLocaleString()}</span>
                </div>
                <div className="confirm-item total">
                  <span className="confirm-label">Total</span>
                  <span className="confirm-value price">₱{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>

              <div className="confirm-section">
                <div className="confirm-section-header">
                  <span>Your Information</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Name</span>
                  <span className="confirm-value">{formData.fullName}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Phone</span>
                  <span className="confirm-value">{formData.contactNumber}</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Email</span>
                  <span className="confirm-value">{formData.email}</span>
                </div>
              </div>

              <div className="confirm-section">
                <div className="confirm-section-header">
                  <span>Payment Method</span>
                </div>
                <div className="confirm-item">
                  <span className="confirm-label">Method</span>
                  <span className="confirm-value">
                    {formData.paymentMethod === 'cash' ? 'Cash Payment' : 'Online Payment'}
                  </span>
                </div>
                {formData.paymentMethod === 'online' && (
                  <div className="confirm-item">
                    <span className="confirm-label">Option</span>
                    <span className="confirm-value">
                      {formData.paymentOption === 'gcash' ? 'GCash' : 'Credit/Debit Card'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="stage-footer">
              <button type="button" onClick={() => goBack(3)} className="btn-back">
                Back
              </button>
              <div className="btn-group">
                <button type="button" onClick={handleBookNow} className="btn-book-now">
                  Book Now
                </button>
                <ConfirmModal
                  onConfirm={handleConfirmBooking}
                  confirmText="Confirm Booking"
                  cancelText="Cancel"
                  title="Confirm Booking"
                  message="Are you sure you want to proceed with this booking?"
                >
                  <button className="btn-confirm">
                    Confirm Booking
                  </button>
                </ConfirmModal>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingWizard
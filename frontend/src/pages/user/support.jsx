import { useState } from 'react'
// ✅ REMOVED: import axios from 'axios' - use api service instead
// ✅ NEW: Import the shared api service
import api from '../../services/api'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Support.css'

const Support = () => {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    subject: '',
    issue_type: 'technical',
    description: ''
  })
  // ✅ NEW: Add loading state for better UX
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ UPDATED: Use api service instead of hardcoded axios
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ NEW: Validate before submitting
    if (!formData.subject.trim()) {
      addToast('Please enter a subject', 'warning')
      return
    }
    
    if (!formData.description.trim()) {
      addToast('Please enter a description', 'warning')
      return
    }

    try {
      setIsSubmitting(true)
      // ✅ UPDATED: Use api.post instead of axios.post with hardcoded URL
      await api.post('/support', {
        subject: formData.subject.trim(),
        issue_type: formData.issue_type,
        description: formData.description.trim()
      })
      
      addToast('Your ticket has been submitted!', 'success')
      setFormData({ subject: '', issue_type: 'technical', description: '' })
    } catch (err) {
      console.error('Support ticket submission error:', err)
      if (err.response && err.response.status === 401) {
        addToast('Unauthorized. Please logout and login again.', 'error')
      } else if (err.response?.data?.error) {
        addToast(err.response.data.error, 'error')
      } else {
        addToast('Could not send ticket. Please try again.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="support-page">
      {/* ── Hero ── */}
      <div className="support-page-hero">
        <p className="support-hero-eyebrow">Help Center</p>
        <h1 className="support-hero-title">Contact Support</h1>
        <p className="support-hero-sub">
          Having an issue? Submit a ticket and our team will get back to you as soon as possible.
        </p>
      </div>

      {/* ── Form Card ── */}
      <div className="support-content-area">
        <div className="support-card">
          <h2 className="support-card-title">Submit a Ticket</h2>
          <p className="support-card-desc">
            Fill out the form below and describe your issue in detail.
          </p>

          <form className="support-form" onSubmit={handleSubmit}>
            <div className="support-form-group">
              <label>Subject</label>
              <input
                className="support-input"
                type="text"
                placeholder="Brief summary of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="support-form-group">
              <label>Issue Type</label>
              <select
                className="support-select"
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="technical">Technical Issue</option>
                <option value="refund">Refund</option>
                <option value="complaint">Complaint</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="support-form-group">
              <label>Description</label>
              <textarea
                className="support-textarea"
                placeholder="Describe your issue in detail..."
                rows="6"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* ✅ UPDATED: Show loading state on button */}
            <button 
              type="submit" 
              className="support-submit-btn"
              disabled={isSubmitting}
              style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Support
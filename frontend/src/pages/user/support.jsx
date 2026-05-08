import { useState } from 'react'
import axios from 'axios'
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Support.css'

const Support = () => {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    subject: '',
    issue_type: 'technical',
    description: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      await axios.post('http://localhost:5000/api/support', formData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      })
      addToast('Your ticket has been submitted!', 'success')
      setFormData({ subject: '', issue_type: 'technical', description: '' })
    } catch (err) {
      console.error(err)
      if (err.response && err.response.status === 401) {
        addToast('Unauthorized. Please logout and login again.', 'error')
      } else {
        addToast('Could not send ticket. Please try again.', 'error')
      }
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
              />
            </div>

            <div className="support-form-group">
              <label>Issue Type</label>
              <select
                className="support-select"
                value={formData.issue_type}
                onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
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
              />
            </div>

            <button type="submit" className="support-submit-btn">
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Support

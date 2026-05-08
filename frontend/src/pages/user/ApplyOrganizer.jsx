import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Calendar, BarChart2, Users, Megaphone } from 'lucide-react'
import { useToast } from '../../components/common/ToastContext'
import tcLogo from '../../styles/TuloClicksLogo.png'
import '../../styles/ApplyOrganizer.css'
import api from '../../services/api'

const PERKS = [
  { Icon: Calendar,   text: 'Create and publish events with ease' },
  { Icon: Users,      text: 'Reach thousands of active attendees' },
  { Icon: BarChart2,  text: 'Track bookings, revenue & analytics' },
  { Icon: Megaphone,  text: 'Promote events to a targeted audience' },
]

const ORG_TYPES = [
  '', 'Company', 'School Organization', 'Community Group',
  'Non-Profit', 'Government Agency', 'Individual / Freelancer', 'Other',
]

function ApplyOrganizer() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [organizationName, setOrganizationName] = useState('')
  const [organizationType, setOrganizationType] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [facebookLink, setFacebookLink] = useState('')
  const [instagramLink, setInstagramLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!organizationName.trim()) {
      addToast('Organization name is required', 'warning')
      return
    }
    try {
      setLoading(true)
      setError('')
      await api.post('/organizers/apply', {
        organization_name: organizationName,
        organization_type: organizationType,
        description,
        website,
        facebook_link: facebookLink,
        instagram_link: instagramLink,
      })
      setSubmitted(true)
      addToast('Application submitted successfully!', 'success')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit application'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ao-page">

      {/* ── Left panel ── */}
      <div className="ao-left">
        <div className="ao-left-bg" />
        <div className="ao-left-overlay" />
        <div className="ao-left-content">
          <div className="ao-left-brand">
            <img className="ao-left-brand-mark" src={tcLogo} alt="TuloClicks" />
            <span className="ao-left-brand-name">TuloClicks</span>
          </div>

          <div className="ao-left-body">
            <div className="ao-left-tag">
              <span className="ao-left-tag-dot" />
              Organizer Program
            </div>
            <h2 className="ao-left-headline">
              Host Events.<br />Grow Your<br />Audience.
            </h2>
            <p className="ao-left-sub">
              Join TuloClicks as a verified organizer and start creating
              experiences that bring people together.
            </p>
            <ul className="ao-left-perks">
              {PERKS.map(({ Icon, text }, i) => (
                <li key={i}>
                  <span className="ao-perk-icon"><Icon size={15} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="ao-left-note">
            <p className="ao-left-note-text">
              "TuloClicks gave our events the visibility we needed — ticket sales doubled in our first month!"
            </p>
            <span className="ao-left-note-author">— Juan Dela Cruz, Event Organizer</span>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="ao-right">
        <div className="ao-form-wrap">
          <button className="ao-back-btn" onClick={() => navigate('/home')}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          {!submitted ? (
            <>
              <div className="ao-form-header">
                <h2>Apply as Organizer</h2>
                <p className="ao-form-subtitle">Fill in your organization details for admin review</p>
              </div>

              <form className="ao-form" onSubmit={handleSubmit}>
                <p className="ao-form-section-label">Organization Info</p>

                <div className="ao-field">
                  <label>Organization Name <span className="ao-required">*</span></label>
                  <input
                    className="ao-input"
                    type="text"
                    placeholder="e.g. Cebu Events Co."
                    value={organizationName}
                    onChange={(e) => { setOrganizationName(e.target.value); setError('') }}
                    required
                  />
                </div>

                <div className="ao-field">
                  <label>Organization Type</label>
                  <select
                    className="ao-select"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>{t || 'Select a type…'}</option>
                    ))}
                  </select>
                </div>

                <div className="ao-field">
                  <label>Description</label>
                  <textarea
                    className="ao-textarea"
                    placeholder="Tell us about your organization and what kind of events you plan to host…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="ao-field">
                  <label>Website</label>
                  <input
                    className="ao-input"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <p className="ao-form-section-label" style={{ marginTop: '4px' }}>Social Media</p>

                <div className="ao-social-row">
                  <div className="ao-field">
                    <label>Facebook</label>
                    <input
                      className="ao-input"
                      type="url"
                      placeholder="facebook.com/…"
                      value={facebookLink}
                      onChange={(e) => setFacebookLink(e.target.value)}
                    />
                  </div>
                  <div className="ao-field">
                    <label>Instagram</label>
                    <input
                      className="ao-input"
                      type="url"
                      placeholder="instagram.com/…"
                      value={instagramLink}
                      onChange={(e) => setInstagramLink(e.target.value)}
                    />
                  </div>
                </div>

                {error && <p className="ao-error">{error}</p>}

                <button type="submit" className="ao-submit-btn" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit Application'}
                </button>
              </form>
            </>
          ) : (
            <div className="ao-success">
              <div className="ao-success-icon">
                <CheckCircle size={36} />
              </div>
              <h2>Application Submitted!</h2>
              <p>
                Your organizer application is now pending admin review.
                We'll notify you once a decision has been made.
              </p>
              <div className="ao-success-steps">
                {[
                  'Application received by TuloClicks',
                  'Admin reviews your organization details',
                  'You get notified of approval or feedback',
                ].map((step, i) => (
                  <div key={i} className="ao-success-step">
                    <span className="ao-success-step-num">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              <button className="ao-submit-btn" onClick={() => navigate('/home')}>
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default ApplyOrganizer

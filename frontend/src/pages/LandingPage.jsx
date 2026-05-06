import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { isAuthenticated, getCurrentUser } from '../services/auth'
import { Compass, Ticket, Bell, Users, Shield, Zap } from 'lucide-react'
import tcLogo from '../styles/TuloClicksLogo.png'
import '../styles/LandingPage.css'

const ACCENT_COLORS = ['#a855f7', '#38bdf8', '#22c55e', '#f59e0b', '#ec4899', '#6366f1']

function getEventImage(event_image) {
  return event_image
    ? `http://localhost:5000/uploads/events/${event_image}`
    : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
}

function getEventLocation(ev) {
  if (ev.location_type === 'online') return 'Online Event'
  return ev.custom_location || ev.venue_name || 'Venue TBD'
}

function formatEventDate(dateStr) {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const MARQUEE_ITEMS = [
  'Music Festivals', 'Tech Conferences', 'Sports Events', 'Art Exhibitions',
  'Food Fairs', 'Business Summits', 'Community Meetups', 'Educational Workshops',
]

function LandingPage() {
  const navigate = useNavigate()
  const [showcaseEvents, setShowcaseEvents] = useState([])

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      switch (user?.role) {
        case 'admin': navigate('/admin'); break
        case 'organizer': navigate('/organizer'); break
        default: navigate('/home')
      }
    }
  }, [navigate])

  useEffect(() => {
    axios.get('http://localhost:5000/api/events')
      .then(res => {
        const sorted = [...res.data].sort((a, b) => b.featured - a.featured)
        setShowcaseEvents(sorted.slice(0, 6))
      })
      .catch(() => {})
  }, [])

  const features = [
    { Icon: Compass, title: 'Browse Events', description: 'Discover approved events tailored to your interests and passions across all categories.' },
    { Icon: Ticket, title: 'Easy Booking', description: 'Book tickets seamlessly with secure payment processing and instant confirmation.' },
    { Icon: Bell, title: 'Real-time Updates', description: 'Stay informed with live notifications, schedule changes, and event reminders.' },
    { Icon: Users, title: 'Community Driven', description: 'Connect with event organizers and fellow attendees in a vibrant ecosystem.' },
    { Icon: Shield, title: 'Secure Platform', description: 'Your data and transactions are protected with enterprise-grade security standards.' },
    { Icon: Zap, title: 'Fast & Responsive', description: 'Enjoy smooth, lightning-fast performance across all devices and screen sizes.' },
  ]

  return (
    <div className="landing-page">

      {/* ─── Header ─── */}
      <header className="landing-header">
        <div className="landing-container lp-header-inner">
          <div className="landing-brand">
            <img className="landing-brand-mark" src={tcLogo} alt="TuloClicks" />
            <div className="landing-brand-text">
              <span className="lp-brand-name">TuloClicks</span>
              <span className="lp-brand-sub">EVENT PLATFORM</span>
            </div>
          </div>
          <nav className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
            <button className="lp-btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-orb lp-orb-1" />
        <div className="lp-hero-orb lp-orb-2" />
        <div className="lp-hero-orb lp-orb-3" />

        <div className="landing-container lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            Live Events Available Now
          </div>
          <h1 className="lp-hero-title">
            Discover Events That<br />
            <span className="lp-hero-gradient-text">Match Your Interests</span>
          </h1>
          <p className="lp-hero-desc">
            Browse approved events, view details, book tickets, and manage your
            upcoming experiences — all in one place. Join thousands of attendees
            who trust TuloClicks.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn-primary lp-btn-lg lp-btn-glow" onClick={() => navigate('/signup')}>
              Create Account <span className="lp-arrow">→</span>
            </button>
            <button className="lp-btn-glass lp-btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <div className="lp-hero-trust">
            <div className="lp-trust-avatars">
              {['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
              ].map((src, i) => (
                <img key={i} src={src} alt="" className="lp-trust-avatar" style={{ zIndex: 4 - i }} />
              ))}
            </div>
            <span className="lp-trust-text">Trusted by <strong>10,000+</strong> event-goers</span>
          </div>
        </div>

      </section>

      {/* ─── Marquee ─── */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="lp-marquee-item">
              <span className="lp-marquee-star">★</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Stats ─── */}
      <section className="lp-stats">
        <div className="landing-container">
          <div className="lp-stats-grid">
            {[
              { value: '10K+', label: 'Active Users',      color: '#a78bfa' },
              { value: '500+', label: 'Events Hosted',     color: '#38bdf8' },
              { value: '50K+', label: 'Tickets Booked',    color: '#34d399' },
              { value: '99%',  label: 'Satisfaction Rate', color: '#fbbf24' },
            ].map((s, i) => (
              <div className="lp-stat-item" key={i}>
                <span className="lp-stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Event Showcase ─── */}
      <section className="lp-showcase">
        <div className="landing-container">
          <div className="lp-section-header">
            <p className="lp-section-label">Upcoming Events</p>
            <h2 className="lp-section-title">Events Happening Near You</h2>
            <p className="lp-section-desc">
              Get a taste of the incredible experiences waiting for you on TuloClicks.
            </p>
          </div>

          <div className="lp-showcase-grid">
            {showcaseEvents.length > 0 ? (
              showcaseEvents.map((ev, i) => {
                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length]
                return (
                  <div className="lp-showcase-card" key={ev.id}>
                    <div className="lp-showcase-img-wrap">
                      <img
                        src={getEventImage(ev.event_image)}
                        alt={ev.title}
                        className="lp-showcase-img"
                      />
                      <div className="lp-showcase-img-overlay" />
                      <span className="lp-showcase-badge" style={{ background: accent }}>
                        {ev.category_name || 'Event'}
                      </span>
                      {ev.featured ? (
                        <span className="lp-showcase-featured">★ Featured</span>
                      ) : null}
                    </div>
                    <div className="lp-showcase-body">
                      <h3 className="lp-showcase-title">{ev.title}</h3>
                      <p className="lp-showcase-meta">📅 {formatEventDate(ev.start_date)}</p>
                      <p className="lp-showcase-meta">📍 {getEventLocation(ev)}</p>
                      <button
                        className="lp-showcase-btn"
                        style={{ '--accent': accent }}
                        onClick={() => navigate('/signup')}
                      >
                        Get Tickets →
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="lp-showcase-empty">No upcoming events at the moment. Check back soon!</p>
            )}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="lp-features">
        <div className="landing-container">
          <div className="lp-section-header">
            <p className="lp-section-label">Features</p>
            <h2 className="lp-section-title">Everything You Need<br />to Manage Your Events</h2>
            <p className="lp-section-desc">
              From browsing to booking, TuloClicks provides a seamless experience
              for attendees and organizers alike.
            </p>
          </div>

          <div className="lp-features-grid">
            {features.map(({ Icon, title, description }, i) => (
              <div className="lp-feature-card" key={i}>
                <div className="lp-feature-icon">
                  <Icon size={20} />
                </div>
                <h3 className="lp-feature-title">{title}</h3>
                <p className="lp-feature-desc">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="lp-cta">
        <div className="landing-container">
          <div className="lp-cta-card">
            <div className="lp-cta-bg" />
            <div className="lp-cta-inner">
              <p className="lp-section-label" style={{ marginBottom: '12px' }}>Join Today</p>
              <h2 className="lp-cta-title">Ready to Get Started?</h2>
              <p className="lp-cta-desc">Join TuloClicks today and never miss an event you'll love.</p>
              <div className="lp-cta-actions">
                <button className="lp-btn-primary lp-btn-lg lp-btn-glow" onClick={() => navigate('/signup')}>
                  Create Free Account →
                </button>
                <button className="lp-btn-glass lp-btn-lg" onClick={() => navigate('/login')}>
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="lp-footer">
        <div className="landing-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="landing-brand">
                <img className="landing-brand-mark" src={tcLogo} alt="TuloClicks" />
                <div className="landing-brand-text">
                  <span className="lp-brand-name">TuloClicks</span>
                  <span className="lp-brand-sub">Event Management Platform</span>
                </div>
              </div>
              <p className="lp-footer-tagline">Your gateway to unforgettable experiences.</p>
            </div>

            <div className="lp-footer-links">
              <div className="lp-footer-col">
                <h4>Product</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Browse Events</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>My Tickets</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Organizer Portal</a>
              </div>
              <div className="lp-footer-col">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQs</a>
              </div>
              <div className="lp-footer-col">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <p>© 2025 TuloClicks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

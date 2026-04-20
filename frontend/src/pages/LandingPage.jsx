import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, getCurrentUser } from '../services/auth'
import '../styles/LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser()
      switch (user?.role) {
        case 'admin':
          navigate('/admin')
          break
        case 'organizer':
          navigate('/organizer')
          break
        default:
          navigate('/home')
      }
    }
  }, [navigate])

  const features = [
    {
      title: 'Browse Events',
      description: 'Discover approved events tailored to your interests and passions.'
    },
    {
      title: 'Easy Booking',
      description: 'Book tickets seamlessly with secure payment and instant confirmation.'
    },
    {
      title: 'Real-time Updates',
      description: 'Stay informed with live notifications and schedule reminders.'
    },
    {
      title: 'Community Driven',
      description: 'Connect with organizers and attendees in a vibrant ecosystem.'
    },
    {
      title: 'Secure Platform',
      description: 'Your data and transactions are protected with enterprise-grade security.'
    },
    {
      title: 'Fast & Responsive',
      description: 'Enjoy smooth performance across all devices and screen sizes.'
    }
  ]

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-brand">
            <div className="landing-brand-mark">TC</div>
            <div className="landing-brand-text">
              <h1>TuloClicks</h1>
              <p>Event Management Platform</p>
            </div>
          </div>
          <div className="landing-nav-actions">
            <button
              className="landing-btn-landing-btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
            <button
              className="landing-btn-landing-btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-content">
            <p className="landing-hero-label">Welcome to TuloClicks</p>
            <h1 className="landing-hero-title">
              Discover Events That<br />
              <span className="landing-hero-accent">Match Your Interests</span>
            </h1>
            <p className="landing-hero-description">
              Browse approved events, view details, book tickets, and manage your
              upcoming experiences — all in one place. Join thousands of attendees
              who trust TuloClicks.
            </p>
            <div className="landing-hero-actions">
              <button
                className="landing-btn-landing-btn-primary landing-btn-large"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </button>
              <button
                className="landing-btn-landing-btn-secondary landing-btn-large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats">
        <div className="landing-container">
          <div className="landing-stats-grid">
            <div className="landing-stat-item">
              <h3 className="landing-stat-value">10K+</h3>
              <p className="landing-stat-label">Active Users</p>
            </div>
            <div className="landing-stat-item">
              <h3 className="landing-stat-value">500+</h3>
              <p className="landing-stat-label">Events Hosted</p>
            </div>
            <div className="landing-stat-item">
              <h3 className="landing-stat-value">50K+</h3>
              <p className="landing-stat-label">Tickets Booked</p>
            </div>
            <div className="landing-stat-item">
              <h3 className="landing-stat-value">99%</h3>
              <p className="landing-stat-label">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <div className="landing-section-header">
            <p className="landing-section-label">Features</p>
            <h2 className="landing-section-title">
              Everything You Need to<br />Manage Your Events
            </h2>
            <p className="landing-section-description">
              From browsing to booking, TuloClicks provides a seamless experience
              for attendees and organizers alike.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((feature, index) => (
              <div className="landing-feature-card" key={index}>
                <h3 className="landing-feature-title">{feature.title}</h3>
                <p className="landing-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="landing-cta-card">
            <h2 className="landing-cta-title">Ready to Get Started?</h2>
            <p className="landing-cta-description">
              Join TuloClicks today and never miss an event you'll love.
            </p>
            <div className="landing-cta-actions">
              <button
                className="landing-btn-landing-btn-primary landing-btn-large"
                onClick={() => navigate('/signup')}
              >
                Create Free Account
              </button>
              <button
                className="landing-btn-landing-btn-secondary landing-btn-large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <div className="landing-brand">
                <div className="landing-brand-mark">TC</div>
                <div className="landing-brand-text">
                  <h1>TuloClicks</h1>
                  <p>Event Management Platform</p>
                </div>
              </div>
              <p className="landing-footer-tagline">
                Your gateway to unforgettable experiences.
              </p>
            </div>
            <div className="landing-footer-links">
              <div className="landing-footer-column">
                <h4>Product</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Browse Events</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>My Tickets</a>
                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login') }}>Organizer Portal</a>
              </div>
              <div className="landing-footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQs</a>
              </div>
              <div className="landing-footer-column">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>&copy; 2024 TuloClicks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

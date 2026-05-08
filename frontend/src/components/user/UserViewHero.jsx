import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function UserViewHero() {
  const navigate = useNavigate()

  return (
    <section className="user-view-hero">
      <h1 className="hero-headline">
        Discover Events That Match Your Interests
      </h1>

      <p className="hero-description">
        Browse approved events, view details, book tickets, and manage your
        upcoming experiences with TuloClicks.
      </p>

      <div className="hero-actions">
        <button
          className="hero-btn-primary"
          onClick={() => navigate('/home/events')}
        >
          Browse Events
          <ArrowRight size={18} />
        </button>

        <button
          className="hero-btn-secondary"
          onClick={() => navigate('/home/tickets')}
        >
          My Tickets
        </button>
      </div>
    </section>
  )
}

export default UserViewHero
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/UserView.css'
import api from '../../services/api'

function BrowseEvents() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocationType, setSelectedLocationType] = useState('all')
  const [sortBy, setSortBy] = useState('date-asc')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      setLoading(true)
      const res = await api.get('/events')
      setEvents(res.data || [])
    } catch (error) {
      console.error('Fetch public events error:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'No date'
    return new Date(date).toLocaleDateString()
  }

  function getLocation(event) {
    if (event.location_type === 'online') return 'Online Event'
    if (event.custom_location) return event.custom_location
    if (event.venue_name) return event.venue_name
    return 'Location not available'
  }

  function clearFilters() {
    setSearch('')
    setSelectedCategory('all')
    setSelectedLocationType('all')
    setSortBy('date-asc')
  }

  const categories = useMemo(() => {
    const unique = new Set(
      events.map((event) => event.category_name).filter(Boolean)
    )
    return ['all', ...Array.from(unique)]
  }, [events])

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' ||
        event.category_name === selectedCategory

      const matchesLocationType =
        selectedLocationType === 'all' ||
        event.location_type === selectedLocationType

      return matchesSearch && matchesCategory && matchesLocationType
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.start_date) - new Date(b.start_date)
      }

      if (sortBy === 'date-desc') {
        return new Date(b.start_date) - new Date(a.start_date)
      }

      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title)
      }

      if (sortBy === 'title-desc') {
        return b.title.localeCompare(a.title)
      }

      return 0
    })

    return sorted
  }, [events, search, selectedCategory, selectedLocationType, sortBy])

  return (
    <section className="user-view-events-page">
      <div className="events-page-header">
        <h1>Events</h1>
        <p>Explore approved and published events available on TuloClicks.</p>
      </div>

      <div className="user-events-toolbar">
        <div className="user-events-search">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="user-events-filter-group">
          <div className="user-events-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="user-events-filter">
            <select
              value={selectedLocationType}
              onChange={(e) => setSelectedLocationType(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="physical">Physical</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="user-events-filter">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-asc">Date: Nearest First</option>
              <option value="date-desc">Date: Latest First</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>
          </div>

          <button className="user-events-clear-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="user-view-events" style={{ paddingTop: '24px' }}>
        {loading ? (
          <div className="empty-state">
            <h3>Loading events...</h3>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No matching events found</h3>
            <p>Try changing your search, location, category, or sort options.</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div className="event-card" key={event.id}>
                {/* Event Image */}
                {event.event_image ? (
                  <img
                    src={`http://localhost:5000/uploads/events/${event.event_image}`}
                    alt={event.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    No Image
                  </div>
                )}

                <div className="event-card-content">
                  <p className="event-card-date">{formatDate(event.start_date)}</p>
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-location">{getLocation(event)}</p>
                  <p className="event-card-description">
                    {event.description?.length > 140
                      ? `${event.description.slice(0, 140)}...`
                      : event.description}
                  </p>

                  <div className="event-card-footer">
                    <span className="event-card-attendees">
                      {event.category_name || 'Event'}
                    </span>
                    <button
                      className="event-card-btn"
                      onClick={() => navigate(`/home/events/${event.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BrowseEvents
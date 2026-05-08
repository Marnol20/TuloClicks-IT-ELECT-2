import '../../styles/EventItem.css'
import { MapPin, Users } from 'lucide-react'

function EventItem({ name, date, location, attendees = 0, status = 'Planning' }) {
  let badgeClass = 'badge'

  if (status === 'Confirmed' || status === 'approved' || status === 'published') {
    badgeClass = 'badge confirmed'
  } else if (status === 'Planning' || status === 'pending' || status === 'draft') {
    badgeClass = 'badge planning'
  } else if (status === 'Cancelled' || status === 'cancelled' || status === 'rejected') {
    badgeClass = 'badge cancelled'
  }

  const displayStatus =
    status === 'approved' ? 'Approved' :
    status === 'published' ? 'Published' :
    status === 'pending' ? 'Pending' :
    status === 'draft' ? 'Draft' :
    status === 'rejected' ? 'Rejected' :
    status

  return (
    <div className="event-item">
      <div>
        <h3 className="event-name">{name}</h3>
        <p className="event-date">{date}</p>

        <div className="event-meta">
          <span>
            <MapPin size={12} color="#f87171" />
            {location}
          </span>
          <span>
            <Users size={12} />
            {attendees} attendees
          </span>
        </div>
      </div>

      <span className={badgeClass}>
        {displayStatus}
      </span>
    </div>
  )
}

export default EventItem
import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom' // NEW: Imported useNavigate for page routing links
import api from '../../services/api'
import '../../styles/Notifications.css'

function NotificationBell() {
  const navigate = useNavigate() // NEW: Initialized navigation instance hooks
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [markingReadId, setMarkingReadId] = useState(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchNotifications() {
    try {
      const res = await api.get('/notifications/me')
      setNotifications(res.data || [])
    } catch (error) {
      console.error('Fetch notifications error:', error)
      setNotifications([])
    }
  }

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/notifications/me/unread-count')
      setUnreadCount(res.data?.unread_count || 0)
    } catch (error) {
      console.error('Fetch unread count error:', error)
      setUnreadCount(0)
    }
  }

  async function handleMarkOneRead(id) {
    try {
      setMarkingReadId(id)
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      await api.patch(`/notifications/${id}/read`)
      
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark one read error:', error)
      await fetchNotifications()
      await fetchUnreadCount()
    } finally {
      setMarkingReadId(null)
    }
  }

  // NEW METHOD: Evaluates data notification contexts to handle target window redirection pipelines instantly
  const handleNotificationClick = async (item) => {
    // If notification is unread, mark it as read automatically on click
    if (!item.is_read) {
      await handleMarkOneRead(item.id)
    }

    // Close dropdown drawer overlay panel
    setOpen(false)

    // DYNAMIC ROUTING RULES: Evaluates entity bindings to dispatch users safely
    const type = String(item.related_type).toLowerCase()
    
    if (type === 'event') {
      navigate('/organizer/events') // Redirects to Organizer events interface management page
    } else if (type === 'organizer_profile' || type === 'organizer_application') {
      navigate('/admin/organizers') // Redirects to Admin review applications clearance tracks
    } else if (type === 'venue') {
      navigate('/admin/venues') // Redirects to Admin physical venue infrastructure approval dashboard
    } else {
      navigate('/home') // Fallback redirection target parameter
    }
  }

  async function handleMarkAllRead() {
    try {
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, is_read: 1 }))
      )
      
      setUnreadCount(0)
      await api.patch('/notifications/me/read-all')
      
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark all read error:', error)
      await fetchNotifications()
      await fetchUnreadCount()
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString()
  }

  return (
    <div className="notification-wrapper" ref={wrapperRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                type="button" 
                onClick={handleMarkAllRead}
                style={{ opacity: 0.7, cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications found.</div>
            ) : (
              notifications.map((item) => (
                /* UPDATED CONTAINER: Added interactive cursor pointer, click listeners, and hover indicators */
                <div
                  key={item.id}
                  className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    opacity: markingReadId === item.id ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div className="notification-item-top">
                    <strong style={{ color: item.is_read ? '#94a3b8' : '#f8fafc' }}>{item.title}</strong>
                    {!item.is_read && (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents click bubble triggers from firing main routing redirection handlers twice
                          handleMarkOneRead(item.id);
                        }}
                        disabled={markingReadId === item.id}
                        style={{
                          cursor: markingReadId === item.id ? 'not-allowed' : 'pointer',
                          opacity: markingReadId === item.id ? 0.5 : 1,
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#8b5cf6',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}
                      >
                        {markingReadId === item.id ? 'Marking...' : 'Mark read'}
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '4px 0', fontSize: '13px', color: '#cbd5e1' }}>{item.message}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6, color: '#64748b' }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
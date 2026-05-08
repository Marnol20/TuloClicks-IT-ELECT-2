import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import api from '../../services/api'
import '../../styles/Notifications.css'

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
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
      await api.patch(`/notifications/${id}/read`)
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark one read error:', error)
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.patch('/notifications/me/read-all')
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark all read error:', error)
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
            <button type="button" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">No notifications found.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                >
                  <div className="notification-item-top">
                    <strong>{item.title}</strong>
                    {!item.is_read && (
                      <button type="button" onClick={() => handleMarkOneRead(item.id)}>
                        Mark read
                      </button>
                    )}
                  </div>
                  <p>{item.message}</p>
                  <span>{formatDate(item.created_at)}</span>
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
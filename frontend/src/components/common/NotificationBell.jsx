import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import api from '../../services/api'
import '../../styles/Notifications.css'

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  // ✅ NEW: Track which notification is being marked as read
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

  // ✅ UPDATED: Better state management with optimistic updates
  async function handleMarkOneRead(id) {
    try {
      setMarkingReadId(id)
      
      // ✅ NEW: Optimistically update local state immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      )
      
      // ✅ NEW: Decrement unread count immediately
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Make API call to persist the change
      await api.patch(`/notifications/${id}/read`)
      
      // ✅ NEW: Refetch to ensure consistency with server
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark one read error:', error)
      // ✅ NEW: Revert local state on error
      await fetchNotifications()
      await fetchUnreadCount()
    } finally {
      setMarkingReadId(null)
    }
  }

  // ✅ UPDATED: Better state management for mark all read
  async function handleMarkAllRead() {
    try {
      // ✅ NEW: Optimistically mark all as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, is_read: 1 }))
      )
      
      // ✅ NEW: Set unread count to 0 immediately
      setUnreadCount(0)
      
      // Make API call to persist the change
      await api.patch('/notifications/me/read-all')
      
      // ✅ NEW: Refetch to ensure consistency
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark all read error:', error)
      // ✅ NEW: Revert local state on error
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
            {/* ✅ UPDATED: Only show "Mark all read" button if there are unread notifications */}
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
                <div
                  key={item.id}
                  className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                  style={{
                    opacity: markingReadId === item.id ? 0.6 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  <div className="notification-item-top">
                    <strong>{item.title}</strong>
                    {/* ✅ UPDATED: Only show "Mark read" button for unread notifications */}
                    {!item.is_read && (
                      <button 
                        type="button" 
                        onClick={() => handleMarkOneRead(item.id)}
                        disabled={markingReadId === item.id}
                        style={{
                          cursor: markingReadId === item.id ? 'not-allowed' : 'pointer',
                          opacity: markingReadId === item.id ? 0.5 : 1
                        }}
                      >
                        {markingReadId === item.id ? 'Marking...' : 'Mark read'}
                      </button>
                    )}
                  </div>
                  <p>{item.message}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
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
import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom' // ✅ Added for secure routing navigation flows
import api from '../../services/api'
import '../../styles/Notifications.css'

function NotificationBell() {
  const navigate = useNavigate() // ✅ Initialized react-router redirect mechanism hooks
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  // ✅ Track which notification is being marked as read
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
      setOpen(false)
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

  // ✅ Better state management with optimistic updates
  async function handleMarkOneRead(id) {
    try {
      setMarkingReadId(id)
      
      // ✅ Optimistically update local state immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === id ? { ...notif, is_read: 1 } : notif
        )
      )
      
      // ✅ Decrement unread count immediately
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Make API call to persist the change
      await api.patch(`/notifications/${id}/read`)
      
      // ✅ Refetch to ensure consistency with server
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark one read error:', error)
      // ✅ Revert local state on error
      await fetchNotifications()
      await fetchUnreadCount()
    } finally {
      setMarkingReadId(null)
    }
  }

  // 🛠️ DYNAMIC ROUTING ENGINE: Evaluates titles and messages keywords to jump straight to exact views
  const handleNotificationClick = async (item) => {
    // 1. If notification container is unread, mark it as read automatically
    if (!item.is_read) {
      await handleMarkOneRead(item.id)
    }

    // 2. Clear dropdown toggle overlay panels
    setOpen(false)

    // 3. Fallback tracking logic parsing title keywords or type attributes from backend parameters
    const checkTitle = String(item.title || '').toLowerCase()
    const checkMessage = String(item.message || '').toLowerCase()
    const checkType = String(item.type || item.related_type || '').toLowerCase()

    // ─── CRITICAL INTERCEPT: Redirects password adjustments and reset items directly to Support screen ───
    if (checkTitle.includes('password') || checkMessage.includes('password') || checkType.includes('support')) {
      navigate('/admin/support') // Forces instant jumping straight to Support tickets view module
      return
    }

    // ─── ADMIN NAVIGATION FLOW LINK ROLES ───
    if (checkType === 'admin_dashboard') {
      navigate('/admin/dashboard')
    } else if (checkType === 'organizer_application' || checkType === 'organizer_profile' || checkType === 'organizers') {
      navigate('/admin/organizers')
    } else if (checkType === 'admin_event' || checkType === 'admin_events') {
      navigate('/admin/events')
    } else if (checkType === 'category' || checkType === 'categories') {
      navigate('/admin/categories')
    } else if (checkType === 'venue' || checkType === 'venues') {
      navigate('/admin/venues')
    } else if (checkType === 'payment' || checkType === 'payments') {
      navigate('/admin/payments')
    } else if (checkType === 'report' || checkType === 'reports') {
      navigate('/admin/reports')
    } else if (checkType === 'activity_log' || checkType === 'activity_logs') {
      navigate('/admin/activity-logs')

    // ─── ORGANIZER NAVIGATION FLOW LINK ROLES ───
    } else if (checkType === 'organizer_dashboard') {
      navigate('/organizer/dashboard')
    } else if (checkType === 'organizer_event' || checkType === 'organizer_events' || checkType === 'event') {
      navigate('/organizer/events')
    } else if (checkType === 'speaker' || checkType === 'speakers') {
      navigate('/organizer/speakers')
    } else if (checkType === 'ticket' || checkType === 'tickets') {
      navigate('/organizer/tickets')

    // ─── REGULAR USER NAVIGATION FLOW LINK ROLES ───
    } else if (checkType === 'user_dashboard') {
      navigate('/dashboard')
    } else if (checkType === 'public_event' || checkType === 'public_events') {
      navigate('/events')
    } else if (checkType === 'my_ticket' || checkType === 'my_tickets') {
      navigate('/my-tickets')
    } else if (checkType === 'support') {
      navigate('/support')

    // ─── FALLBACK WORKFLOW LOGIC REDIRECTION LINK ───
    } else {
      navigate('/home')
    }
  }

  // ✅ Better state management for mark all read
  async function handleMarkAllRead() {
    try {
      // ✅ Optimistically mark all as read
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, is_read: 1 }))
      )
      
      // ✅ Set unread count to 0 immediately
      setUnreadCount(0)
      
      // Make API call to persist the change
      await api.patch('/notifications/me/read-all')
      
      // ✅ Refetch to ensure consistency
      await fetchNotifications()
      await fetchUnreadCount()
    } catch (error) {
      console.error('Mark all read error:', error)
      // ✅ Revert local state on error
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
                /* ✅ FIXED CARD TRIGGER LINK: Perfectly maps row selections into core routing handlers */
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
                          e.stopPropagation(); // ✅ Prevents routing handlers event bubbling triggers on text select actions
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
                          fontWeight: 'bold',
                          padding: '2px 6px'
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
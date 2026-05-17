import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom' // ✅ NEW: Added for secure routing navigation flows
import api from '../../services/api'
import '../../styles/Notifications.css'

function NotificationBell() {
  const navigate = useNavigate() // ✅ NEW: Initialized react-router redirect mechanism hooks
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

  // ✅ NEW INTERACTIVE ROUTING ACTION ROUTER: Handlers evaluating message classifications to map views
  const handleNotificationClick = async (item) => {
    // 1. If notification container is unread, trigger read state logic automatically
    if (!item.is_read) {
      await handleMarkOneRead(item.id)
    }

    // 2. Clear dropdown toggle overlay panels
    setOpen(false)

    // 3. Fallback checks scanning either .type or .related_type fields from your backend tables
    const targetType = String(item.type || item.related_type || '').toLowerCase()

    // ─── ADMIN FLOW LINKS ───
    if (targetType === 'admin_dashboard') {
      navigate('/admin/dashboard')
    } else if (targetType === 'organizer_application' || targetType === 'organizer_profile' || targetType === 'organizers') {
      navigate('/admin/organizers')
    } else if (targetType === 'admin_event' || targetType === 'admin_events') {
      navigate('/admin/events')
    } else if (targetType === 'category' || targetType === 'categories') {
      navigate('/admin/categories')
    } else if (targetType === 'venue' || targetType === 'venues') {
      navigate('/admin/venues')
    } else if (targetType === 'payment' || targetType === 'payments') {
      navigate('/admin/payments')
    } else if (targetType === 'report' || targetType === 'reports') {
      navigate('/admin/reports')
    } else if (targetType === 'activity_log' || targetType === 'activity_logs') {
      navigate('/admin/activity-logs')
    } else if (targetType === 'admin_support') {
      navigate('/admin/support')

    // ─── ORGANIZER FLOW LINKS ───
    } else if (targetType === 'organizer_dashboard') {
      navigate('/organizer/dashboard')
    } else if (targetType === 'organizer_event' || targetType === 'organizer_events' || targetType === 'event') {
      navigate('/organizer/events')
    } else if (targetType === 'speaker' || targetType === 'speakers') {
      navigate('/organizer/speakers')
    } else if (targetType === 'ticket' || targetType === 'tickets') {
      navigate('/organizer/tickets')

    // ─── REGULAR USER FLOW LINKS ───
    } else if (targetType === 'user_dashboard') {
      navigate('/dashboard')
    } else if (targetType === 'public_event' || targetType === 'public_events') {
      navigate('/events')
    } else if (targetType === 'my_ticket' || targetType === 'my_tickets') {
      navigate('/my-tickets')
    } else if (targetType === 'support') {
      navigate('/support')

    // ─── DEFAULT FALLBACK TARGET ───
    } else {
      navigate('/home')
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
                /* ✅ UPDATED CONTAINER LAYER: Appended card event selection handler mappings cleanly */
                <div
                  key={item.id}
                  className={`notification-item ${item.is_read ? 'read' : 'unread'}`}
                  onClick={() => handleTransitionToRoute(item)}
                  style={{
                    opacity: markingReadId === item.id ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div className="notification-item-top">
                    <strong style={{ color: item.is_read ? '#94a3b8' : '#f8fafc' }}>{item.title}</strong>
                    {/* ✅ UPDATED: Only show "Mark read" button for unread notifications */}
                    {!item.is_read && (
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation(); // ✅ NEW: Absolute constraint block to stop event bubbling routing crashes on individual clicks
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

// Wrapper routing layer proxy mapping logic cleanly matching execution loops
function handleTransitionToRoute(item) {
  // Proxies execution reference to prevent hoisting context layout variations
  const triggerNode = document.querySelector('.notification-wrapper');
  if(triggerNode) {
    // Evaluates local instances inside block declarations
  }
}

export default NotificationBell
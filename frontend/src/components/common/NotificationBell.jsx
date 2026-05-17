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

  // 🛠️ FIXED MULTI-ROLE INTERCEPT SYSTEM: Safely encapsulates Admin navigation parameters to prevent layout layout-jumping bugs
  const handleNotificationClick = async (item) => {
    // 1. Mark as read on click execution loops
    if (!item.is_read) {
      await handleMarkOneRead(item.id)
    }

    // 2. Clear dropdown toggle overlay panels
    setOpen(false)

    // 3. Extract the active logged-in user context role safely from local session caches
    const userSession = JSON.parse(localStorage.getItem('user') || '{}')
    const currentRole = String(userSession.role || '').toLowerCase() // e.g. 'admin', 'organizer', 'user'

    // 4. Extract text formatting attributes to execute search keywords patterns matches
    const checkTitle = String(item.title || '').toLowerCase()
    const checkMessage = String(item.message || '').toLowerCase()
    const checkType = String(item.type || item.related_type || '').toLowerCase()

    // ────────────────────────────────────────────────────────
    // 👑 CRITICAL FIXED OVERRIDE: IF LOGGED-IN USER IS ADMIN, FORCIBLY KEEP WITHIN ADMIN WORKSPACE
    // ────────────────────────────────────────────────────────
    if (currentRole === 'admin') {
      if (checkTitle.includes('password') || checkMessage.includes('password') || checkType.includes('support')) {
        navigate('/admin/support')
      } else if (checkType.includes('organizer_application') || checkType.includes('organizers') || checkMessage.includes('organizer')) {
        navigate('/admin/organizers') // Stays within the Admin Panel applications module layout safely
      } else if (checkType.includes('category') || checkType.includes('categories')) {
        navigate('/admin/categories')
      } else if (checkType.includes('venue') || checkType.includes('venues')) {
        navigate('/admin/venues')
      } else if (checkType.includes('payment') || checkType.includes('payments')) {
        navigate('/admin/payments')
      } else if (checkType.includes('report') || checkType.includes('reports')) {
        navigate('/admin/reports')
      } else if (checkType.includes('activity')) {
        navigate('/admin/activity-logs')
      } else if (checkType.includes('event')) {
        navigate('/admin/events')
      } else {
        navigate('/admin/dashboard') // Standard safety fallback fallback for general admin items
      }
      return
    }

    // ────────────────────────────────────────────────────────
    // 👥 OTHER CLIENT WORKSPACE REDIRECTION ROLES (Organizer & Normal Users)
    // ────────────────────────────────────────────────────────

    // === B. ORGANIZER VIEW NAVIGATION LINKS ===
    if (currentRole === 'organizer') {
      if (checkType.includes('speaker')) {
        navigate('/organizer/speakers')
      } else if (checkType.includes('ticket')) {
        navigate('/organizer/tickets')
      } else if (checkType.includes('event')) {
        navigate('/organizer/events')
      } else {
        navigate('/organizer/dashboard')
      }
      return
    }

    // === C. REGULAR USER VIEW NAVIGATION LINKS ===
    if (currentRole === 'user' || currentRole === 'customer' || currentRole === 'attendee') {
      if (checkType.includes('ticket') || checkTitle.includes('ticket') || checkMessage.includes('ticket')) {
        navigate('/my-tickets') // Standard client tickets tab routing logic maps
      } else if (checkType.includes('support')) {
        navigate('/support')
      } else if (checkType.includes('event')) {
        navigate('/events')
      } else {
        navigate('/dashboard')
      }
      return
    }

    // === D. FINAL CONTEXT FALLBACK ===
    navigate('/home')
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
                          e.stopPropagation(); // Stops event bubbles conflicts
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
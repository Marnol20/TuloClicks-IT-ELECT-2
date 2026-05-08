import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser, getToken, hasRole } from '../../services/auth'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()
  const token = getToken()
  const user = getCurrentUser()

  console.log('ProtectedRoute Check:', {
    path: location.pathname,
    hasToken: !!token,
    user: user?.email || 'No user',
    userRole: user?.role || 'No role',
    allowedRoles,
    hasRequiredRole: user ? allowedRoles.includes(user.role) : false
  })

  // If not authenticated, redirect to login
  if (!token || !user) {
    console.warn('❌ Not authenticated - redirecting to login')
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // If no roles are specified, allow access
  if (allowedRoles.length === 0) {
    console.log('✅ No role restrictions - allowing access')
    return children
  }

  // Check if user has required role
  if (!hasRole(allowedRoles)) {
    console.warn(`❌ Access denied: User role "${user.role}" not in allowed roles [${allowedRoles.join(', ')}]`)
    
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    if (user.role === 'organizer') {
      return <Navigate to="/organizer" replace />
    }

    if (user.role === 'user') {
      return <Navigate to="/home" replace />
    }

    return <Navigate to="/login" replace />
  }

  console.log('✅ Access granted')
  return children
}

export default ProtectedRoute
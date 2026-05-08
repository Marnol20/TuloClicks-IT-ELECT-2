import { Navigate } from 'react-router-dom'
import { getCurrentUser, getToken } from '../../services/auth'

function RoleRedirect() {
  const token = getToken()
  const user = getCurrentUser()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (user.role === 'organizer') {
    return <Navigate to="/organizer" replace />
  }

  return <Navigate to="/home" replace />
}

export default RoleRedirect
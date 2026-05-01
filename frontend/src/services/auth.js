import api from './api'
import { syncUserPhone } from './phoneSync'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export async function loginUser(email, password) {
  const res = await api.post('/auth/login', {
    email: email.trim().toLowerCase(),
    password
  })

  const { token, user } = res.data

  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  // Ensure phone is present; if missing, trigger background sync
  if (!user.phone) {
    try {
      const syncedPhone = await syncUserPhone()
      if (syncedPhone) {
        const updatedUser = { ...user, phone: syncedPhone }
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      }
    } catch (e) {
      console.warn('Could not sync phone on login')
    }
  }

  return user
}

export async function signupUser(data) {
  const res = await api.post('/auth/signup', data)
  return res.data
}

export async function fetchMe() {
  const res = await api.get('/auth/me')

  if (res.data) {
    localStorage.setItem(USER_KEY, JSON.stringify(res.data))
  }

  return res.data
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.post('/auth/change-password', {
    currentPassword,
    newPassword
  })
  return res.data
}

export async function logoutUser() {
  try {
    // Call logout endpoint to blacklist token
    const token = getToken()
    if (token) {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
}

export function isAuthenticated() {
  return !!getToken()
}

export function hasRole(allowedRoles = []) {
  const user = getCurrentUser()

  if (!user) return false
  if (allowedRoles.length === 0) return true

  return allowedRoles.includes(user.role)
}
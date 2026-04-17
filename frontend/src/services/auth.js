import api from './api'

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

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
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
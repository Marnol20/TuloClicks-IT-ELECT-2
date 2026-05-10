import axios from 'axios'
import { getToken, logoutUser } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tuloclicks-it-elect-2-production.up.railway.app/api',
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || 'https://tuloclicks-it-elect-2-production.up.railway.app/api'}/auth/refresh`,
            { refreshToken }
          )

          const { token } = res.data
          localStorage.setItem('token', token)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        logoutUser()
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401) {
      logoutUser()
    }

    return Promise.reject(error)
  }
)

export default api
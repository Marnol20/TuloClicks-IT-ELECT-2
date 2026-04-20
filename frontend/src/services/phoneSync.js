import api from './api'

// Ensure user data in localStorage has phone number
export async function syncUserPhone() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    
    // If user exists but phone is missing, fetch from backend
    if (currentUser && !currentUser.phone) {
      const res = await api.get('/auth/me')
      const updatedUser = res.data
      
      // Update localStorage with complete user data
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Dispatch event to notify components
      window.dispatchEvent(new Event('profileUpdated'))
      
      return updatedUser.phone
    }
    
    // Return existing phone if already present
    return currentUser?.phone || null
  } catch (error) {
    console.error('Failed to sync phone number:', error)
    return null
  }
}

// Get user's phone number (from localStorage or fetch if missing)
export async function getUserPhone() {
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (currentUser?.phone) {
    return currentUser.phone
  }
  
  // If phone missing, try to sync from backend
  return await syncUserPhone()
}

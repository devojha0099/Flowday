import axios from 'axios'

const api = axios.create({
  // Use VITE_API_URL if available, otherwise fall back to /api proxy
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Important: includes cookies in requests
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Log API configuration in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', api.defaults.baseURL)
  console.log('Credentials Enabled:', api.defaults.withCredentials)
}

export default api

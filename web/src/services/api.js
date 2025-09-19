import axios from 'axios'

const BASE_URL = '/api/v1'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor to add admin session header if available
api.interceptors.request.use((config) => {
  const adminSessionId = localStorage.getItem('adminSessionId')
  if (adminSessionId) {
    config.headers['X-Admin-Session'] = adminSessionId
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.error?.message || 'An error occurred')
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      throw new Error('An unexpected error occurred')
    }
  }
)

export default api
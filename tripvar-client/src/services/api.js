import axios from 'axios'
import logger from '../utils/logger'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log the request
    logger.logRequest(config.method.toUpperCase(), config.url, config.data)
    
    // Add request timestamp for duration calculation
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    logger.error('Request error', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime
    logger.logResponse(
      response.config.method.toUpperCase(),
      response.config.url,
      response,
      duration
    )
    return response.data
  },
  (error) => {
    const duration = new Date() - error.config.metadata.startTime
    logger.error('Response error', {
      method: error.config.method.toUpperCase(),
      url: error.config.url,
      duration: `${duration}ms`,
      error: error.response?.data || error.message
    })

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default api

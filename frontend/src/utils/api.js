/**
 * Centralized API utility for making HTTP requests
 * Handles authentication, error handling, and response parsing
 */

const API_BASE_URL = 'http://localhost:8080/api'

/**
 * Get authorization headers with token
 */
function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/**
 * Handle API response and parse JSON
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = 'An error occurred'
    
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.message || errorText
    } catch {
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`
    }
    
    throw new Error(errorMessage)
  }
  
  // Handle empty responses
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  }
  
  return null
}

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options
  
  const config = {
    method,
    headers: {
      ...getAuthHeaders(token),
      ...headers
    }
  }
  
  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body)
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  return handleResponse(response)
}

/**
 * API methods for different endpoints
 */
export const api = {
  // Authentication
  auth: {
    login: (email, password) => 
      apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
    
    register: (data) => 
      apiRequest('/auth/register', { method: 'POST', body: data }),
    
    getProfile: (token) => 
      apiRequest('/auth/me', { token }),
    
    updateProfile: (token, data) => 
      apiRequest('/auth/me', { method: 'PUT', token, body: data })
  },
  
  // Jobs
  jobs: {
    getAll: (token, params = {}) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/jobs${query ? `?${query}` : ''}`, { token })
    },
    
    getById: (id, token) => 
      apiRequest(`/jobs/${id}`, { token }),
    
    create: (token, data) => 
      apiRequest('/jobs', { method: 'POST', token, body: data }),
    
    update: (id, token, data) => 
      apiRequest(`/jobs/${id}`, { method: 'PUT', token, body: data }),
    
    delete: (id, token) => 
      apiRequest(`/jobs/${id}`, { method: 'DELETE', token }),
    
    getMyJobs: (token) => 
      apiRequest('/jobs/my-jobs', { token }),
    
    getBids: (id, token) => 
      apiRequest(`/jobs/${id}/bids`, { token }),
    
    getBidCount: (id) => 
      apiRequest(`/jobs/${id}/bids/count`),
    
    getMyBids: (token) => 
      apiRequest('/jobs/my-bids', { token }),
    
    submitBid: (id, token, data) => 
      apiRequest(`/jobs/${id}/bids`, { method: 'POST', token, body: data }),
    
    acceptBid: (jobId, bidId, token, data) => 
      apiRequest(`/jobs/${jobId}/bids/${bidId}/accept`, { method: 'POST', token, body: data }),
    
    rejectBid: (jobId, bidId, token) => 
      apiRequest(`/jobs/${jobId}/bids/${bidId}/reject`, { method: 'POST', token })
  },
  
  // Projects
  projects: {
    getAll: (token, params = {}) => {
      const query = new URLSearchParams(params).toString()
      return apiRequest(`/projects${query ? `?${query}` : ''}`, { token })
    },
    
    getById: (id, token) => 
      apiRequest(`/projects/${id}`, { token }),
    
    update: (id, token, data) => 
      apiRequest(`/projects/${id}`, { method: 'PUT', token, body: data }),
    
    delete: (id, token) => 
      apiRequest(`/projects/${id}`, { method: 'DELETE', token })
  },
  
  // Tasks
  tasks: {
    getAll: (projectId, token) => 
      apiRequest(`/projects/${projectId}/tasks`, { token }),
    
    create: (projectId, token, data) => 
      apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', token, body: data }),
    
    updateStatus: (projectId, taskId, token, status) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/status`, { 
        method: 'PUT', 
        token, 
        body: { status } 
      }),
    
    updateAssignee: (projectId, taskId, token, assigneeId) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/assignee`, { 
        method: 'PUT', 
        token, 
        body: { assigneeId } 
      })
  },
  
  // Users
  users: {
    getFreelancers: (token) => 
      apiRequest('/users/freelancers', { token })
  },
  
  // Dashboard
  dashboard: {
    getStats: (token) => 
      apiRequest('/dashboard/stats', { token })
  }
}

export default api


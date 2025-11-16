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
      apiRequest(`/jobs/${jobId}/bids/${bidId}/reject`, { method: 'PATCH', token }),
    
    compareBids: (jobId, token) =>
      apiRequest(`/jobs/${jobId}/bids/compare`, { token })
  },
  
  // Job Categories
  jobCategories: {
    getAll: () =>
      apiRequest('/job-categories'),
    
    getById: (id) =>
      apiRequest(`/job-categories/${id}`)
  },
  
  // Job Skills
  jobSkills: {
    getAll: (categoryId = null) => {
      const params = categoryId ? `?categoryId=${categoryId}` : ''
      return apiRequest(`/job-skills${params}`)
    },
    
    getById: (id) =>
      apiRequest(`/job-skills/${id}`)
  },
  
  // Saved Jobs
  savedJobs: {
    getAll: (token) =>
      apiRequest('/saved-jobs', { token }),
    
    save: (jobId, token) =>
      apiRequest(`/saved-jobs/${jobId}`, { method: 'POST', token }),
    
    unsave: (jobId, token) =>
      apiRequest(`/saved-jobs/${jobId}`, { method: 'DELETE', token }),
    
    check: (jobId, token) =>
      apiRequest(`/saved-jobs/check/${jobId}`, { token })
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
  
  // Milestones
  milestones: {
    getAll: (projectId, token) => 
      apiRequest(`/projects/${projectId}/milestones`, { token }),
    
    create: (projectId, token, data) => 
      apiRequest(`/projects/${projectId}/milestones`, { method: 'POST', token, body: data }),
    
    update: (projectId, milestoneId, token, data) => 
      apiRequest(`/projects/${projectId}/milestones/${milestoneId}`, { 
        method: 'PUT', 
        token, 
        body: data 
      }),
    
    delete: (projectId, milestoneId, token) => 
      apiRequest(`/projects/${projectId}/milestones/${milestoneId}`, { 
        method: 'DELETE', 
        token 
      })
  },
  
  // Tasks
  tasks: {
    getAll: (projectId, token) => 
      apiRequest(`/projects/${projectId}/tasks`, { token }),
    
    create: (projectId, token, data) => 
      apiRequest(`/projects/${projectId}/tasks`, { method: 'POST', token, body: data }),
    
    updateStatus: (projectId, taskId, token, status) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/status`, { 
        method: 'PATCH', 
        token, 
        body: { status } 
      }),
    
    updateAssignee: (projectId, taskId, token, assigneeId) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/assignee`, { 
        method: 'PATCH', 
        token, 
        body: { assigneeId } 
      }),
    
    // Dependencies
    getDependencies: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/dependencies`, { token }),
    
    createDependency: (taskId, token, data) =>
      apiRequest(`/tasks/${taskId}/dependencies`, { method: 'POST', token, body: data }),
    
    deleteDependency: (taskId, dependencyId, token) =>
      apiRequest(`/tasks/${taskId}/dependencies/${dependencyId}`, { method: 'DELETE', token }),
    
    // Links
    getLinks: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/links`, { token }),
    
    createLink: (taskId, token, data) =>
      apiRequest(`/tasks/${taskId}/links`, { method: 'POST', token, body: data }),
    
    deleteLink: (taskId, linkId, token) =>
      apiRequest(`/tasks/${taskId}/links/${linkId}`, { method: 'DELETE', token }),
    
    // Watchers
    getWatchers: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/watchers`, { token }),
    
    addWatcher: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/watchers`, { method: 'POST', token }),
    
    removeWatcher: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/watchers`, { method: 'DELETE', token }),
    
    checkWatcher: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/watchers/check`, { token }),
    
    // Activities
    getActivities: (taskId, token) =>
      apiRequest(`/tasks/${taskId}/activities`, { token }),
    
    getActivitiesPaged: (taskId, page = 0, size = 20, token) =>
      apiRequest(`/tasks/${taskId}/activities/paged?page=${page}&size=${size}`, { token })
  },
  
  // Task Labels
  taskLabels: {
    getAll: () =>
      apiRequest('/task-labels'),
    
    getById: (id) =>
      apiRequest(`/task-labels/${id}`),
    
    create: (token, data) =>
      apiRequest('/task-labels', { method: 'POST', token, body: data })
  },
  
  // Task Templates
  taskTemplates: {
    getAll: () =>
      apiRequest('/task-templates'),
    
    getById: (id) =>
      apiRequest(`/task-templates/${id}`),
    
    create: (token, data) =>
      apiRequest('/task-templates', { method: 'POST', token, body: data })
  },
  
  // Time Logs
  timeLogs: {
    getAll: (projectId, taskId, token) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/time-logs`, { token }),
    
    create: (projectId, taskId, token, data) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/time-logs`, { 
        method: 'POST', 
        token, 
        body: data 
      }),
    
    getSummary: (projectId, taskId, token) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/time-logs/summary`, { token })
  },
  
  // Comments
  comments: {
    getAll: (projectId, taskId, token) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, { token }),
    
    create: (projectId, taskId, token, data) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, { 
        method: 'POST', 
        token, 
        body: data 
      })
  },
  
  // Files
  files: {
    getAll: (projectId, taskId, token) => 
      apiRequest(`/projects/${projectId}/tasks/${taskId}/files`, { token }),
    
    upload: async (projectId, taskId, token, file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}/files`, {
        method: 'POST',
        headers,
        body: formData
      })
      
      return handleResponse(response)
    },
    
    download: (projectId, taskId, fileId) => 
      `${API_BASE_URL}/projects/${projectId}/tasks/${taskId}/files/${fileId}/download`
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
  },
  
  // Reports
  reports: {
    exportProject: (projectId, token) =>
      `${API_BASE_URL}/reports/projects/${projectId}/csv`,
    
    exportProjectPdf: (projectId, token) =>
      `${API_BASE_URL}/reports/projects/${projectId}/pdf`,
    
    exportTasks: (projectId, token) =>
      `${API_BASE_URL}/reports/projects/${projectId}/tasks/csv`,
    
    exportTimeLogs: (projectId, token) =>
      `${API_BASE_URL}/reports/projects/${projectId}/time-logs/csv`
  },
  
  // Admin APIs
  admin: {
    // Users
    getUsers: (page = 0, size = 20, token) =>
      apiRequest(`/admin/users?page=${page}&size=${size}`, { token }),
    
    getUserById: (userId, token) =>
      apiRequest(`/admin/users/${userId}`, { token }),
    
    createUser: (userData, token) =>
      apiRequest('/admin/users', { method: 'POST', body: userData, token }),
    
    updateUser: (userId, userData, token) =>
      apiRequest(`/admin/users/${userId}`, { method: 'PUT', body: userData, token }),
    
    deleteUser: (userId, token) =>
      apiRequest(`/admin/users/${userId}`, { method: 'DELETE', token }),
    
    getRoles: (token) =>
      apiRequest('/admin/users/roles', { token }),
    
    // System Settings
    getSettings: (token) =>
      apiRequest('/admin/settings', { token }),
    
    getSettingByKey: (key, token) =>
      apiRequest(`/admin/settings/${key}`, { token }),
    
    updateSetting: (key, settingData, token) =>
      apiRequest(`/admin/settings/${key}`, { method: 'PUT', body: settingData, token }),
    
    createSetting: (settingData, token) =>
      apiRequest('/admin/settings', { method: 'POST', body: settingData, token }),
    
    // Activity Logs
    getActivityLogs: (page = 0, size = 50, filters = {}, token) => {
      const params = new URLSearchParams({ page, size })
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.entityId) params.append('entityId', filters.entityId)
      return apiRequest(`/admin/activity-logs?${params}`, { token })
    },
    
    // Audit Trail
    getAuditTrail: (page = 0, size = 50, filters = {}, token) => {
      const params = new URLSearchParams({ page, size })
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.entityType) params.append('entityType', filters.entityType)
      if (filters.entityId) params.append('entityId', filters.entityId)
      return apiRequest(`/admin/audit-trail?${params}`, { token })
    },
    
    // Analytics
    getAnalytics: (token) =>
      apiRequest('/admin/analytics/overview', { token })
  }
}

export default api


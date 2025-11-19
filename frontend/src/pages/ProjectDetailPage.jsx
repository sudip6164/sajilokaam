import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { ProjectMessaging } from '../components/ProjectMessaging'
import { Timer } from '../components/Timer'
import api from '../utils/api'

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const PRIORITY_STYLES = {
  LOW: 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/40',
  MEDIUM: 'bg-sky-500/10 text-sky-200 border border-sky-400/40',
  HIGH: 'bg-amber-500/10 text-amber-200 border border-amber-400/40',
  CRITICAL: 'bg-rose-500/10 text-rose-200 border border-rose-400/40'
}

const DEFAULT_PRIORITY = 'MEDIUM'

const formatPriorityLabel = (priority = DEFAULT_PRIORITY) => {
  const normalized = priority || DEFAULT_PRIORITY
  return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}

const getPriorityBadgeClass = (priority) =>
  PRIORITY_STYLES[priority] || PRIORITY_STYLES[DEFAULT_PRIORITY]

const withAlpha = (hex, alpha = '33') => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return '#6366f133'
  }
  const normalized = hex.length === 7 ? hex : '#6366f1'
  return `${normalized}${alpha}`
}

const getLabelChipStyles = (label) => {
  const color = label?.color || '#6366f1'
  return {
    borderColor: color,
    backgroundColor: withAlpha(color, '26'),
    color
  }
}

const DEPENDENCY_OPTIONS = [
  { value: 'BLOCKS', label: 'Blocks (this task must finish first)' },
  { value: 'BLOCKED_BY', label: 'Blocked by (waiting on selected task)' }
]

export function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [labels, setLabels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [submittingTask, setSubmittingTask] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [assigningTaskId, setAssigningTaskId] = useState(null)
  const [updatingPriorityId, setUpdatingPriorityId] = useState(null)
  const [updatingLabelsTaskId, setUpdatingLabelsTaskId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [timeLogs, setTimeLogs] = useState({}) // { taskId: [logs] }
  const [timeSummaries, setTimeSummaries] = useState({}) // { taskId: { totalMinutes, totalHours, count } }
  const [showTimeLogForm, setShowTimeLogForm] = useState({}) // { taskId: true/false }
  const [loggingTime, setLoggingTime] = useState({}) // { taskId: true/false }
  const [taskDependencies, setTaskDependencies] = useState({}) // { taskId: [dependencies] }
  const [comments, setComments] = useState({}) // { taskId: [comments] }
  const [showCommentForm, setShowCommentForm] = useState({}) // { taskId: true/false }
  const [submittingComment, setSubmittingComment] = useState({}) // { taskId: true/false }
  const [files, setFiles] = useState({}) // { taskId: [files] }
  const [uploadingFile, setUploadingFile] = useState({}) // { taskId: true/false }
  const [labelPickerOpen, setLabelPickerOpen] = useState({})
  const [labelSelections, setLabelSelections] = useState({})
  const [labelForm, setLabelForm] = useState({ name: '', color: '#6366f1' })
  const [creatingLabel, setCreatingLabel] = useState(false)
  const [loadingLabels, setLoadingLabels] = useState(false)
  const [dependencyManagerOpen, setDependencyManagerOpen] = useState({})
  const [dependencyForm, setDependencyForm] = useState({})
  const [addingDependencyId, setAddingDependencyId] = useState(null)
  const [removingDependencyId, setRemovingDependencyId] = useState(null)
  const [watchers, setWatchers] = useState({})
  const [watchingStates, setWatchingStates] = useState({})
  const [togglingWatcherId, setTogglingWatcherId] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [submittingMilestone, setSubmittingMilestone] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null)
  const [escrowAccounts, setEscrowAccounts] = useState([])
  const [loadingEscrow, setLoadingEscrow] = useState(false)
  const [showEscrowModal, setShowEscrowModal] = useState(false)
  const [escrowForm, setEscrowForm] = useState({ amount: '' })
  const [showReleaseModal, setShowReleaseModal] = useState(false)
  const [releaseForm, setReleaseForm] = useState({ amount: '', releaseType: 'MILESTONE', notes: '' })
  const [selectedEscrow, setSelectedEscrow] = useState(null)
  const [submittingEscrow, setSubmittingEscrow] = useState(false)
  const navigate = useNavigate()
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    loadProject()
    loadTasks()
    loadFreelancers()
    loadMilestones()
    loadEscrow()
  }, [id])

  useEffect(() => {
    loadLabels()
  }, [])

  useEffect(() => {
    // Load time logs, comments, and files for all tasks when tasks change
    if (tasks.length > 0) {
      tasks.forEach(task => {
        loadTimeLogs(task.id)
        loadTimeSummary(task.id)
        loadComments(task.id)
        loadFiles(task.id)
        loadTaskDependencies(task.id)
        loadTaskWatchers(task.id)
      })
    }
  }, [tasks, id])

  useEffect(() => {
    filterTasks()
  }, [statusFilter, tasks])

  const loadProject = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`)
      if (!res.ok) throw new Error('Failed to load project')
      const data = await res.json()
      setProject(data)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      const data = await api.tasks.getAll(id, token)
      const tasksList = Array.isArray(data) ? data : []
      setTasks(tasksList)
      setFilteredTasks(tasksList)
    } catch (err) {
      console.error('Failed to load tasks', err)
    }
  }

  const loadFreelancers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users/freelancers')
      if (res.ok) {
        const data = await res.json()
        setFreelancers(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load freelancers', err)
    }
  }

  const loadMilestones = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/milestones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setMilestones(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load milestones', err)
    }
  }

  const loadLabels = async () => {
    try {
      setLoadingLabels(true)
      const data = await api.taskLabels.getAll()
      setLabels(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load task labels', err)
    } finally {
      setLoadingLabels(false)
    }
  }

  const handleLabelFormChange = (field, value) => {
    setLabelForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCreateLabel = async (e) => {
    e.preventDefault()
    if (!labelForm.name || !labelForm.name.trim()) {
      showError('Label name is required')
      return
    }
    setCreatingLabel(true)
    try {
      await api.taskLabels.create(token, {
        name: labelForm.name.trim(),
        color: labelForm.color || '#6366f1'
      })
      setLabelForm({ name: '', color: '#6366f1' })
      await loadLabels()
      showSuccess('Label created')
    } catch (err) {
      showError(err.message || 'Failed to create label')
    } finally {
      setCreatingLabel(false)
    }
  }

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm('Delete this label? It will be removed from all tasks.')) {
      return
    }
    try {
      await api.taskLabels.delete(labelId, token)
      await loadLabels()
      showSuccess('Label deleted')
    } catch (err) {
      showError(err.message || 'Failed to delete label')
    }
  }

  const loadEscrow = async () => {
    try {
      setLoadingEscrow(true)
      const data = await api.escrow.getByProject(id, token)
      setEscrowAccounts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load escrow accounts', err)
    } finally {
      setLoadingEscrow(false)
    }
  }

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const title = formData.get('title')
    const dueDate = formData.get('dueDate') || null

    if (!title || !title.trim()) {
      showError('Milestone title is required')
      return
    }

    setSubmittingMilestone(true)
    try {
      const url = editingMilestone
        ? `http://localhost:8080/api/projects/${id}/milestones/${editingMilestone.id}`
        : `http://localhost:8080/api/projects/${id}/milestones`
      const method = editingMilestone ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          dueDate: dueDate || null
        })
      })

      if (!res.ok) {
        throw new Error(editingMilestone ? 'Failed to update milestone' : 'Failed to create milestone')
      }

      showSuccess(editingMilestone ? 'Milestone updated successfully!' : 'Milestone created successfully!')
      e.target.reset()
      setShowMilestoneForm(false)
      setEditingMilestone(null)
      await loadMilestones()
      await loadTasks() // Reload tasks to refresh milestone assignments
    } catch (err) {
      showError(err.message || 'Failed to save milestone')
    } finally {
      setSubmittingMilestone(false)
    }
  }

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Are you sure you want to delete this milestone? Tasks assigned to it will be unassigned.')) {
      return
    }

    setDeletingMilestoneId(milestoneId)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/milestones/${milestoneId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete milestone')
      }

      showSuccess('Milestone deleted successfully!')
      await loadMilestones()
      await loadTasks()
    } catch (err) {
      showError(err.message || 'Failed to delete milestone')
    } finally {
      setDeletingMilestoneId(null)
    }
  }

  const loadTimeLogs = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/time-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setTimeLogs(prev => ({ ...prev, [taskId]: Array.isArray(data) ? data : [] }))
      }
    } catch (err) {
      console.error('Failed to load time logs', err)
    }
  }

  const loadTimeSummary = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/time-logs/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setTimeSummaries(prev => ({ ...prev, [taskId]: data }))
      }
    } catch (err) {
      console.error('Failed to load time summary', err)
    }
  }

  const loadTaskDependencies = async (taskId) => {
    if (!token) return
    try {
      const deps = await api.tasks.getDependencies(taskId, token)
      setTaskDependencies(prev => ({
        ...prev,
        [taskId]: Array.isArray(deps) ? deps : []
      }))
    } catch (err) {
      console.error('Failed to load dependencies', err)
    }
  }

  const loadComments = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setComments(prev => ({ ...prev, [taskId]: Array.isArray(data) ? data : [] }))
      }
    } catch (err) {
      console.error('Failed to load comments', err)
    }
  }

  const loadFiles = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setFiles(prev => ({ ...prev, [taskId]: Array.isArray(data) ? data : [] }))
      }
    } catch (err) {
      console.error('Failed to load files', err)
    }
  }

  const loadTaskWatchers = async (taskId) => {
    if (!token) return
    try {
      const data = await api.tasks.getWatchers(taskId, token)
      setWatchers(prev => ({
        ...prev,
        [taskId]: Array.isArray(data) ? data : []
      }))
      if (profile) {
        const isWatching = data?.some(watcher => watcher.user?.id === profile.id)
        setWatchingStates(prev => ({
          ...prev,
          [taskId]: !!isWatching
        }))
      }
    } catch (err) {
      console.error('Failed to load watchers', err)
    }
  }

  const handleFileUpload = async (e, taskId) => {
    e.preventDefault()
    const fileInput = e.target.querySelector('input[type="file"]')
    const file = fileInput?.files?.[0]
    
    if (!file) {
      showError('Please select a file to upload')
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB')
      return
    }

    setUploadingFile(prev => ({ ...prev, [taskId]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) {
        throw new Error('Failed to upload file')
      }

      showSuccess('File uploaded successfully!')
      e.target.reset()
      await loadFiles(taskId)
    } catch (err) {
      showError(err.message || 'Failed to upload file')
    } finally {
      setUploadingFile(prev => ({ ...prev, [taskId]: false }))
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleTimeLogSubmit = async (e, taskId) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const minutes = parseInt(formData.get('minutes'))
    
    if (!minutes || minutes < 1) {
      showError('Please enter a valid number of minutes (at least 1)')
      return
    }

    setLoggingTime(prev => ({ ...prev, [taskId]: true }))
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/time-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ minutes })
      })

      if (!res.ok) {
        throw new Error('Failed to log time')
      }

      showSuccess('Time logged successfully!')
      e.target.reset()
      setShowTimeLogForm(prev => ({ ...prev, [taskId]: false }))
      await loadTimeLogs(taskId)
      await loadTimeSummary(taskId)
    } catch (err) {
      showError(err.message || 'Failed to log time')
    } finally {
      setLoggingTime(prev => ({ ...prev, [taskId]: false }))
    }
  }

  const handleCommentSubmit = async (e, taskId) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const content = formData.get('content')
    
    if (!content || !content.trim()) {
      showError('Comment cannot be empty')
      return
    }

    setSubmittingComment(prev => ({ ...prev, [taskId]: true }))
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      })

      if (!res.ok) {
        throw new Error('Failed to post comment')
      }

      showSuccess('Comment posted successfully!')
      e.target.reset()
      setShowCommentForm(prev => ({ ...prev, [taskId]: false }))
      await loadComments(taskId)
    } catch (err) {
      showError(err.message || 'Failed to post comment')
    } finally {
      setSubmittingComment(prev => ({ ...prev, [taskId]: false }))
    }
  }

  const filterTasks = () => {
    if (statusFilter === 'ALL') {
      setFilteredTasks(tasks)
    } else {
      setFilteredTasks(tasks.filter(task => task.status === statusFilter))
    }
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const title = formData.get('title')
    const description = formData.get('description')
    const status = formData.get('status') || 'TODO'
    const dueDate = formData.get('dueDate') || null
    const priority = formData.get('priority') || DEFAULT_PRIORITY
    const labelIds = formData.getAll('labelIds').map(id => parseInt(id)).filter(Boolean)

    if (!title.trim()) {
      showError('Task title is required')
      return
    }

    setSubmittingTask(true)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description || '',
          status,
          dueDate: dueDate || null,
          priority,
          assigneeId: formData.get('assigneeId') ? parseInt(formData.get('assigneeId')) : null,
          milestoneId: formData.get('milestoneId') ? parseInt(formData.get('milestoneId')) : null,
          labelIds
        })
      })

      if (!res.ok) {
        throw new Error('Failed to create task')
      }

      showSuccess('Task created successfully!')
      await loadTasks()
      e.target.reset()
      setShowTaskForm(false)
    } catch (err) {
      showError(err.message || 'Failed to create task')
    } finally {
      setSubmittingTask(false)
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        throw new Error('Failed to update task status')
      }

      showSuccess(`Task status updated to ${newStatus}`)
      await loadTasks()
    } catch (err) {
      showError(err.message || 'Failed to update task status')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const updateTaskAssignee = async (taskId, assigneeId) => {
    setAssigningTaskId(taskId)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}/assignee`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigneeId: assigneeId || null })
      })

      if (!res.ok) {
        throw new Error('Failed to update task assignee')
      }

      showSuccess('Task assignee updated successfully!')
      await loadTasks()
    } catch (err) {
      showError(err.message || 'Failed to update task assignee')
    } finally {
      setAssigningTaskId(null)
    }
  }

  const updateTaskPriority = async (taskId, newPriority) => {
    if (!newPriority) return
    setUpdatingPriorityId(taskId)
    try {
      await api.tasks.updatePriority(id, taskId, token, newPriority)
      showSuccess(`Priority updated to ${formatPriorityLabel(newPriority)}`)
      await loadTasks()
    } catch (err) {
      showError(err.message || 'Failed to update task priority')
    } finally {
      setUpdatingPriorityId(null)
    }
  }

const handleToggleLabelPicker = (task) => {
  setLabelPickerOpen(prev => {
    const next = !prev[task.id]
    if (next) {
      setLabelSelections(current => ({
        ...current,
        [task.id]: task.labels?.map(label => label.id) || []
      }))
    }
    return {
      ...prev,
      [task.id]: next
    }
  })
}

  const handleLabelSelectionChange = (taskId, labelId, checked) => {
    setLabelSelections(prev => {
      const existing = new Set(prev[taskId] || [])
      if (checked) {
        existing.add(labelId)
      } else {
        existing.delete(labelId)
      }
      return {
        ...prev,
        [taskId]: Array.from(existing)
      }
    })
  }

  const saveTaskLabels = async (taskId) => {
    const labelIds = labelSelections[taskId] || []
    setUpdatingLabelsTaskId(taskId)
    try {
      await api.tasks.updateLabels(id, taskId, token, labelIds)
      showSuccess('Task labels updated')
      await loadTasks()
      setLabelPickerOpen(prev => ({ ...prev, [taskId]: false }))
    } catch (err) {
      showError(err.message || 'Failed to update task labels')
    } finally {
      setUpdatingLabelsTaskId(null)
    }
  }

  const getSelectedLabelIds = (task) =>
    labelSelections[task.id] ?? (task.labels?.map(label => label.id) || [])

const handleToggleDependencyManager = async (task) => {
  const next = !dependencyManagerOpen[task.id]
  setDependencyManagerOpen(prev => ({
    ...prev,
    [task.id]: next
  }))
  if (next) {
    await loadTaskDependencies(task.id)
    setDependencyForm(prev => ({
      ...prev,
      [task.id]: prev[task.id] || { dependsOnTaskId: '', dependencyType: 'BLOCKS' }
    }))
  }
}

const handleDependencyFormChange = (taskId, field, value) => {
  setDependencyForm(prev => ({
    ...prev,
    [taskId]: {
      dependsOnTaskId: field === 'dependsOnTaskId' ? value : prev[taskId]?.dependsOnTaskId || '',
      dependencyType: field === 'dependencyType' ? value : prev[taskId]?.dependencyType || 'BLOCKS'
    }
  }))
}

const handleAddDependency = async (taskId) => {
  const form = dependencyForm[taskId] || {}
  if (!form.dependsOnTaskId) {
    showError('Select a task to depend on')
    return
  }
  setAddingDependencyId(taskId)
  try {
    await api.tasks.createDependency(taskId, token, {
      dependsOnTaskId: parseInt(form.dependsOnTaskId),
      dependencyType: form.dependencyType || 'BLOCKS'
    })
    await loadTaskDependencies(taskId)
    showSuccess('Dependency added')
    setDependencyForm(prev => ({
      ...prev,
      [taskId]: { dependsOnTaskId: '', dependencyType: form.dependencyType || 'BLOCKS' }
    }))
  } catch (err) {
    showError(err.message || 'Failed to add dependency')
  } finally {
    setAddingDependencyId(null)
  }
}

const handleRemoveDependency = async (taskId, dependencyId) => {
  setRemovingDependencyId(dependencyId)
  try {
    await api.tasks.deleteDependency(taskId, dependencyId, token)
    await loadTaskDependencies(taskId)
    showSuccess('Dependency removed')
  } catch (err) {
    showError(err.message || 'Failed to remove dependency')
  } finally {
    setRemovingDependencyId(null)
  }
}

  const getStatusBadge = (status) => {
    const badges = {
      TODO: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning',
      DONE: 'badge badge-success'
    }
    return badges[status] || 'badge badge-gray'
  }

  const handleToggleWatcher = async (taskId) => {
    if (!token || !profile) {
      showError('Sign in to watch tasks')
      return
    }

    const currentlyWatching = watchingStates[taskId]
    setTogglingWatcherId(taskId)
    try {
      if (currentlyWatching) {
        await api.tasks.removeWatcher(taskId, token)
        showSuccess('Stopped watching this task')
      } else {
        await api.tasks.addWatcher(taskId, token)
        showSuccess('You will now receive updates for this task')
      }
      await loadTaskWatchers(taskId)
    } catch (err) {
      showError(err.message || 'Failed to update watcher state')
    } finally {
      setTogglingWatcherId(null)
    }
  }
  const getTaskStats = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length
    }
  }

  const stats = getTaskStats()
  const progressPercentage = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const isProjectOwner = project && profile && project.job && project.job.client &&
    (project.job.client.id === profile.id || (typeof project.job.client === 'object' && project.job.client.id === profile.id))

  const openEditModal = () => {
    setEditTitle(project.title)
    setEditDescription(project.description || '')
    setShowEditModal(true)
  }

  const handleEditProject = async (e) => {
    e.preventDefault()
    setEditingProject(true)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update project')
      }

      const updatedProject = await res.json()
      setProject(updatedProject)
      showSuccess('Project updated successfully!')
      setShowEditModal(false)
    } catch (err) {
      showError(err.message || 'Failed to update project')
    } finally {
      setEditingProject(false)
    }
  }

  const handleDeleteProject = async () => {
    setDeletingProject(true)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete project')
      }

      showSuccess('Project deleted successfully!')
      navigate('/projects')
    } catch (err) {
      showError(err.message || 'Failed to delete project')
    } finally {
      setDeletingProject(false)
      setShowDeleteModal(false)
    }
  }

  const projectClientId = project?.client?.id || project?.job?.client?.id
  const projectFreelancerId = project?.freelancer?.id || project?.job?.freelancer?.id
  const canManageEscrow = projectClientId && profile?.id && projectClientId === profile.id

  const handleEscrowDeposit = async (e) => {
    e.preventDefault()
    const amountValue = Number(escrowForm.amount)
    if (!amountValue || amountValue <= 0) {
      showError('Enter a valid amount')
      return
    }
    if (!projectClientId || !projectFreelancerId) {
      showError('Project is missing client or freelancer details')
      return
    }
    setSubmittingEscrow(true)
    try {
      await api.escrow.create(token, {
        projectId: Number(id),
        amount: amountValue,
        clientId: projectClientId,
        freelancerId: projectFreelancerId
      })
      showSuccess('Escrow funded successfully')
      setShowEscrowModal(false)
      setEscrowForm({ amount: '' })
      await loadEscrow()
    } catch (err) {
      showError(err.message || 'Failed to fund escrow')
    } finally {
      setSubmittingEscrow(false)
    }
  }

  const handleEscrowRelease = async (e) => {
    e.preventDefault()
    if (!selectedEscrow) {
      showError('Select an escrow account')
      return
    }
    const amountValue = Number(releaseForm.amount)
    if (!amountValue || amountValue <= 0) {
      showError('Enter a valid amount to release')
      return
    }
    setSubmittingEscrow(true)
    try {
      await api.escrow.release(selectedEscrow.id, token, {
        amount: amountValue,
        releaseType: releaseForm.releaseType,
        notes: releaseForm.notes
      })
      showSuccess('Funds released successfully')
      setShowReleaseModal(false)
      setSelectedEscrow(null)
      await loadEscrow()
    } catch (err) {
      showError(err.message || 'Failed to release funds')
    } finally {
      setSubmittingEscrow(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
            <div className="card">
              <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-4 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-16">
              <p className="text-red-500 text-lg font-semibold mb-4">Project not found</p>
              <Link to="/projects" className="btn btn-primary inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Link to="/projects" className="text-violet-400 hover:text-violet-300 font-semibold mb-8 inline-flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>

          <div className="card mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-3xl font-extrabold text-white">{project.title}</h1>
                  <div className="flex gap-3">
                    <div className="relative group">
                      <button className="btn btn-secondary text-sm">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Reports
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-56 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <div className="p-2 space-y-1">
                          <a
                            href={`http://localhost:8080/api/reports/projects/${id}/csv`}
                            download
                            onClick={(e) => {
                              e.preventDefault()
                              const link = document.createElement('a')
                              link.href = `http://localhost:8080/api/reports/projects/${id}/csv`
                              link.setAttribute('download', `project_${id}_report.csv`)
                              link.setAttribute('Authorization', `Bearer ${token}`)
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              // Trigger download with auth header
                              fetch(`http://localhost:8080/api/reports/projects/${id}/csv`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })
                                .then(res => res.blob())
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `project_${id}_report.csv`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                  showSuccess('Project report downloaded!')
                                })
                                .catch(() => showError('Failed to download report'))
                            }}
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 rounded transition-colors"
                          >
                            📊 Full Project Report
                          </a>
                          <a
                            href={`http://localhost:8080/api/reports/projects/${id}/tasks/csv`}
                            download
                            onClick={(e) => {
                              e.preventDefault()
                              fetch(`http://localhost:8080/api/reports/projects/${id}/tasks/csv`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })
                                .then(res => res.blob())
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `tasks_report_${id}.csv`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                  showSuccess('Tasks report downloaded!')
                                })
                                .catch(() => showError('Failed to download report'))
                            }}
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 rounded transition-colors"
                          >
                            📋 Tasks Report
                          </a>
                          <a
                            href={`http://localhost:8080/api/reports/projects/${id}/time-logs/csv`}
                            download
                            onClick={(e) => {
                              e.preventDefault()
                              fetch(`http://localhost:8080/api/reports/projects/${id}/time-logs/csv`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })
                                .then(res => res.blob())
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `time_logs_report_${id}.csv`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                  showSuccess('Time logs report downloaded!')
                                })
                                .catch(() => showError('Failed to download report'))
                            }}
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 rounded transition-colors"
                          >
                            ⏱️ Time Logs Report (CSV)
                          </a>
                          <div className="border-t border-white/20 my-1"></div>
                          <a
                            href={`http://localhost:8080/api/reports/projects/${id}/pdf`}
                            download
                            onClick={(e) => {
                              e.preventDefault()
                              fetch(`http://localhost:8080/api/reports/projects/${id}/pdf`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })
                                .then(res => res.blob())
                                .then(blob => {
                                  const url = window.URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `project_${id}_report.pdf`
                                  document.body.appendChild(a)
                                  a.click()
                                  window.URL.revokeObjectURL(url)
                                  document.body.removeChild(a)
                                  showSuccess('PDF report downloaded!')
                                })
                                .catch(() => showError('Failed to download PDF report'))
                            }}
                            className="block px-4 py-2 text-sm text-white/90 hover:bg-white/10 rounded transition-colors"
                          >
                            📄 Full Project Report (PDF)
                          </a>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/projects/${id}/kanban`}
                      className="btn btn-primary text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      Kanban Board
                    </Link>
                    <Link
                      to={`/projects/${id}/documents/upload`}
                      className="btn btn-secondary text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Extract Tasks from Document
                    </Link>
                    {isProjectOwner && (
                      <>
                        <button
                          onClick={openEditModal}
                          className="btn btn-secondary text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="btn btn-danger text-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <Link
                    to={`/projects/${id}/sprints`}
                    className="card border border-violet-500/30 hover:border-violet-400/60 transition-all"
                  >
                    <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Iterations</p>
                    <h3 className="text-lg font-bold text-white mb-1">Sprint Planner</h3>
                    <p className="text-white/70 text-sm">Draft sprint goals, set timelines, and review accomplishments.</p>
                  </Link>
                  <Link
                    to="/teams"
                    className="card border border-cyan-500/30 hover:border-cyan-400/60 transition-all"
                  >
                    <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Collaboration</p>
                    <h3 className="text-lg font-bold text-white mb-1">Team Hub</h3>
                    <p className="text-white/70 text-sm">Invite specialists, assign pods, and broadcast updates.</p>
                  </Link>
                </div>

                <p className="text-white/70 text-lg leading-relaxed mb-4">
                  {project.description || 'No description provided'}
                </p>
                {project.job && (
                  <div className="flex items-center gap-2 text-sm text-white/60 pt-4 border-t border-white/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>From job: <span className="font-semibold">{project.job.title}</span></span>
                  </div>
                )}
              </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Escrow Accounts</h3>
            <p className="text-white/60 text-sm">Funds on hold for this project</p>
          </div>
          {canManageEscrow && (
            <button
              className="btn btn-secondary text-sm"
              onClick={() => {
                setEscrowForm({ amount: '' })
                setShowEscrowModal(true)
              }}
            >
              Deposit Escrow
            </button>
          )}
        </div>
        {loadingEscrow ? (
          <p className="text-white/60 text-sm">Loading escrow information...</p>
        ) : escrowAccounts.length === 0 ? (
          <p className="text-white/50 text-sm">No escrow deposits have been made yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {escrowAccounts.map(account => (
              <div key={account.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{account.status}</span>
                  <span className="text-white text-sm font-bold">Rs. {Number(account.totalAmount).toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/60">
                  Released: Rs. {Number(account.releasedAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/60 mb-2">
                  Refunded: Rs. {Number(account.refundedAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/50">
                  Client: {account.client?.fullName || 'N/A'}
                </p>
                <p className="text-xs text-white/50 mb-2">
                  Freelancer: {account.freelancer?.fullName || 'N/A'}
                </p>
                {canManageEscrow && (
                  <button
                    className="text-xs text-violet-300 hover:text-violet-200"
                    onClick={() => {
                      setSelectedEscrow(account)
                      setReleaseForm({ amount: '', releaseType: 'MILESTONE', notes: '' })
                      setShowReleaseModal(true)
                    }}
                  >
                    Release funds →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Escrow Accounts</h3>
            <p className="text-white/60 text-sm">Funds on hold for this project</p>
          </div>
          {canManageEscrow && (
            <button
              className="btn btn-secondary text-sm"
              onClick={() => {
                setEscrowForm({ amount: '' })
                setShowEscrowModal(true)
              }}
            >
              Deposit Escrow
            </button>
          )}
        </div>
        {loadingEscrow ? (
          <p className="text-white/60 text-sm">Loading escrow information...</p>
        ) : escrowAccounts.length === 0 ? (
          <p className="text-white/50 text-sm">No escrow deposits have been made yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {escrowAccounts.map(account => (
              <div key={account.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm">{account.status}</span>
                  <span className="text-white text-sm font-bold">Rs. {Number(account.totalAmount).toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/60">
                  Released: Rs. {Number(account.releasedAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/60 mb-2">
                  Refunded: Rs. {Number(account.refundedAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-white/50">
                  Client: {account.client?.fullName || 'N/A'}
                </p>
                <p className="text-xs text-white/50 mb-2">
                  Freelancer: {account.freelancer?.fullName || 'N/A'}
                </p>
                {canManageEscrow && (
                  <button
                    className="text-xs text-violet-300 hover:text-violet-200"
                    onClick={() => {
                      setSelectedEscrow(account)
                      setReleaseForm({ amount: '', releaseType: 'MILESTONE', notes: '' })
                      setShowReleaseModal(true)
                    }}
                  >
                    Release funds →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Statistics */}
          {stats.total > 0 && (
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Progress</h3>
                <span className="text-2xl font-extrabold text-violet-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-2xl font-extrabold text-white">{stats.total}</p>
                  <p className="text-xs text-white/60 font-semibold">Total</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-2xl font-extrabold text-white/80">{stats.todo}</p>
                  <p className="text-xs text-white/60 font-semibold">To Do</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-2xl font-extrabold text-violet-400">{stats.inProgress}</p>
                  <p className="text-xs text-white/60 font-semibold">In Progress</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-2xl font-extrabold text-emerald-400">{stats.done}</p>
                  <p className="text-xs text-white/60 font-semibold">Done</p>
                </div>
              </div>
            </div>
          )}

          {/* Milestones Section */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Milestones <span className="text-white/60 font-normal">({milestones.length})</span>
                </h2>
                <p className="text-sm text-white/70 mt-1">Organize tasks into project milestones</p>
              </div>
              <button
                onClick={() => {
                  setEditingMilestone(null)
                  setShowMilestoneForm(!showMilestoneForm)
                }}
                className="btn btn-primary"
              >
                {showMilestoneForm ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Milestone
                  </>
                )}
              </button>
            </div>

            {showMilestoneForm && (
              <form onSubmit={handleMilestoneSubmit} className="mb-6 p-5 border-2 border-white/10 rounded-xl bg-white/5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingMilestone?.title || ''}
                    className="input-field"
                    placeholder="Enter milestone title"
                    disabled={submittingMilestone}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={editingMilestone?.dueDate || ''}
                    className="input-field"
                    disabled={submittingMilestone}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingMilestone}
                    className="btn btn-success flex-1"
                  >
                    {submittingMilestone ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      editingMilestone ? 'Update Milestone' : 'Create Milestone'
                    )}
                  </button>
                  {editingMilestone && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMilestone(null)
                        setShowMilestoneForm(false)
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {milestones.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/70 text-lg font-semibold mb-2">No milestones yet</p>
                <p className="text-sm text-white/50">Create your first milestone above!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {milestones.map(milestone => {
                  const milestoneTasks = tasks.filter(t => t.milestoneId === milestone.id)
                  const completedTasks = milestoneTasks.filter(t => t.status === 'DONE').length
                  const progress = milestoneTasks.length > 0 ? (completedTasks / milestoneTasks.length) * 100 : 0
                  
                  return (
                    <div
                      key={milestone.id}
                      className="p-5 border-2 border-white/10 rounded-xl hover:border-violet-500/50 hover:shadow-lg transition-all bg-white/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-white mb-1">{milestone.title}</h3>
                          {milestone.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingMilestone(milestone)
                              setShowMilestoneForm(true)
                            }}
                            className="btn btn-ghost text-xs p-2"
                            title="Edit milestone"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            disabled={deletingMilestoneId === milestone.id}
                            className="btn btn-ghost text-xs p-2 text-red-400 hover:text-red-300"
                            title="Delete milestone"
                          >
                            {deletingMilestoneId === milestone.id ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/70">
                            {milestoneTasks.length} task{milestoneTasks.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-sm font-semibold text-violet-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Tasks <span className="text-white/60 font-normal">({stats.total})</span>
                </h2>
                <p className="text-sm text-white/70 mt-1">Manage project tasks and track progress</p>
              </div>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="btn btn-primary"
              >
                {showTaskForm ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Task
                  </>
                )}
              </button>
            </div>

            {isProjectOwner && (
              <div className="mb-6 border-2 border-dashed border-white/10 rounded-xl p-5 bg-white/5 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">Label Library</p>
                    <h3 className="text-lg font-bold text-white">Organize tasks with custom labels</h3>
                    <p className="text-sm text-white/60">
                      Create reusable tags for priorities, squads, or workflow states.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost border border-white/10"
                    onClick={loadLabels}
                    disabled={loadingLabels}
                  >
                    {loadingLabels ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
                <form
                  onSubmit={handleCreateLabel}
                  className="grid md:grid-cols-[2fr_1fr_auto] gap-3"
                >
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Label name (e.g., Design, Backend, Blocked)"
                    value={labelForm.name}
                    onChange={(e) => handleLabelFormChange('name', e.target.value)}
                    disabled={creatingLabel}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/70">Color</span>
                    <input
                      type="color"
                      className="h-10 w-full rounded-lg overflow-hidden border border-white/10 bg-transparent"
                      value={labelForm.color}
                      onChange={(e) => handleLabelFormChange('color', e.target.value)}
                      disabled={creatingLabel}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={creatingLabel}
                  >
                    {creatingLabel ? 'Creating…' : 'Create Label'}
                  </button>
                </form>
                {labels.length === 0 ? (
                  <p className="text-sm text-white/50">No labels yet. Create your first label above.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {labels.map(label => (
                      <div
                        key={label.id}
                        className="flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold"
                        style={getLabelChipStyles(label)}
                      >
                        <span>{label.name}</span>
                        <button
                          type="button"
                          className="text-white/70 hover:text-white transition-colors"
                          onClick={() => handleDeleteLabel(label.id)}
                          title="Delete label"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="mb-6 p-5 border-2 border-white/10 rounded-xl bg-white/5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    placeholder="Enter task title"
                    disabled={submittingTask}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Describe the task..."
                    disabled={submittingTask}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Status</label>
                    <select name="status" className="input-field" disabled={submittingTask}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Milestone</label>
                    <select name="milestoneId" className="input-field" disabled={submittingTask}>
                      <option value="">No Milestone</option>
                      {milestones.map(milestone => (
                        <option key={milestone.id} value={milestone.id}>
                          {milestone.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Assign To</label>
                    <select name="assigneeId" className="input-field" disabled={submittingTask}>
                      <option value="">Unassigned</option>
                      {freelancers.map(freelancer => (
                        <option key={freelancer.id} value={freelancer.id}>
                          {freelancer.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="input-field"
                      disabled={submittingTask}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Priority</label>
                  <select
                    name="priority"
                    className="input-field"
                    defaultValue={DEFAULT_PRIORITY}
                    disabled={submittingTask}
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {formatPriorityLabel(option)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Labels</label>
                  {labels.length === 0 ? (
                    <p className="text-sm text-white/50">No labels defined yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {labels.map(label => (
                        <label
                          key={label.id}
                          className="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer text-xs font-semibold"
                          style={getLabelChipStyles(label)}
                        >
                          <input
                            type="checkbox"
                            name="labelIds"
                            value={label.id}
                            className="accent-violet-500"
                            disabled={submittingTask}
                          />
                          <span>{label.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="btn btn-success w-full"
                >
                  {submittingTask ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </form>
            )}

            {/* Task Filter */}
            {tasks.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-white/90 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="ALL">All Tasks ({stats.total})</option>
                  <option value="TODO">To Do ({stats.todo})</option>
                  <option value="IN_PROGRESS">In Progress ({stats.inProgress})</option>
                  <option value="DONE">Done ({stats.done})</option>
                </select>
              </div>
            )}

            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                {tasks.length === 0 ? (
                  <>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-lg font-semibold mb-2">No tasks yet</p>
                    <p className="text-sm text-white/50">Create your first task above!</p>
                  </>
                ) : (
                  <>
                    <p className="text-white/70 text-lg font-semibold">No tasks match the filter</p>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-violet-400 hover:text-violet-300 font-semibold mt-2 text-sm transition-colors"
                    >
                      Show all tasks
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
            {filteredTasks.map(task => {
              const selectedLabelIds = getSelectedLabelIds(task)
              return (
                <div
                  key={task.id}
                  className="border-2 border-white/10 rounded-xl p-5 hover:border-violet-500/50 hover:shadow-lg transition-all"
                >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                    {(() => {
                      const selectedIds = getSelectedLabelIds(task)
                      return selectedIds
                    })()}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{task.title}</h3>
                          <span className={getStatusBadge(task.status)}>{task.status}</span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                            {formatPriorityLabel(task.priority)}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-white/70 mb-3 leading-relaxed">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 items-center text-sm">
                          {task.milestoneId && milestones.find(m => m.id === task.milestoneId) && (
                            <div className="flex items-center gap-2 text-violet-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold">{milestones.find(m => m.id === task.milestoneId).title}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-white/60">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {isProjectOwner && (
                            <div className="flex items-center gap-2 text-white/60">
                              <span className="text-xs uppercase tracking-wide text-white/40">Priority</span>
                              <select
                                value={task.priority || DEFAULT_PRIORITY}
                                onChange={(e) => updateTaskPriority(task.id, e.target.value)}
                                disabled={updatingPriorityId === task.id}
                                className="text-xs border border-white/20 rounded px-2 py-1 bg-white/5 text-white/90"
                              >
                                {PRIORITY_OPTIONS.map(option => (
                                  <option key={option} value={option}>
                                    {formatPriorityLabel(option)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {task.assignee ? (
                            <div className="flex items-center gap-2 text-white/60">
                              <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30">
                                {task.assignee.fullName?.charAt(0) || 'A'}
                              </div>
                              <span>{task.assignee.fullName}</span>
                              {isProjectOwner && (
                                <button
                                  onClick={() => updateTaskAssignee(task.id, null)}
                                  disabled={assigningTaskId === task.id}
                                  className="ml-2 text-red-400 hover:text-red-300 text-xs transition-colors"
                                  title="Unassign"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ) : (
                            isProjectOwner && (
                              <div className="flex items-center gap-2">
                                <span className="text-white/40 text-xs">Unassigned</span>
                                <select
                                  value=""
                                  onChange={(e) => updateTaskAssignee(task.id, e.target.value ? parseInt(e.target.value) : null)}
                                  disabled={assigningTaskId === task.id}
                                  className="text-xs border border-white/20 rounded px-2 py-1 bg-white/5 text-white/90"
                                >
                                  <option value="">Assign...</option>
                                  {freelancers.map(freelancer => (
                                    <option key={freelancer.id} value={freelancer.id}>
                                      {freelancer.fullName}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )
                          )}
                          {/* Time Tracking Summary */}
                          {timeSummaries[task.id] && (
                            <div className="flex items-center gap-2 text-violet-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-semibold">
                                {timeSummaries[task.id].totalHours.toFixed(1)}h ({timeSummaries[task.id].count} logs)
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                          {task.labels && task.labels.length > 0 ? (
                            task.labels.map(label => (
                              <span
                                key={`${task.id}-${label.id}`}
                                className="px-2 py-1 rounded-full border font-semibold"
                                style={getLabelChipStyles(label)}
                              >
                                {label.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-white/40">No labels</span>
                          )}
                          {isProjectOwner && labels.length > 0 && (
                            <button
                              type="button"
                              className="text-violet-300 hover:text-violet-200 ml-2"
                              onClick={() => handleToggleLabelPicker(task)}
                            >
                              {labelPickerOpen[task.id] ? 'Close label picker' : 'Manage labels'}
                            </button>
                          )}
                        </div>

                        {isProjectOwner && labelPickerOpen[task.id] && (
                          <div className="mt-3 p-4 border border-violet-500/30 rounded-lg bg-violet-500/5 space-y-3">
                            {labels.length === 0 ? (
                              <p className="text-sm text-white/60">
                                No labels available. Create labels above to start tagging tasks.
                              </p>
                            ) : (
                              <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                                {labels.map(label => {
                                  const isChecked = selectedLabelIds.includes(label.id)
                                  return (
                                    <label
                                      key={`picker-${task.id}-${label.id}`}
                                      className="flex items-center gap-2 text-sm text-white/80 cursor-pointer"
                                      style={{ color: label.color || '#e0e7ff' }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) =>
                                          handleLabelSelectionChange(task.id, label.id, e.target.checked)
                                        }
                                        className="accent-violet-500"
                                      />
                                      <span
                                        className="px-2 py-1 rounded-full border text-xs font-semibold"
                                        style={getLabelChipStyles(label)}
                                      >
                                        {label.name}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                            <div className="flex gap-3">
                              <button
                                type="button"
                                className="btn btn-secondary text-xs"
                                onClick={() => saveTaskLabels(task.id)}
                                disabled={updatingLabelsTaskId === task.id}
                              >
                                {updatingLabelsTaskId === task.id ? 'Saving…' : 'Save labels'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost text-xs"
                                onClick={() =>
                                  setLabelPickerOpen(prev => ({ ...prev, [task.id]: false }))
                                }
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        )}
                        
                      <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white/80 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Dependencies
                            </h4>
                            {isProjectOwner && (
                              <button
                                type="button"
                                className="text-xs text-violet-300 hover:text-violet-200"
                                onClick={() => handleToggleDependencyManager(task)}
                              >
                                {dependencyManagerOpen[task.id] ? 'Close manager' : 'Manage'}
                              </button>
                            )}
                          </div>
                          {taskDependencies[task.id] && taskDependencies[task.id].length > 0 ? (
                            <ul className="space-y-2 text-sm text-white/80">
                              {taskDependencies[task.id].map(dep => (
                                <li
                                  key={dep.id}
                                  className="flex items-center justify-between gap-2 border border-white/10 rounded-lg px-3 py-2 bg-white/5"
                                >
                                  <div>
                                    <p className="font-semibold text-white">{dep.dependsOnTaskTitle}</p>
                                    <p className="text-xs text-white/50">
                                      {dep.dependencyType === 'BLOCKS'
                                        ? 'This task blocks the selected task'
                                        : 'This task is blocked by the selected task'}
                                    </p>
                                  </div>
                                  {isProjectOwner && (
                                    <button
                                      type="button"
                                      className="text-xs text-rose-300 hover:text-rose-200"
                                      onClick={() => handleRemoveDependency(task.id, dep.id)}
                                      disabled={removingDependencyId === dep.id}
                                    >
                                      {removingDependencyId === dep.id ? 'Removing…' : 'Remove'}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-white/50">No dependencies configured.</p>
                          )}

                          {isProjectOwner && dependencyManagerOpen[task.id] && (
                            <div className="border border-violet-500/30 rounded-lg p-4 bg-violet-500/5 space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-white/60 mb-1">Related task</label>
                                  <select
                                    className="input-field text-sm"
                                    value={dependencyForm[task.id]?.dependsOnTaskId || ''}
                                    onChange={(e) =>
                                      handleDependencyFormChange(task.id, 'dependsOnTaskId', e.target.value)
                                    }
                                  >
                                    <option value="">Select task…</option>
                                    {tasks
                                      .filter(t => t.id !== task.id)
                                      .map(option => (
                                        <option key={`dep-option-${task.id}-${option.id}`} value={option.id}>
                                          {option.title}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-white/60 mb-1">Relationship</label>
                                  <select
                                    className="input-field text-sm"
                                    value={dependencyForm[task.id]?.dependencyType || 'BLOCKS'}
                                    onChange={(e) =>
                                      handleDependencyFormChange(task.id, 'dependencyType', e.target.value)
                                    }
                                  >
                                    {DEPENDENCY_OPTIONS.map(option => (
                                      <option key={`${task.id}-${option.value}`} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-secondary text-xs"
                                onClick={() => handleAddDependency(task.id)}
                                disabled={addingDependencyId === task.id}
                              >
                                {addingDependencyId === task.id ? 'Adding…' : 'Add dependency'}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white/80 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              Watchers
                            </h4>
                            {profile && (
                              <button
                                type="button"
                                className="text-xs text-violet-300 hover:text-violet-200"
                                onClick={() => handleToggleWatcher(task.id)}
                                disabled={togglingWatcherId === task.id}
                              >
                                {togglingWatcherId === task.id
                                  ? 'Updating…'
                                  : watchingStates[task.id]
                                    ? 'Unwatch'
                                    : 'Watch task'}
                              </button>
                            )}
                          </div>
                          {watchers[task.id] && watchers[task.id].length > 0 ? (
                            <ul className="space-y-2 text-sm text-white/80">
                              {watchers[task.id].map(watcher => (
                                <li
                                  key={`${task.id}-watcher-${watcher.user?.id}`}
                                  className="flex items-center justify-between px-3 py-2 border border-white/10 rounded-lg bg-white/5"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold text-white">
                                      {watcher.user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-white">
                                        {watcher.user?.fullName || 'Unknown user'}
                                      </p>
                                      <p className="text-xs text-white/50">
                                        Watching since {watcher.createdAt ? new Date(watcher.createdAt).toLocaleDateString() : '—'}
                                      </p>
                                    </div>
                                  </div>
                                  {profile && watcher.user?.id === profile.id && (
                                    <button
                                      type="button"
                                      className="text-xs text-rose-300 hover:text-rose-200"
                                      onClick={() => handleToggleWatcher(task.id)}
                                      disabled={togglingWatcherId === task.id}
                                    >
                                      {togglingWatcherId === task.id ? 'Updating…' : 'Unwatch'}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-white/50">No watchers yet.</p>
                          )}
                        </div>
                      </div>

                        {/* Timer Component */}
                        <div className="mt-4">
                          <Timer 
                            taskId={task.id} 
                            taskTitle={task.title}
                            onTimerStop={() => {
                              loadTimeSummary(task.id)
                              loadTimeLogs(task.id)
                            }}
                          />
                        </div>
                        
                        {/* Time Log Form */}
                        {showTimeLogForm[task.id] && (
                          <form onSubmit={(e) => handleTimeLogSubmit(e, task.id)} className="mt-4 p-4 border border-violet-500/30 rounded-lg bg-violet-500/5">
                            <div className="flex gap-2">
                              <input
                                type="number"
                                name="minutes"
                                min="1"
                                required
                                placeholder="Minutes"
                                className="input-field flex-1"
                                disabled={loggingTime[task.id]}
                              />
                              <button
                                type="submit"
                                disabled={loggingTime[task.id]}
                                className="btn btn-primary text-sm"
                              >
                                {loggingTime[task.id] ? 'Logging...' : 'Log Time'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowTimeLogForm(prev => ({ ...prev, [task.id]: false }))}
                                className="btn btn-ghost text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Time Logs List */}
                        {timeLogs[task.id] && timeLogs[task.id].length > 0 && (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-bold text-white/90">Time Logs</h4>
                              {!showTimeLogForm[task.id] && (
                                <button
                                  onClick={() => setShowTimeLogForm(prev => ({ ...prev, [task.id]: true }))}
                                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                                >
                                  + Log Time
                                </button>
                              )}
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {timeLogs[task.id].map(log => (
                                <div key={log.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded border border-white/10">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/70">
                                      {log.user?.fullName || 'Unknown'}
                                    </span>
                                    <span className="text-white/50">•</span>
                                    <span className="text-violet-400 font-semibold">{log.minutes}m</span>
                                  </div>
                                  <span className="text-white/50">
                                    {new Date(log.loggedAt).toLocaleDateString()} {new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                </div>
              )
            })}
                            </div>
                          </div>
                        )}

                        {/* Show Log Time button if no logs yet */}
                        {(!timeLogs[task.id] || timeLogs[task.id].length === 0) && !showTimeLogForm[task.id] && (
                          <button
                            onClick={() => setShowTimeLogForm(prev => ({ ...prev, [task.id]: true }))}
                            className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Log Time
                          </button>
                        )}

                        {/* Comments Section */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Comments {comments[task.id] && `(${comments[task.id].length})`}
                            </h4>
                            {!showCommentForm[task.id] && (
                              <button
                                onClick={() => setShowCommentForm(prev => ({ ...prev, [task.id]: true }))}
                                className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Comment
                              </button>
                            )}
                          </div>

                          {/* Comment Form */}
                          {showCommentForm[task.id] && (
                            <form onSubmit={(e) => handleCommentSubmit(e, task.id)} className="mb-4">
                              <textarea
                                name="content"
                                rows={3}
                                required
                                placeholder="Write a comment..."
                                className="input-field resize-none mb-2"
                                disabled={submittingComment[task.id]}
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={submittingComment[task.id]}
                                  className="btn btn-primary text-sm"
                                >
                                  {submittingComment[task.id] ? 'Posting...' : 'Post Comment'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowCommentForm(prev => ({ ...prev, [task.id]: false }))}
                                  className="btn btn-ghost text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Comments List */}
                          {comments[task.id] && comments[task.id].length > 0 ? (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {comments[task.id].map(comment => (
                                <div key={comment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-purple-500/30 flex-shrink-0">
                                      {comment.user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-white/90">
                                          {comment.user?.fullName || 'Unknown User'}
                                        </span>
                                        <span className="text-xs text-white/50">
                                          {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            !showCommentForm[task.id] && (
                              <p className="text-sm text-white/50 italic">No comments yet. Be the first to comment!</p>
                            )
                          )}
                        </div>

                        {/* Files Section */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Files {files[task.id] && `(${files[task.id].length})`}
                            </h4>
                          </div>

                          {/* File Upload Form */}
                          <form onSubmit={(e) => handleFileUpload(e, task.id)} className="mb-4">
                            <div className="flex gap-2">
                              <input
                                type="file"
                                className="input-field flex-1 text-sm"
                                disabled={uploadingFile[task.id]}
                                accept="*/*"
                              />
                              <button
                                type="submit"
                                disabled={uploadingFile[task.id]}
                                className="btn btn-primary text-sm"
                              >
                                {uploadingFile[task.id] ? (
                                  <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                  </span>
                                ) : (
                                  'Upload'
                                )}
                              </button>
                            </div>
                            <p className="text-xs text-white/50 mt-1">Maximum file size: 5MB</p>
                          </form>

                          {/* Files List */}
                          {files[task.id] && files[task.id].length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {files[task.id].map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded flex items-center justify-center flex-shrink-0">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-white/90 truncate" title={file.filename}>
                                        {file.filename}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-white/50">
                                        <span>{formatFileSize(file.sizeBytes || 0)}</span>
                                        <span>•</span>
                                        <span>{file.uploader?.fullName || 'Unknown'}</span>
                                        <span>•</span>
                                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <a
                                    href={`http://localhost:8080/api/projects/${id}/tasks/${task.id}/files/${file.id}/download`}
                                    download={file.filename}
                                    className="btn btn-ghost text-xs ml-2 flex-shrink-0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-white/50 italic">No files uploaded yet.</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {task.status !== 'TODO' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'TODO')}
                            disabled={updatingTaskId === task.id}
                            className="btn btn-ghost text-xs"
                            title="Mark as To Do"
                          >
                            To Do
                          </button>
                        )}
                        {task.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            disabled={updatingTaskId === task.id}
                            className="btn btn-ghost text-xs"
                            title="Mark as In Progress"
                          >
                            In Progress
                          </button>
                        )}
                        {task.status !== 'DONE' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'DONE')}
                            disabled={updatingTaskId === task.id}
                            className="btn btn-success text-xs"
                            title="Mark as Done"
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEscrowModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Deposit Escrow</h3>
              <button className="text-white/60 hover:text-white" onClick={() => setShowEscrowModal(false)}>×</button>
            </div>
            <form className="space-y-4" onSubmit={handleEscrowDeposit}>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Amount (NPR)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input-field"
                  value={escrowForm.amount}
                  onChange={(e) => setEscrowForm({ amount: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={submittingEscrow}>
                  {submittingEscrow ? 'Depositing...' : 'Deposit'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEscrowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReleaseModal && selectedEscrow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Release Funds</h3>
              <button className="text-white/60 hover:text-white" onClick={() => setShowReleaseModal(false)}>×</button>
            </div>
            <form className="space-y-4" onSubmit={handleEscrowRelease}>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Amount (NPR)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="input-field"
                  value={releaseForm.amount}
                  onChange={(e) => setReleaseForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Release Type</label>
                <select
                  className="input-field"
                  value={releaseForm.releaseType}
                  onChange={(e) => setReleaseForm(prev => ({ ...prev, releaseType: e.target.value }))}
                >
                  <option value="MILESTONE">Milestone</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COMPLETE">Complete</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Notes</label>
                <textarea
                  className="input-field min-h-[100px]"
                  value={releaseForm.notes}
                  onChange={(e) => setReleaseForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={submittingEscrow}>
                  {submittingEscrow ? 'Releasing...' : 'Release'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReleaseModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Project</h3>
            <form onSubmit={handleEditProject} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., Website Development Project"
                  disabled={editingProject}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Describe the project..."
                  disabled={editingProject}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={editingProject}
                  className="btn btn-primary flex-1"
                >
                  {editingProject ? 'Updating...' : 'Update Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={editingProject}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messaging Section */}
      <ProjectMessaging projectId={id} />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Delete Project</h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete "{project?.title}"? This action cannot be undone and will also delete all associated tasks.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="btn btn-danger flex-1"
              >
                {deletingProject ? 'Deleting...' : 'Delete Project'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={deletingProject}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

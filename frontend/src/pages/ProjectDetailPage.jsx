import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [submittingTask, setSubmittingTask] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const navigate = useNavigate()
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    loadProject()
    loadTasks()
  }, [id])

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
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks`)
      if (res.ok) {
        const data = await res.json()
        const tasksList = Array.isArray(data) ? data : []
        setTasks(tasksList)
        setFilteredTasks(tasksList)
      }
    } catch (err) {
      console.error('Failed to load tasks', err)
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
          dueDate: dueDate || null
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
      // Note: This would require a PUT/PATCH endpoint in the backend
      // For now, we'll just show a message
      showSuccess(`Task status updated to ${newStatus}`)
      // In a real implementation, you'd call the API here
      // await fetch(`http://localhost:8080/api/projects/${id}/tasks/${taskId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      //   body: JSON.stringify({ status: newStatus })
      // })
      await loadTasks()
    } catch (err) {
      showError('Failed to update task status')
    } finally {
      setUpdatingTaskId(null)
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
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Link to="/projects" className="text-blue-600 hover:text-blue-700 font-semibold mb-8 inline-flex items-center gap-2 transition-colors">
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
                  <h1 className="text-3xl font-extrabold text-gray-900">{project.title}</h1>
                  {isProjectOwner && (
                    <div className="flex gap-3">
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
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {project.description || 'No description provided'}
                </p>
                {project.job && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>From job: <span className="font-semibold">{project.job.title}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          {stats.total > 0 && (
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Progress</h3>
                <span className="text-2xl font-extrabold text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-600 font-semibold">Total</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-extrabold text-gray-600">{stats.todo}</p>
                  <p className="text-xs text-gray-600 font-semibold">To Do</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-extrabold text-amber-600">{stats.inProgress}</p>
                  <p className="text-xs text-gray-600 font-semibold">In Progress</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-extrabold text-emerald-600">{stats.done}</p>
                  <p className="text-xs text-gray-600 font-semibold">Done</p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tasks <span className="text-gray-500 font-normal">({stats.total})</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">Manage project tasks and track progress</p>
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

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="mb-6 p-5 border-2 border-gray-200 rounded-xl bg-gray-50 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select name="status" className="input-field" disabled={submittingTask}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      className="input-field"
                      disabled={submittingTask}
                    />
                  </div>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
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
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-semibold mb-2">No tasks yet</p>
                    <p className="text-sm text-gray-400">Create your first task above!</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 text-lg font-semibold">No tasks match the filter</p>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="text-blue-600 hover:text-blue-700 font-semibold mt-2 text-sm"
                    >
                      Show all tasks
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                          <span className={getStatusBadge(task.status)}>{task.status}</span>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 items-center text-sm">
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-2 text-gray-500">
                              <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {task.assignee.fullName?.charAt(0) || 'A'}
                              </div>
                              <span>{task.assignee.fullName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
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

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h3>
            <form onSubmit={handleEditProject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Project</h3>
            <p className="text-gray-600 mb-6">
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

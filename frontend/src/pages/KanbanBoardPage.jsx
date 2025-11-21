import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { gradients } from '../theme/designSystem'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'from-gray-500 to-gray-600' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'from-blue-500 to-blue-600' },
  { id: 'DONE', title: 'Done', color: 'from-green-500 to-green-600' }
]

export function KanbanBoardPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState(null)
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [showTaskDrawer, setShowTaskDrawer] = useState(false)
  const navigate = useNavigate()
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  useEffect(() => {
    loadProject()
    loadTasks()
  }, [id])

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
        setTasks(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load tasks', err)
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

      await loadTasks()
    } catch (err) {
      showError(err.message || 'Failed to update task status')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const openTaskDrawer = (task) => {
    setActiveTask(task)
    setShowTaskDrawer(true)
  }

  const closeTaskDrawer = () => {
    setShowTaskDrawer(false)
    setActiveTask(null)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedTask(null)
    setDraggedOverColumn(null)
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOverColumn(null)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    setDraggedOverColumn(null)

    if (draggedTask && draggedTask.status !== columnId) {
      updateTaskStatus(draggedTask.id, columnId)
    }
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'TODO': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'IN_PROGRESS': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'DONE': 'bg-green-500/20 text-green-300 border-green-500/30'
    }
    return `px-2 py-1 rounded-md text-xs font-semibold border ${statusMap[status] || statusMap['TODO']}`
  }

  const getPriorityBadge = (priority) => {
    if (!priority) return null
    const priorityMap = {
      'LOW': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'MEDIUM': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'HIGH': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'CRITICAL': 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return `px-2 py-0.5 rounded text-xs font-semibold border ${priorityMap[priority] || priorityMap['MEDIUM']}`
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="loading-skeleton h-12 w-48 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card min-h-[320px]">
                  <div className="loading-skeleton h-8 w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="loading-skeleton h-24 w-full"></div>
                    <div className="loading-skeleton h-24 w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page-shell">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
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

  const drawerColumn = activeTask ? COLUMNS.find(column => column.id === activeTask.status) : null
  const alternateColumns = activeTask ? COLUMNS.filter(column => column.id !== activeTask.status) : []

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Flow runway
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black text-white flex-1">{project.title}</h1>
                  {project.job?.status && (
                    <span className="badge badge-primary">{project.job.status}</span>
                  )}
                  <Link to={`/projects/${id}`} className="btn btn-secondary text-sm">
                    List view
                  </Link>
                </div>
                <p className="text-white/70 text-base">Kanban board for this project</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-1">Total tasks</p>
                  <p className="text-2xl font-black text-white">{tasks.length}</p>
                  <p className="text-xs text-white/60">{stats.todo} in backlog</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-1">In progress</p>
                  <p className="text-2xl font-black text-white">{stats.inProgress}</p>
                  <p className="text-xs text-white/60">actively being built</p>
                </div>
                <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-1">Completed</p>
                  <p className="text-2xl font-black text-white">{stats.done}</p>
                  <p className="text-xs text-white/60">delivered features</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/projects/${id}`} className="btn btn-secondary text-sm">
                  Project detail
                </Link>
                <Link to={`/projects/${id}/documents/upload`} className="btn btn-secondary text-sm">
                  Extract tasks
                </Link>
              </div>
            </div>
            <div className="hero-media min-h-[280px]">
              <div className="hero-media-content space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Snapshot</p>
                  <h3 className="text-xl font-bold text-white">Workflow lanes</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm text-white/80">
                  {COLUMNS.map(column => (
                    <div key={column.id} className="text-center">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/50">{column.title}</p>
                      <p className="text-2xl font-black text-white">{getTasksByStatus(column.id).length}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/60">
                  Drag any card between columns to update status. Click into a card to see full details, watchers, and timeline.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLUMNS.map(column => {
              const columnTasks = getTasksByStatus(column.id)
              const isDraggedOver = draggedOverColumn === column.id

              return (
                <div
                  key={column.id}
                  className={`card min-h-[600px] transition-all ${
                    isDraggedOver ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-transparent' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Column Header */}
                  <div className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${column.color} shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white">{column.title}</h2>
                      <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="space-y-3">
                    {columnTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`p-4 bg-white/5 border-2 border-white/10 rounded-xl hover:border-violet-500/50 hover:shadow-lg transition-all cursor-move ${
                          updatingTaskId === task.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h3 className="font-bold text-white text-sm flex-1">{task.title}</h3>
                          {task.priority && (
                            <span className={getPriorityBadge(task.priority)}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-xs text-white/60 mb-3 line-clamp-2">{task.description}</p>
                        )}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.labels.slice(0, 3).map(label => (
                              <span
                                key={label.id}
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
                              >
                                {label.name}
                              </span>
                            ))}
                            {task.labels.length > 3 && (
                              <span className="px-2 py-0.5 rounded text-xs text-white/50">
                                +{task.labels.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {task.assignee.fullName?.charAt(0) || 'A'}
                              </div>
                              <span className="text-xs text-white/60">{task.assignee.fullName}</span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{task.estimatedHours}h</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <Link
                            to={`/projects/${id}`}
                            className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                          >
                            View Details →
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openTaskDrawer(task)
                            }}
                            className="text-xs text-white/70 hover:text-white/90 font-semibold"
                          >
                            Quick view
                          </button>
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="text-center py-12 text-white/40 text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {activeTask && showTaskDrawer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-6" onClick={closeTaskDrawer}>
            <div
              className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 bg-white/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeTaskDrawer}
                className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
              >
                ×
              </button>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-2">{drawerColumn?.title || 'Task'}</p>
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                {activeTask.title}
                {activeTask.priority && (
                  <span className={getPriorityBadge(activeTask.priority)}>{activeTask.priority}</span>
                )}
              </h3>
              <p className="text-white/70 text-sm mb-6">{activeTask.description || 'No description provided.'}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {activeTask.assignee && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Assignee</p>
                    <p className="text-white font-semibold">{activeTask.assignee.fullName}</p>
                  </div>
                )}
                {activeTask.dueDate && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Due date</p>
                    <p className="text-white font-semibold">
                      {new Date(activeTask.dueDate).toLocaleDateString([], { dateStyle: 'medium' })}
                    </p>
                  </div>
                )}
                {activeTask.estimatedHours && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Estimated hours</p>
                    <p className="text-white font-semibold">{activeTask.estimatedHours}h</p>
                  </div>
                )}
                <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-1">Status</p>
                  <p className="text-white font-semibold">{drawerColumn?.title || activeTask.status}</p>
                </div>
              </div>

              {activeTask.labels && activeTask.labels.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">Labels</p>
                  <div className="flex flex-wrap gap-2">
                    {activeTask.labels.map(label => (
                      <span
                        key={`${activeTask.id}-${label.id}`}
                        className="px-3 py-1 rounded-full text-xs font-semibold border"
                        style={{ borderColor: `${label.color || '#a5b4fc'}40`, color: label.color || '#a5b4fc' }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Quick actions</p>
                <div className="flex flex-wrap gap-3">
                  {alternateColumns.map(column => (
                    <button
                      key={`move-${column.id}`}
                      type="button"
                      onClick={() => {
                        updateTaskStatus(activeTask.id, column.id)
                        closeTaskDrawer()
                      }}
                      disabled={updatingTaskId === activeTask.id}
                      className="btn btn-secondary text-xs"
                    >
                      Move to {column.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={`/projects/${id}`} className="btn btn-primary text-sm">
                  Open in project view
                </Link>
                <button type="button" onClick={closeTaskDrawer} className="btn btn-secondary text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


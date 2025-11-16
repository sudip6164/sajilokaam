import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

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

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
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
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/projects/${id}`} className="text-violet-400 hover:text-violet-300 font-semibold mb-4 inline-flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Project Details
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-2">{project.title}</h1>
                <p className="text-white/70">Kanban Board View</p>
              </div>
              <Link to={`/projects/${id}`} className="btn btn-secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                List View
              </Link>
            </div>
          </div>

          {/* Kanban Board */}
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
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white text-sm flex-1">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-xs text-white/60 mb-3 line-clamp-2">{task.description}</p>
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
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-white/60">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <Link
                            to={`/projects/${id}`}
                            className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                          >
                            View Details →
                          </Link>
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
      </div>
    </div>
  )
}


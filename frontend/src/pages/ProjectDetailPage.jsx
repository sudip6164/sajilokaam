import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [submittingTask, setSubmittingTask] = useState(false)
  const { token } = useAuth()
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

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const title = formData.get('title')
    const description = formData.get('description')
    const status = formData.get('status') || 'TODO'
    const dueDate = formData.get('dueDate') || null

    setSubmittingTask(true)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
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

  const getStatusBadge = (status) => {
    const badges = {
      TODO: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning',
      DONE: 'badge badge-success'
    }
    return badges[status] || 'badge badge-gray'
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="loading-skeleton h-8 w-32 mb-6"></div>
          <div className="card">
            <div className="loading-skeleton h-8 w-64 mb-4"></div>
            <div className="loading-skeleton h-4 w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="card text-center py-12">
            <p className="text-red-500 text-lg">Project not found</p>
            <Link to="/projects" className="btn btn-primary mt-4 inline-block">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/projects" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>

          <div className="card mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {project.description || 'No description provided'}
            </p>
            {project.job && (
              <p className="text-sm text-gray-500">
                From job: {project.job.title}
              </p>
            )}
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tasks <span className="text-gray-500 font-normal">({tasks.length})</span>
              </h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="btn btn-primary"
              >
                {showTaskForm ? 'Cancel' : 'Add Task'}
              </button>
            </div>

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    placeholder="Task title"
                    disabled={submittingTask}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="input-field"
                    placeholder="Task description"
                    disabled={submittingTask}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select name="status" className="input-field" disabled={submittingTask}>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
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
                  className="btn btn-success"
                >
                  {submittingTask ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks yet. Create your first task above!</p>
            ) : (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.title}</h3>
                        {task.description && (
                          <p className="text-gray-600 mb-3 leading-relaxed">{task.description}</p>
                        )}
                        <div className="flex gap-4 items-center">
                          <span className={getStatusBadge(task.status)}>{task.status}</span>
                          {task.dueDate && (
                            <span className="text-sm text-gray-500">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

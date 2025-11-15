import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const { token } = useAuth()

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
      setError(err.message)
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

      await loadTasks()
      e.target.reset()
      setShowTaskForm(false)
    } catch (err) {
      alert('Failed to create task: ' + err.message)
    }
  }

  if (loading) return <div className="container mx-auto p-6">Loading...</div>
  if (error) return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>
  if (!project) return <div className="container mx-auto p-6">Project not found</div>

  return (
    <div className="container mx-auto p-6">
      <Link to="/projects" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Projects</Link>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
        {project.job && (
          <p className="text-sm text-gray-500">From job: {project.job.title}</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tasks ({tasks.length})</h2>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showTaskForm ? 'Cancel' : 'Add Task'}
          </button>
        </div>

        {showTaskForm && (
          <form onSubmit={handleTaskSubmit} className="mb-6 p-4 border rounded space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-2 border rounded"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-2 border rounded"
                placeholder="Task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select name="status" className="w-full px-4 py-2 border rounded">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Create Task
            </button>
          </form>
        )}

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet</p>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="border p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{task.title}</h3>
                    <p className="text-gray-600 mt-1">{task.description || 'No description'}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded">
                        {task.status}
                      </span>
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
  )
}


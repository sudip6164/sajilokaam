import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'

const STATUS_COLORS = {
  PLANNED: 'bg-slate-500/20 text-slate-200 border border-slate-500/30',
  ACTIVE: 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
  CANCELLED: 'bg-rose-500/10 text-rose-200 border border-rose-500/30'
}

export function SprintPlannerPage() {
  const { projectId } = useParams()
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [project, setProject] = useState(null)
  const [sprints, setSprints] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    goal: ''
  })

  useEffect(() => {
    loadProject()
    loadSprints()
    loadTasks()
  }, [projectId])

  const loadProject = async () => {
    try {
      const data = await api.projects.getById(projectId)
      setProject(data)
    } catch (err) {
      showError(err.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const loadSprints = async () => {
    try {
      const data = await api.sprints.getAll(projectId, token)
      setSprints(Array.isArray(data) ? data : [])
    } catch (err) {
      showError(err.message || 'Failed to load sprints')
    }
  }

  const loadTasks = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/projects/${projectId}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load tasks', err)
    }
  }

  const groupedSprints = useMemo(() => {
    const groups = { ACTIVE: [], PLANNED: [], COMPLETED: [], CANCELLED: [] }
    sprints.forEach(sprint => {
      const status = sprint.status || 'PLANNED'
      if (!groups[status]) {
        groups[status] = []
      }
      groups[status].push(sprint)
    })
    return groups
  }, [sprints])

  const handleCreateSprint = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      showError('Sprint name is required')
      return
    }
    if (!createForm.startDate || !createForm.endDate) {
      showError('Provide start and end dates')
      return
    }

    setCreating(true)
    try {
      await api.sprints.create(projectId, token, {
        name: createForm.name.trim(),
        description: createForm.description || null,
        startDate: createForm.startDate,
        endDate: createForm.endDate,
        goal: createForm.goal || null,
        status: 'PLANNED'
      })
      showSuccess('Sprint created')
      setShowCreateForm(false)
      setCreateForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        goal: ''
      })
      await loadSprints()
    } catch (err) {
      showError(err.message || 'Failed to create sprint')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (sprintId, status) => {
    try {
      await api.sprints.update(projectId, sprintId, token, { status })
      await loadSprints()
      showSuccess('Sprint updated')
    } catch (err) {
      showError(err.message || 'Failed to update sprint')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-6"></div>
            <div className="card h-[400px] loading-skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pattern py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Link to={`/projects/${projectId}`} className="text-violet-400 hover:text-violet-300 font-semibold mb-2 inline-flex items-center gap-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Project
              </Link>
              <h1 className="text-4xl font-extrabold text-white">{project?.title || 'Sprint Planner'}</h1>
              <p className="text-white/70">Plan iterations, define goals, and track progress.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
              Schedule Sprint
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {Object.entries(groupedSprints).map(([status, list]) => (
              <div key={status} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{status.replace('_', ' ')}</h2>
                  <span className="text-white/60 text-sm">{list.length} sprint{list.length === 1 ? '' : 's'}</span>
                </div>
                <div className="space-y-4">
                  {list.map(sprint => (
                    <div key={sprint.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-white font-semibold">{sprint.name}</p>
                        <select
                          className="input-field text-xs py-1"
                          value={sprint.status || 'PLANNED'}
                          onChange={(e) => handleStatusChange(sprint.id, e.target.value)}
                        >
                          {Object.keys(STATUS_COLORS).map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-white/60 text-xs mb-2">
                        {sprint.startDate} → {sprint.endDate}
                      </p>
                      {sprint.goal && (
                        <p className="text-white/70 text-sm mb-2">{sprint.goal}</p>
                      )}
                      {sprint.description && (
                        <p className="text-white/50 text-xs line-clamp-2">{sprint.description}</p>
                      )}
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div className="text-white/50 text-sm text-center py-6">
                      No sprints in this lane.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Backlog snapshot</h3>
                <p className="text-white/60 text-sm">Tasks not yet in flight</p>
              </div>
              <Link to={`/projects/${projectId}/kanban`} className="btn btn-secondary text-sm">
                Open Kanban
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {tasks.slice(0, 6).map(task => (
                <div key={task.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white font-semibold text-sm mb-1">{task.title}</p>
                  <p className="text-white/60 text-xs mb-2 line-clamp-2">{task.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Status: {task.status}</span>
                    {task.priority && <span>Priority: {task.priority}</span>}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-white/50 text-sm text-center py-6 md:col-span-2">
                  No tasks available. Create tasks from the project detail page.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Schedule new sprint</h3>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateSprint}>
              <div className="md:col-span-2">
                <label className="text-sm text-white/70 font-semibold mb-2 block">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  disabled={creating}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Start Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                  disabled={creating}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">End Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={creating}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-white/70 font-semibold mb-2 block">Sprint Goal</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={createForm.goal}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, goal: e.target.value }))}
                  disabled={creating}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-white/70 font-semibold mb-2 block">Notes</label>
                <textarea
                  className="input-field min-h-[80px]"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  disabled={creating}
                />
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Sprint'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


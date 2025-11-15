import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch('http://localhost:8080/api/projects', { headers })
      if (!res.ok) throw new Error('Failed to load projects')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container mx-auto p-6">Loading...</div>
  if (error) return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Projects</h1>
      <div className="grid gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet</p>
        ) : (
          projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-2">{project.description || 'No description'}</p>
              {project.job && (
                <p className="text-sm text-gray-500">From job: {project.job.title}</p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}


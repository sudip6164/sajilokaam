import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const res = await fetch('http://localhost:8080/api/jobs', { headers })
      if (!res.ok) throw new Error('Failed to load jobs')
      const data = await res.json()
      setJobs(Array.isArray(data) ? data : [])
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
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500">No jobs available</p>
        ) : (
          jobs.map(job => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-2">{job.description || 'No description'}</p>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                {job.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}


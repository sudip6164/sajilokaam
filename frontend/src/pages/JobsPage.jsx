import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const { error: showError } = useToast()

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
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'badge badge-success',
      CLOSED: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning'
    }
    return badges[status] || 'badge badge-gray'
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-8 w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-6 w-64 mb-2"></div>
                  <div className="loading-skeleton h-4 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Jobs</h1>
            <Link to="/jobs/new" className="btn btn-primary">
              Post New Job
            </Link>
          </div>
          
          {jobs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No jobs available</p>
              <Link to="/jobs/new" className="btn btn-primary inline-block">
                Post the first job
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map(job => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {job.description || 'No description provided'}
                      </p>
                      <span className={getStatusBadge(job.status)}>
                        {job.status}
                      </span>
                    </div>
                    <div className="ml-4 text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

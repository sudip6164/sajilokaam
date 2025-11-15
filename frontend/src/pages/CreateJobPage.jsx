import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function CreateJobPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, status })
      })

      if (!res.ok) {
        throw new Error('Failed to create job')
      }

      const job = await res.json()
      showSuccess('Job created successfully!')
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      showError(err.message || 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">Post a New Job</h1>
            <p className="page-subtitle">Create a job posting to find the perfect freelancer</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., Website Development, Logo Design, Content Writing"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Describe the job requirements, timeline, budget expectations, and any specific skills needed..."
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Be detailed to attract the right freelancers</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="OPEN">Open - Accepting applications</option>
                  <option value="CLOSED">Closed - No longer accepting</option>
                  <option value="IN_PROGRESS">In Progress - Work has started</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Job'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function JobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { token } = useAuth()

  useEffect(() => {
    loadJob()
    loadBids()
  }, [id])

  const loadJob = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`)
      if (!res.ok) throw new Error('Failed to load job')
      const data = await res.json()
      setJob(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBids = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}/bids`)
      if (res.ok) {
        const data = await res.json()
        setBids(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to load bids', err)
    }
  }

  if (loading) return <div className="container mx-auto p-6">Loading...</div>
  if (error) return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>
  if (!job) return <div className="container mx-auto p-6">Job not found</div>

  return (
    <div className="container mx-auto p-6">
      <Link to="/jobs" className="text-blue-600 hover:underline mb-4 inline-block">← Back to Jobs</Link>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <p className="text-gray-600 mb-4">{job.description || 'No description'}</p>
        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded">
          {job.status}
        </span>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Bids ({bids.length})</h2>
        {bids.length === 0 ? (
          <p className="text-gray-500">No bids yet</p>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid.id} className="border p-4 rounded">
                <p className="font-semibold">${bid.amount}</p>
                <p className="text-gray-600">{bid.message || 'No message'}</p>
                <span className="text-sm text-gray-500">{bid.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [acceptingBidId, setAcceptingBidId] = useState(null)
  const [submittingBid, setSubmittingBid] = useState(false)
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

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
      showError(err.message)
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

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const amount = formData.get('amount')
    const message = formData.get('message')

    setSubmittingBid(true)
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          message: message || '',
          status: 'PENDING'
        })
      })

      if (!res.ok) {
        throw new Error('Failed to submit bid')
      }

      showSuccess('Bid submitted successfully!')
      await loadBids()
      e.target.reset()
    } catch (err) {
      showError(err.message || 'Failed to submit bid')
    } finally {
      setSubmittingBid(false)
    }
  }

  const handleAcceptBid = async (bidId) => {
    const title = prompt('Enter project title:')
    if (!title) return

    const description = prompt('Enter project description (optional):') || ''

    setAcceptingBidId(bidId)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/accept-bid/${bidId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      })

      if (!res.ok) {
        throw new Error('Failed to accept bid')
      }

      const project = await res.json()
      showSuccess('Bid accepted! Project created.')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      showError(err.message || 'Failed to accept bid')
    } finally {
      setAcceptingBidId(null)
    }
  }

  const isJobOwner = job && profile && job.client && 
    (job.client.id === profile.id || (typeof job.client === 'object' && job.client.id === profile.id))

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge badge-warning',
      ACCEPTED: 'badge badge-success',
      REJECTED: 'badge badge-gray'
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

  if (!job) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="card text-center py-12">
            <p className="text-red-500 text-lg">Job not found</p>
            <Link to="/jobs" className="btn btn-primary mt-4 inline-block">
              Back to Jobs
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
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>

          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
                <span className="badge badge-primary">{job.status}</span>
              </div>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {job.description || 'No description provided'}
            </p>
          </div>

          {!isJobOwner && (
            <div className="card mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Place a Bid</h2>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    required
                    className="input-field"
                    placeholder="500.00"
                    disabled={submittingBid}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="input-field"
                    placeholder="Tell the client about your approach, timeline, and why you're the right fit..."
                    disabled={submittingBid}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="btn btn-success"
                >
                  {submittingBid ? 'Submitting...' : 'Submit Bid'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bids <span className="text-gray-500 font-normal">({bids.length})</span>
            </h2>
            {bids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {bids.map(bid => (
                  <div key={bid.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-900">${bid.amount}</span>
                          <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                        </div>
                        {bid.message && (
                          <p className="text-gray-600 mt-2 leading-relaxed">{bid.message}</p>
                        )}
                      </div>
                      {isJobOwner && bid.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={acceptingBidId === bid.id}
                          className="btn btn-primary ml-4"
                        >
                          {acceptingBidId === bid.id ? 'Accepting...' : 'Accept Bid'}
                        </button>
                      )}
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

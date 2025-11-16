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
  const [rejectingBidId, setRejectingBidId] = useState(null)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [selectedBidId, setSelectedBidId] = useState(null)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingJob, setEditingJob] = useState(false)
  const [deletingJob, setDeletingJob] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState('OPEN')
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

    if (parseFloat(amount) <= 0) {
      showError('Amount must be greater than 0')
      return
    }

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
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to submit bid')
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

  const openAcceptModal = (bidId) => {
    setSelectedBidId(bidId)
    setShowAcceptModal(true)
  }

  const handleAcceptBid = async () => {
    if (!projectTitle.trim()) {
      showError('Project title is required')
      return
    }

    setAcceptingBidId(selectedBidId)
    try {
      const res = await fetch(`http://localhost:8080/api/projects/accept-bid/${selectedBidId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: projectTitle, 
          description: projectDescription || '' 
        })
      })

      if (!res.ok) {
        throw new Error('Failed to accept bid')
      }

      const project = await res.json()
      showSuccess('Bid accepted! Project created.')
      setShowAcceptModal(false)
      navigate(`/projects/${project.id}`)
    } catch (err) {
      showError(err.message || 'Failed to accept bid')
    } finally {
      setAcceptingBidId(null)
    }
  }

  const handleRejectBid = async (bidId) => {
    setRejectingBidId(bidId)
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}/bids/${bidId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to reject bid')
      }

      showSuccess('Bid rejected successfully')
      await loadBids()
    } catch (err) {
      showError(err.message || 'Failed to reject bid')
    } finally {
      setRejectingBidId(null)
    }
  }

  const isJobOwner = job && profile && job.client && 
    (job.client.id === profile.id || (typeof job.client === 'object' && job.client.id === profile.id))

  const openEditModal = () => {
    setEditTitle(job.title)
    setEditDescription(job.description || '')
    setEditStatus(job.status)
    setShowEditModal(true)
  }

  const handleEditJob = async (e) => {
    e.preventDefault()
    setEditingJob(true)
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update job')
      }

      const updatedJob = await res.json()
      setJob(updatedJob)
      showSuccess('Job updated successfully!')
      setShowEditModal(false)
    } catch (err) {
      showError(err.message || 'Failed to update job')
    } finally {
      setEditingJob(false)
    }
  }

  const handleDeleteJob = async () => {
    setDeletingJob(true)
    try {
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to delete job')
      }

      showSuccess('Job deleted successfully!')
      navigate('/jobs')
    } catch (err) {
      showError(err.message || 'Failed to delete job')
    } finally {
      setDeletingJob(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      OPEN: 'badge badge-success',
      CLOSED: 'badge badge-gray',
      IN_PROGRESS: 'badge badge-warning',
      PENDING: 'badge badge-warning',
      ACCEPTED: 'badge badge-success',
      REJECTED: 'badge badge-gray'
    }
    return badges[status] || 'badge badge-gray'
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="loading-skeleton h-10 w-48 mb-8"></div>
            <div className="card">
              <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-4 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-16">
              <p className="text-red-500 text-lg font-semibold mb-4">Job not found</p>
              <Link to="/jobs" className="btn btn-primary inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold mb-8 inline-flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>

          <div className="card mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{job.title}</h1>
                    <span className={getStatusBadge(job.status)}>{job.status}</span>
                  </div>
                </div>
                {isJobOwner && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={openEditModal}
                      className="btn btn-secondary text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Job
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="btn btn-danger text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Job
                    </button>
                  </div>
                )}
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {job.description || 'No description provided'}
                </p>
                {job.client && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {job.client.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Posted by</p>
                      <p className="text-base font-bold text-gray-900">{job.client.fullName}</p>
                      <p className="text-xs text-gray-500">{job.client.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isJobOwner && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Place a Bid</h2>
              <form onSubmit={handleBidSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    placeholder="500.00"
                    disabled={submittingBid}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Tell the client about your approach, timeline, and why you're the right fit..."
                    disabled={submittingBid}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="btn btn-success w-full"
                >
                  {submittingBid ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Bid'
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Bids <span className="text-gray-500 font-normal">({bids.length})</span>
            </h2>
            {bids.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">No bids yet</p>
                {!isJobOwner && (
                  <p className="text-sm text-gray-400 mt-2">Be the first to place a bid!</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map(bid => (
                  <div key={bid.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-3xl font-extrabold text-gray-900">${bid.amount}</span>
                          <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                        </div>
                        {bid.freelancer && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {bid.freelancer.fullName?.charAt(0) || 'F'}
                            </div>
                            <span className="font-semibold">{bid.freelancer.fullName}</span>
                          </div>
                        )}
                        {bid.message && (
                          <p className="text-gray-600 leading-relaxed mt-3">{bid.message}</p>
                        )}
                      </div>
                      {isJobOwner && bid.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openAcceptModal(bid.id)}
                            disabled={acceptingBidId === bid.id || rejectingBidId === bid.id}
                            className="btn btn-primary whitespace-nowrap"
                          >
                            {acceptingBidId === bid.id ? 'Accepting...' : 'Accept Bid'}
                          </button>
                          <button
                            onClick={() => handleRejectBid(bid.id)}
                            disabled={acceptingBidId === bid.id || rejectingBidId === bid.id}
                            className="btn btn-danger whitespace-nowrap"
                          >
                            {rejectingBidId === bid.id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Bid Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Accept Bid & Create Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Website Development Project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Optional project description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAcceptBid}
                  disabled={acceptingBidId !== null || !projectTitle.trim()}
                  className="btn btn-primary flex-1"
                >
                  {acceptingBidId !== null ? 'Creating...' : 'Create Project'}
                </button>
                <button
                  onClick={() => {
                    setShowAcceptModal(false)
                    setProjectTitle('')
                    setProjectDescription('')
                  }}
                  className="btn btn-secondary"
                  disabled={acceptingBidId !== null}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Job</h3>
            <form onSubmit={handleEditJob} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="input-field"
                  placeholder="e.g., Website Development"
                  disabled={editingJob}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Describe the job requirements..."
                  disabled={editingJob}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="input-field"
                  disabled={editingJob}
                >
                  <option value="OPEN">Open - Accepting applications</option>
                  <option value="CLOSED">Closed - No longer accepting</option>
                  <option value="IN_PROGRESS">In Progress - Work has started</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={editingJob}
                  className="btn btn-primary flex-1"
                >
                  {editingJob ? 'Updating...' : 'Update Job'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  disabled={editingJob}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Job</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{job?.title}"? This action cannot be undone and will also delete all associated bids.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteJob}
                disabled={deletingJob}
                className="btn btn-danger flex-1"
              >
                {deletingJob ? 'Deleting...' : 'Delete Job'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
                disabled={deletingJob}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

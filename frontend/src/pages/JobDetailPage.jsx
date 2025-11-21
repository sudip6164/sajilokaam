import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

const EMPTY_PROPOSAL = {
  coverLetter: '',
  availability: '',
  timeline: '',
  deliverables: [],
  milestones: [],
  communicationPlan: '',
  attachmentLink: ''
}

const parseStructuredMessage = (message) => {
  if (!message) return null
  try {
    const parsed = JSON.parse(message)
    if (parsed && parsed.version === 1) {
      return parsed
    }
  } catch {
    return null
  }
  return null
}

const formatBudgetRange = (job) => {
  const min = job?.budgetMin != null ? Number(job.budgetMin) : null
  const max = job?.budgetMax != null ? Number(job.budgetMax) : null
  if (min != null && max != null) {
    return `Rs. ${min.toLocaleString()} - Rs. ${max.toLocaleString()}`
  }
  if (min != null) {
    return `From Rs. ${min.toLocaleString()}`
  }
  if (max != null) {
    return `Up to Rs. ${max.toLocaleString()}`
  }
  return 'Budget TBD'
}

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
  const [showCompareBids, setShowCompareBids] = useState(false)
  const [comparingBids, setComparingBids] = useState(false)
  const [comparisonBids, setComparisonBids] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  const [freelancerProfileStatus, setFreelancerProfileStatus] = useState(null)
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [bidAmount, setBidAmount] = useState('')
  const [proposal, setProposal] = useState(EMPTY_PROPOSAL)
  const [deliverableDraft, setDeliverableDraft] = useState('')
  const [milestoneDraft, setMilestoneDraft] = useState('')

  useEffect(() => {
    loadJob()
    loadBids()
    if (token && profile?.roles?.some(r => r.name === 'FREELANCER')) {
      checkIfSaved()
    }
  }, [id, token, profile])

  useEffect(() => {
    if (!token || !profile) {
      setFreelancerProfileStatus(null)
      return
    }

    let isMounted = true
    const loadProfileStatuses = async () => {
      try {
        if (profile.roles?.some(r => r.name === 'FREELANCER')) {
          const data = await api.profiles.freelancer.get(token)
          if (isMounted) {
            setFreelancerProfileStatus(data?.status || 'DRAFT')
          }
        } else {
          setFreelancerProfileStatus(null)
        }
      } catch (err) {
        console.warn('Unable to load verification status', err)
      }
    }

    loadProfileStatuses()
    return () => {
      isMounted = false
    }
  }, [token, profile])

  const loadJob = async () => {
    try {
      const data = await api.jobs.getById(id, token)
      if (!data || !data.id) {
        throw new Error('Invalid job data received')
      }
      setJob(data)
    } catch (err) {
      console.error('Error loading job:', err)
      if (err.message && err.message.includes('404') || err.message && err.message.includes('not found')) {
        showError('Job not found')
        setTimeout(() => navigate('/jobs'), 2000)
      } else {
        showError(err.message || 'Failed to load job')
      }
      setLoading(false)
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

  const handleCompareBidsToggle = async () => {
    if (!token) {
      showError('Sign in to compare bids')
      return
    }

    if (showCompareBids) {
      setShowCompareBids(false)
      setComparisonBids([])
      return
    }

    setComparingBids(true)
    try {
      const compared = await api.jobs.compareBids(id, token)
      setComparisonBids(Array.isArray(compared) ? compared : [])
      setShowCompareBids(true)
    } catch (err) {
      console.error('Failed to load bid comparison', err)
      showError(err.message || 'Failed to load bid comparison')
    } finally {
      setComparingBids(false)
    }
  }

  const checkIfSaved = async () => {
    try {
      const saved = await api.savedJobs.check(id, token)
      setIsSaved(saved)
    } catch (err) {
      console.error('Failed to check if job is saved', err)
    }
  }

  const handleSaveJob = async () => {
    if (!token) {
      showError('Please login to save jobs')
      return
    }

    setSavingJob(true)
    try {
      if (isSaved) {
        await api.savedJobs.unsave(id, token)
        setIsSaved(false)
        showSuccess('Job removed from saved')
      } else {
        await api.savedJobs.save(id, token)
        setIsSaved(true)
        showSuccess('Job saved successfully')
      }
    } catch (err) {
      showError(err.message || 'Failed to save job')
    } finally {
      setSavingJob(false)
    }
  }

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      showError('Please login to submit a proposal')
      return
    }

    if (!(profile?.roles?.some(r => r.name === 'FREELANCER'))) {
      showError('Only freelancer accounts can submit bids')
      return
    }

    if (freelancerProfileStatus !== 'APPROVED') {
      showError('Your freelancer profile must be approved before bidding.')
      return
    }

    const numericAmount = parseFloat(bidAmount)
    if (!numericAmount || numericAmount <= 0) {
      showError('Amount must be greater than 0')
      return
    }

    if (!proposal.coverLetter.trim()) {
      showError('Add a cover letter or summary for the client')
      return
    }

    setSubmittingBid(true)
    try {
      const structuredMessage = JSON.stringify({
        version: 1,
        coverLetter: proposal.coverLetter,
        availability: proposal.availability,
        timeline: proposal.timeline,
        deliverables: proposal.deliverables,
        milestones: proposal.milestones,
        communicationPlan: proposal.communicationPlan,
        attachmentLink: proposal.attachmentLink
      })

      const res = await fetch(`http://localhost:8080/api/jobs/${id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numericAmount,
          message: structuredMessage,
          status: 'PENDING'
        })
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Failed to submit bid')
      }

      showSuccess('Proposal submitted successfully!')
      await loadBids()
      setBidAmount('')
      setProposal(EMPTY_PROPOSAL)
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
  const isFreelancer = profile?.roles?.some(r => r.name === 'FREELANCER')
  const canSubmitBid = isFreelancer && !isJobOwner && freelancerProfileStatus === 'APPROVED'
  const friendlyFreelancerStatus = (freelancerProfileStatus || 'INCOMPLETE').replace(/_/g, ' ')
  const postedDate = job?.createdAt ? new Date(job.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : null
  const heroStats = job ? [
    {
      label: 'Budget range',
      value: job.budgetMin != null || job.budgetMax != null ? formatBudgetRange(job) : 'TBD',
      detail: job.jobType ? job.jobType.replace('_', ' ') : 'Contract type'
    },
    {
      label: 'Experience',
      value: job.experienceLevel || 'Any level',
      detail: 'preferred profile'
    },
    {
      label: 'Proposals',
      value: bids.length,
      detail: 'submitted bids'
    }
  ] : []

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
      <div className="page-shell">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="loading-skeleton h-10 w-48 rounded-2xl" />
            <div className="hero-grid min-h-[260px]">
              <div className="space-y-4">
                <div className="loading-skeleton h-6 w-1/3" />
                <div className="loading-skeleton h-10 w-3/4" />
                <div className="loading-skeleton h-4 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="loading-skeleton h-20 rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page-shell">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-16 border border-white/10 bg-white/5">
              <p className="text-red-400 text-lg font-semibold mb-4">Job not found</p>
              <Link to="/jobs" className="btn btn-primary inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto space-y-10">
          <Link to="/jobs" className="text-violet-400 hover:text-violet-300 font-semibold mb-8 inline-flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs
          </Link>

          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Opportunity
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="text-4xl font-black text-white flex-1">{job.title}</h1>
                  {isFreelancer && !isJobOwner && (
                    <button
                      onClick={handleSaveJob}
                      disabled={savingJob}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      title={isSaved ? 'Remove from saved' : 'Save job'}
                    >
                      <svg
                        className={`w-5 h-5 ${isSaved ? 'text-yellow-400 fill-yellow-400' : 'text-white/70'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className={getStatusBadge(job.status)}>{job.status}</span>
                  {job.category && (
                    <span className="badge badge-gray">{job.category.name}</span>
                  )}
                  {job.jobType && (
                    <span className="badge badge-primary">{job.jobType.replace('_', ' ')}</span>
                  )}
                  {postedDate && (
                    <span className="badge badge-secondary">Posted {postedDate}</span>
                  )}
                </div>
              </div>
              <p className="text-white/70 text-lg leading-relaxed">
                {job.description || 'No description provided'}
              </p>
              <div className="flex flex-wrap gap-3">
                {isJobOwner ? (
                  <>
                    <button onClick={openEditModal} className="btn btn-secondary text-sm">
                      Edit job
                    </button>
                    <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger text-sm">
                      Delete job
                    </button>
                  </>
                ) : (
                  <>
                    {isFreelancer && (
                      <a href="#proposal" className="btn btn-primary">
                        Submit proposal
                      </a>
                    )}
                    <button onClick={handleSaveJob} disabled={savingJob || !isFreelancer} className="btn btn-secondary">
                      {isSaved ? 'Saved' : 'Save job'}
                    </button>
                  </>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {heroStats.map(stat => (
                  <div key={stat.label} className="p-4 rounded-2xl border border-white/10 bg-white/5">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-media min-h-[320px]">
              <div className="hero-media-content space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Client</p>
                  {job.client ? (
                    <>
                      <h3 className="text-xl font-bold text-white">{job.client.fullName}</h3>
                      <p className="text-sm text-white/70">{job.client.email}</p>
                    </>
                  ) : (
                    <h3 className="text-xl font-bold text-white">Hidden client</h3>
                  )}
                </div>
                <div className="space-y-2 text-sm text-white/80">
                  {job.expiresAt && <p>Closes {new Date(job.expiresAt).toLocaleDateString([], { dateStyle: 'medium' })}</p>}
                  {job.durationHours && <p>Estimated duration: {job.durationHours} hours</p>}
                  <p>Bids in review: {bids.length}</p>
                </div>
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/60 mb-2">Focus skills</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {job.requiredSkills.slice(0, 4).map(skill => (
                        <span key={skill.id} className="px-3 py-1 rounded-full border border-white/20 text-white/80">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {job.category && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Category</p>
                <p className="text-base font-bold text-white">{job.category.name}</p>
              </div>
            )}
            {job.jobType && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Job type</p>
                <p className="text-base font-bold text-white">{job.jobType.replace('_', ' ')}</p>
              </div>
            )}
            {(job.budgetMin != null || job.budgetMax != null) && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Budget</p>
                <p className="text-base font-bold text-white">{formatBudgetRange(job)}</p>
              </div>
            )}
            {job.experienceLevel && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Experience level</p>
                <p className="text-base font-bold text-white">{job.experienceLevel} level</p>
              </div>
            )}
            {job.durationHours && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Estimated duration</p>
                <p className="text-base font-bold text-white">{job.durationHours} hours</p>
              </div>
            )}
            {job.expiresAt && (
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-sm font-semibold text-white/60 mb-1">Closes</p>
                <p className="text-base font-bold text-white">
                  {new Date(job.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-white/60 mb-3">Required skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map(skill => (
                  <span key={skill.id} className="badge badge-secondary">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.client && (
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                {job.client.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white/60">Posted by</p>
                <p className="text-base font-bold text-white">{job.client.fullName}</p>
                <p className="text-xs text-white/50">{job.client.email}</p>
              </div>
            </div>
          )}

          {!isJobOwner && isFreelancer && (
            <div id="proposal" className="card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Craft Your Proposal</h2>
              {freelancerProfileStatus !== 'APPROVED' && (
                <div className="mb-5 p-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-sm text-yellow-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold">Profile approval required</p>
                    <p className="text-yellow-100/80">
                      Your freelancer profile is currently {friendlyFreelancerStatus}. Complete onboarding to unlock bidding.
                    </p>
                  </div>
                  <Link to="/onboarding/freelancer" className="btn btn-secondary text-sm whitespace-nowrap">
                    Go to Onboarding
                  </Link>
                </div>
              )}
              <form onSubmit={handleBidSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">
                      Bid Amount (NPR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input-field"
                      placeholder="50000"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={submittingBid || !canSubmitBid}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">
                      Availability window
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Immediately / Next week / 20 hrs per week"
                      value={proposal.availability}
                      onChange={(e) => setProposal(prev => ({ ...prev, availability: e.target.value }))}
                      disabled={submittingBid || !canSubmitBid}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Open with outcomes, relevant case-studies, collaboration approach..."
                    value={proposal.coverLetter}
                    onChange={(e) => setProposal(prev => ({ ...prev, coverLetter: e.target.value }))}
                    disabled={submittingBid || !canSubmitBid}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">
                      Timeline & milestones
                    </label>
                    <textarea
                      rows={4}
                      className="input-field"
                      placeholder="Week 1: Research, Week 2: Prototype, Week 3: Final delivery..."
                      value={proposal.timeline}
                      onChange={(e) => setProposal(prev => ({ ...prev, timeline: e.target.value }))}
                      disabled={submittingBid || !canSubmitBid}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">
                      Collaboration & communication
                    </label>
                    <textarea
                      rows={4}
                      className="input-field"
                      placeholder="Daily Slack standups, weekly demos, availability in GMT+5:45..."
                      value={proposal.communicationPlan}
                      onChange={(e) => setProposal(prev => ({ ...prev, communicationPlan: e.target.value }))}
                      disabled={submittingBid || !canSubmitBid}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Key deliverables</label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="e.g., Responsive marketing site w/ CMS"
                      value={deliverableDraft}
                      onChange={(e) => setDeliverableDraft(e.target.value)}
                      disabled={submittingBid || !canSubmitBid}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (!deliverableDraft.trim()) return
                        setProposal(prev => ({ ...prev, deliverables: [...prev.deliverables, deliverableDraft.trim()] }))
                        setDeliverableDraft('')
                      }}
                      disabled={submittingBid || !canSubmitBid}
                    >
                      Add
                    </button>
                  </div>
                  {proposal.deliverables.length > 0 && (
                    <ul className="space-y-2">
                      {proposal.deliverables.map((item, index) => (
                        <li key={`${item}-${index}`} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2 text-sm text-white/80">
                          <span>{item}</span>
                          <button
                            type="button"
                            className="text-white/50 hover:text-white"
                            onClick={() => setProposal(prev => ({
                              ...prev,
                              deliverables: prev.deliverables.filter((_, idx) => idx !== index)
                            }))}
                            disabled={submittingBid || !canSubmitBid}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Milestone plan</label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder="Milestone description"
                      value={milestoneDraft}
                      onChange={(e) => setMilestoneDraft(e.target.value)}
                      disabled={submittingBid || !canSubmitBid}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        if (!milestoneDraft.trim()) return
                        setProposal(prev => ({ ...prev, milestones: [...prev.milestones, milestoneDraft.trim()] }))
                        setMilestoneDraft('')
                      }}
                      disabled={submittingBid || !canSubmitBid}
                    >
                      Add
                    </button>
                  </div>
                  {proposal.milestones.length > 0 && (
                    <ol className="list-decimal list-inside text-white/80 space-y-1 text-sm">
                      {proposal.milestones.map((milestone, index) => (
                        <li key={`${milestone}-${index}`} className="flex items-center justify-between gap-2">
                          <span>{milestone}</span>
                          <button
                            type="button"
                            className="text-white/50 hover:text-white"
                            onClick={() => setProposal(prev => ({
                              ...prev,
                              milestones: prev.milestones.filter((_, idx) => idx !== index)
                            }))}
                            disabled={submittingBid || !canSubmitBid}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-white/90 mb-2">Attachment or portfolio link</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://yourwork.com/case-study"
                    value={proposal.attachmentLink}
                    onChange={(e) => setProposal(prev => ({ ...prev, attachmentLink: e.target.value }))}
                    disabled={submittingBid || !canSubmitBid}
                  />
                  <p className="text-xs text-white/40 mt-1">Share a Cloud folder, Loom demo, or public portfolio entry.</p>
                </div>

                <button
                  type="submit"
                  disabled={submittingBid || !canSubmitBid}
                  className={`btn ${canSubmitBid ? 'btn-success' : 'btn-secondary opacity-60 cursor-not-allowed'} w-full`}
                >
                  {submittingBid ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : canSubmitBid ? (
                    'Submit Proposal'
                  ) : (
                    'Awaiting Approval'
                  )}
                </button>
              </form>
            </div>
          )}

          {!isJobOwner && !isFreelancer && (
            <div className="card mb-8 border border-white/10 bg-white/5">
              <h2 className="text-2xl font-bold text-white mb-4">Proposals are for freelancers</h2>
              <p className="text-white/70">
                Switch to a freelancer account or create one to submit proposals on projects. Clients can manage postings and review bids only.
              </p>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Bids <span className="text-white/60 font-normal">({bids.length})</span>
              </h2>
              {isJobOwner && bids.length > 1 && (
                <button
                  onClick={handleCompareBidsToggle}
                  className="btn btn-secondary"
                  disabled={comparingBids}
                >
                  {comparingBids ? 'Loading...' : showCompareBids ? 'Close Comparison' : 'Compare Bids'}
                </button>
              )}
            </div>
            {bids.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/70 text-lg">No bids yet</p>
                {!isJobOwner && (
                  <p className="text-sm text-white/50 mt-2">Be the first to place a bid!</p>
                )}
              </div>
            ) : (
              <>
                {showCompareBids && (
                  <div className="mb-6 space-y-4">
                    <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                      <p className="text-white/70 text-sm">
                        <strong className="text-white">Bid comparison</strong> · Sorted by amount with freelancer insights
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                      {comparisonBids.length > 0 ? (
                        <table className="min-w-full text-left text-sm text-white/80">
                          <thead>
                            <tr className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                              <th className="px-4 py-3">Freelancer</th>
                              <th className="px-4 py-3">Experience</th>
                              <th className="px-4 py-3">Bid Amount</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Submitted</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonBids.map(bid => (
                              <tr key={bid.bidId} className="border-t border-white/5">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-white">{bid.freelancerName || 'Unknown talent'}</p>
                                  <p className="text-xs text-white/50">{bid.freelancerEmail || '—'}</p>
                                </td>
                                <td className="px-4 py-3 capitalize">
                                  {bid.experienceLevel ? bid.experienceLevel.replace(/_/g, ' ').toLowerCase() : '—'}
                                </td>
                                <td className="px-4 py-3 font-semibold text-white">
                                  Rs. {Number(bid.amount || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                                </td>
                                <td className="px-4 py-3">
                                  {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    className="text-xs text-violet-300 hover:text-violet-200"
                                    onClick={() => showSuccess(`Pin ${bid.freelancerName || 'this freelancer'} in your shortlist`)}
                                  >
                                    Shortlist →
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-center text-white/60">
                          No comparable bids yet. Invite more freelancers to unlock insights.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  {bids.map(bid => {
                    const structured = parseStructuredMessage(bid.message)
                    return (
                      <div key={bid.id} className="border-2 border-white/10 rounded-xl p-6 hover:border-violet-500/50 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <span className="text-3xl font-extrabold text-white">Rs. {Number(bid.amount).toLocaleString()}</span>
                              <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                            </div>
                            {bid.freelancer && (
                              <div className="flex items-center gap-2 mb-3 text-sm text-white/60">
                                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {bid.freelancer.fullName?.charAt(0) || 'F'}
                                </div>
                                <span className="font-semibold">{bid.freelancer.fullName}</span>
                              </div>
                            )}
                            {structured ? (
                              <div className="space-y-3 text-sm text-white/80">
                                <section>
                                  <p className="text-white/60 text-xs uppercase">Cover Letter</p>
                                  <p className="leading-relaxed">{structured.coverLetter || '—'}</p>
                                </section>
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-white/50 text-xs uppercase mb-1">Availability</p>
                                    <p>{structured.availability || '—'}</p>
                                  </div>
                                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <p className="text-white/50 text-xs uppercase mb-1">Timeline</p>
                                    <p>{structured.timeline || '—'}</p>
                                  </div>
                                </div>
                                {structured.deliverables?.length > 0 && (
                                  <div>
                                    <p className="text-white/60 text-xs uppercase mb-1">Deliverables</p>
                                    <ul className="list-disc list-inside space-y-1 text-white/80">
                                      {structured.deliverables.map((item, index) => (
                                        <li key={`${item}-${index}`}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {structured.milestones?.length > 0 && (
                                  <div>
                                    <p className="text-white/60 text-xs uppercase mb-1">Milestones</p>
                                    <ol className="list-decimal list-inside space-y-1 text-white/80">
                                      {structured.milestones.map((item, index) => (
                                        <li key={`${item}-${index}`}>{item}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}
                                {structured.communicationPlan && (
                                  <div>
                                    <p className="text-white/60 text-xs uppercase mb-1">Communication</p>
                                    <p>{structured.communicationPlan}</p>
                                  </div>
                                )}
                                {structured.attachmentLink && (
                                  <a
                                    href={structured.attachmentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-violet-300 text-xs underline"
                                  >
                                    View linked asset
                                  </a>
                                )}
                              </div>
                            ) : (
                              <p className="text-white/70 leading-relaxed mt-3">{bid.message}</p>
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
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Accept Bid Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Accept Bid & Create Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
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
                <label className="block text-sm font-bold text-white/90 mb-2">Project Description</label>
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
            <h3 className="text-2xl font-bold text-white mb-6">Edit Job</h3>
            <form onSubmit={handleEditJob} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white/90 mb-2">
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
                <label className="block text-sm font-bold text-white/90 mb-2">Description</label>
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
                <label className="block text-sm font-bold text-white/90 mb-2">Status</label>
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
            <h3 className="text-2xl font-bold text-white mb-4">Delete Job</h3>
            <p className="text-white/70 mb-6">
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

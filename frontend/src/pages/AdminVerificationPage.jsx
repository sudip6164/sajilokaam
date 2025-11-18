import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

const STATUS_STYLES = {
  UNDER_REVIEW: 'bg-amber-500/10 text-amber-200 border border-amber-500/40',
  APPROVED: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40',
  REJECTED: 'bg-rose-500/10 text-rose-100 border border-rose-500/40',
  NEEDS_UPDATE: 'bg-yellow-500/10 text-yellow-100 border border-yellow-500/40',
  SUBMITTED: 'bg-blue-500/10 text-blue-100 border border-blue-500/40'
}

const PROFILE_LABELS = {
  FREELANCER: 'Freelancer',
  CLIENT: 'Client'
}

const decisionOptions = [
  { value: 'APPROVED', label: 'Approve profile' },
  { value: 'NEEDS_UPDATE', label: 'Needs revision' },
  { value: 'REJECTED', label: 'Reject profile' }
]

export function AdminVerificationPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [loadingQueue, setLoadingQueue] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [filterType, setFilterType] = useState('ALL')
  const [selectedSummary, setSelectedSummary] = useState(null)
  const [profileDetail, setProfileDetail] = useState(null)
  const [documents, setDocuments] = useState([])
  const [decision, setDecision] = useState('APPROVED')
  const [verificationNotes, setVerificationNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submittingDecision, setSubmittingDecision] = useState(false)

  useEffect(() => {
    if (token) {
      loadPendingProfiles()
    }
  }, [token])

  const loadPendingProfiles = async () => {
    setLoadingQueue(true)
    try {
      const data = await api.profiles.admin.getPending(token)
      const sorted = (data || []).sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
        return dateB - dateA
      })
      setPendingProfiles(sorted)
      if (sorted.length > 0) {
        selectProfile(sorted[0])
      } else {
        setSelectedSummary(null)
        setProfileDetail(null)
        setDocuments([])
      }
    } catch (err) {
      showError(err.message || 'Failed to load pending profiles')
    } finally {
      setLoadingQueue(false)
    }
  }

  const selectProfile = async (summary) => {
    setSelectedSummary(summary)
    setProfileDetail(null)
    setDocuments([])
    setDecision('APPROVED')
    setVerificationNotes('')
    setRejectionReason('')
    if (!summary) return
    setLoadingDetail(true)
    try {
      const detail = summary.profileType === 'FREELANCER'
        ? await api.profiles.admin.getFreelancerById(summary.profileId, token)
        : await api.profiles.admin.getClientById(summary.profileId, token)
      setProfileDetail(detail)

      const docs = await api.profiles.admin.getDocuments(summary.profileType, summary.profileId, token)
      setDocuments(docs || [])
    } catch (err) {
      showError(err.message || 'Failed to load profile details')
    } finally {
      setLoadingDetail(false)
    }
  }

  const filteredProfiles = useMemo(() => {
    if (filterType === 'ALL') {
      return pendingProfiles
    }
    return pendingProfiles.filter(profile => profile.profileType === filterType)
  }, [pendingProfiles, filterType])

  const formatDate = (isoDate) => {
    if (!isoDate) return '—'
    return new Date(isoDate).toLocaleString()
  }

  const getStatusClass = (status) => STATUS_STYLES[status] || 'bg-white/5 text-white border border-white/10'

  const handleDecisionSubmit = async () => {
    if (!selectedSummary) return
    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      showError('Provide a rejection reason before rejecting the profile')
      return
    }

    setSubmittingDecision(true)
    try {
      await api.profiles.admin.review(
        selectedSummary.profileId,
        token,
        {
          profileType: selectedSummary.profileType,
          decision,
          verificationNotes: verificationNotes || undefined,
          rejectionReason: rejectionReason || undefined
        }
      )
      showSuccess('Decision recorded')
      setPendingProfiles(prev => prev.filter(item => item.profileId !== selectedSummary.profileId))
      setSelectedSummary(null)
      setProfileDetail(null)
      setDocuments([])
    } catch (err) {
      showError(err.message || 'Failed to submit decision')
    } finally {
      setSubmittingDecision(false)
    }
  }

  return (
    <div className="min-h-screen bg-pattern py-10">
      <div className="container-custom">
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="page-title">Profile Verification Queue</h1>
            <p className="page-subtitle">Review submissions from freelancers and clients before they join the marketplace</p>
          </div>
          <div className="flex gap-2">
            {['ALL', 'FREELANCER', 'CLIENT'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  filterType === type ? 'bg-white text-slate-900' : 'bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {type === 'ALL' ? 'All Profiles' : PROFILE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          <aside className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm">Pending reviews</p>
                  <p className="text-3xl font-bold text-white">{pendingProfiles.length}</p>
                </div>
                <button
                  onClick={loadPendingProfiles}
                  className="btn btn-secondary text-xs"
                  disabled={loadingQueue}
                >
                  {loadingQueue ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              <p className="text-xs text-white/50">
                Only profiles marked as <span className="text-white font-semibold">Under Review</span> appear here.
              </p>
            </div>

            <div className="card space-y-3 max-h-[65vh] overflow-y-auto">
              {loadingQueue ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(item => (
                    <div key={item} className="bg-white/5 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-white/10 rounded mb-2" />
                      <div className="h-3 bg-white/5 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70 text-sm">No profiles in this queue.</p>
                  <p className="text-white/40 text-xs mt-1">As soon as someone submits, it will appear here.</p>
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <button
                    key={profile.profileId}
                    onClick={() => selectProfile(profile)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedSummary?.profileId === profile.profileId
                        ? 'border-violet-500/60 bg-violet-500/10'
                        : 'border-white/5 bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{profile.displayName || profile.userEmail}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${getStatusClass(profile.status)}`}>
                        {profile.profileType === 'FREELANCER' ? 'Freelancer' : 'Client'}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs">{profile.userEmail}</p>
                    <p className="text-white/40 text-[10px] mt-2">
                      Submitted {profile.submittedAt ? new Date(profile.submittedAt).toLocaleDateString() : '—'}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="space-y-6">
            {!selectedSummary ? (
              <div className="card text-center py-16">
                <p className="text-white/60">Select a profile from the queue to review the submission.</p>
              </div>
            ) : (
              <>
                <div className="card">
                  {loadingDetail || !profileDetail ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-6 bg-white/5 rounded w-1/3" />
                      <div className="h-4 bg-white/5 rounded" />
                      <div className="h-4 bg-white/5 rounded w-2/3" />
                      <div className="h-24 bg-white/5 rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-white/60">Reviewing</p>
                          <h2 className="text-2xl font-bold text-white">{selectedSummary.displayName || selectedSummary.userEmail}</h2>
                          <p className="text-white/60 text-sm">{selectedSummary.userEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-xs">Submitted</p>
                          <p className="text-white font-semibold">{formatDate(selectedSummary.submittedAt)}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 mt-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Profile Type</p>
                          <p className="text-white font-semibold">{PROFILE_LABELS[selectedSummary.profileType]}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Current Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(profileDetail.status)}`}>
                            {profileDetail.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Profile Snapshot</h3>
                        {selectedSummary.profileType === 'FREELANCER' ? (
                          <div className="space-y-3">
                            <InfoRow label="Headline" value={profileDetail.headline || '—'} />
                            <InfoRow label="Overview" value={profileDetail.overview || '—'} multiline />
                            <InfoRow label="Primary skills" value={profileDetail.primarySkills || '—'} />
                            <div className="grid md:grid-cols-2 gap-3">
                              <InfoRow label="Experience level" value={profileDetail.experienceLevel || '—'} />
                              <InfoRow label="Availability" value={profileDetail.availability || '—'} />
                              <InfoRow label="Hourly rate" value={formatMoney(profileDetail.hourlyRate)} />
                              <InfoRow label="Location" value={`${profileDetail.locationCity || ''} ${profileDetail.locationCountry || ''}`.trim() || '—'} />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <InfoRow label="Company" value={profileDetail.companyName || '—'} />
                            <InfoRow label="Industry" value={profileDetail.industry || '—'} />
                            <InfoRow label="Hiring needs" value={profileDetail.hiringNeeds || '—'} multiline />
                            <div className="grid md:grid-cols-2 gap-3">
                              <InfoRow label="Budget range" value={formatBudget(profileDetail)} />
                              <InfoRow label="Preferred contract" value={profileDetail.preferredContractType || '—'} />
                              <InfoRow label="Company size" value={profileDetail.companySize || '—'} />
                              <InfoRow label="Location" value={`${profileDetail.locationCity || ''} ${profileDetail.locationCountry || ''}`.trim() || '—'} />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Supporting Documents</h3>
                  {documents.length === 0 ? (
                    <p className="text-white/60 text-sm">No documents uploaded with this submission.</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map(doc => (
                        <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                          <div>
                            <p className="text-white font-semibold text-sm">{doc.documentType || 'Document'}</p>
                            <p className="text-white/60 text-xs">{doc.fileName}</p>
                            {doc.fileUrl && (
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-violet-300 text-xs underline">
                                View file
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-white/50 text-[11px] uppercase mb-1">Uploaded</p>
                            <p className="text-white text-xs">{formatDate(doc.uploadedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Decision</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/70 font-semibold mb-2 block">Select outcome</label>
                      <select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        className="input-field"
                      >
                        {decisionOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-white/70 font-semibold mb-2 block">
                        Reviewer notes (visible to applicant)
                      </label>
                      <textarea
                        className="input-field min-h-[120px]"
                        placeholder="Explain the decision or requests for updates..."
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                      />
                    </div>
                    {decision === 'REJECTED' && (
                      <div>
                        <label className="text-sm text-white/70 font-semibold mb-2 block">Rejection reason (required)</label>
                        <textarea
                          className="input-field min-h-[100px]"
                          placeholder="Provide a concise reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleDecisionSubmit}
                        disabled={submittingDecision || loadingDetail}
                        className="btn btn-primary"
                      >
                        {submittingDecision ? 'Saving...' : 'Finalize Decision'}
                      </button>
                      {selectedSummary?.profileType === 'FREELANCER' && profileDetail?.portfolioUrl && (
                        <a
                          href={profileDetail.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                        >
                          Open Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, multiline }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{label}</p>
      <p className={`text-white ${multiline ? 'whitespace-pre-wrap' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function formatMoney(amount) {
  if (!amount && amount !== 0) return '—'
  try {
    return `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } catch {
    return amount
  }
}

function formatBudget(profileDetail) {
  if (!profileDetail?.averageBudgetMin && !profileDetail?.averageBudgetMax) return '—'
  const min = profileDetail.averageBudgetMin ? Number(profileDetail.averageBudgetMin).toLocaleString() : '?'
  const max = profileDetail.averageBudgetMax ? Number(profileDetail.averageBudgetMax).toLocaleString() : '?'
  return `Rs. ${min} - Rs. ${max}`
}


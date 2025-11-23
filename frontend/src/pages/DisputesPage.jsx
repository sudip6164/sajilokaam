import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import { gradients } from '../theme/designSystem'

const DISPUTE_TYPE_LABELS = {
  REFUND_REQUEST: 'Refund Request',
  PAYMENT_ISSUE: 'Payment Issue',
  SERVICE_DISPUTE: 'Service Dispute',
  OTHER: 'Other'
}

const DISPUTE_STATUS_COLORS = {
  OPEN: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  IN_REVIEW: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  RESOLVED: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  CLOSED: 'bg-gray-500/20 text-gray-200 border-gray-500/30',
  REJECTED: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
}

const DISPUTE_RESOLUTION_STATUSES = ['RESOLVED', 'REJECTED', 'CLOSED']

export function DisputesPage() {
  const { token, profile } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState(null)
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [resolutionForm, setResolutionForm] = useState({ status: 'RESOLVED', resolution: '' })
  const [resolving, setResolving] = useState(false)

  const isAdmin = profile?.roles?.some(r => r.name === 'ADMIN')

  useEffect(() => {
    if (token) {
      loadDisputes()
    }
  }, [token])

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const data = isAdmin 
        ? await api.disputes.getAll(token)
        : await api.disputes.getMine(token)
      setDisputes(data || [])
    } catch (err) {
      showError(err.message || 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionForm.resolution.trim()) {
      showError('Please provide a resolution')
      return
    }

    setResolving(true)
    try {
      await api.disputes.resolve(selectedDispute.id, token, resolutionForm)
      showSuccess('Dispute resolved successfully')
      setShowResolutionModal(false)
      setSelectedDispute(null)
      setResolutionForm({ status: 'RESOLVED', resolution: '' })
      await loadDisputes()
    } catch (err) {
      showError(err.message || 'Failed to resolve dispute')
    } finally {
      setResolving(false)
    }
  }

  const openResolutionModal = (dispute) => {
    setSelectedDispute(dispute)
    setResolutionForm({ 
      status: dispute.status === 'OPEN' ? 'RESOLVED' : dispute.status,
      resolution: dispute.resolution || ''
    })
    setShowResolutionModal(true)
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A'
    return `₨${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openDisputes = disputes.filter(d => d.status === 'OPEN').length
  const inReviewDisputes = disputes.filter(d => d.status === 'IN_REVIEW').length
  const resolvedDisputes = disputes.filter(d => DISPUTE_RESOLUTION_STATUSES.includes(d.status)).length

  const heroStats = [
    {
      label: 'Open',
      value: openDisputes,
      accent: 'from-amber-500 to-orange-500'
    },
    {
      label: 'In Review',
      value: inReviewDisputes,
      accent: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Resolved',
      value: resolvedDisputes,
      accent: 'from-emerald-500 to-teal-500'
    }
  ]

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="card">
              <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
              <div className="loading-skeleton h-4 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {isAdmin ? 'Admin Console' : 'Payment Center'}
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Payment <span className="gradient-text">disputes</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  {isAdmin 
                    ? 'Review and resolve payment disputes from clients and freelancers.'
                    : 'Track and manage your payment disputes.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {heroStats.map((stat, idx) => (
              <div key={idx} className={`card p-6 bg-gradient-to-br ${stat.accent} bg-opacity-10 border border-white/10`}>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60 mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {disputes.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No disputes</h3>
              <p className="text-white/70">You're all clear! No active disputes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map(dispute => (
                <div key={dispute.id} className="card p-6 hover:bg-white/5 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-white">
                          Dispute #{dispute.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${DISPUTE_STATUS_COLORS[dispute.status] || DISPUTE_STATUS_COLORS.OPEN}`}>
                          {dispute.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20">
                          {DISPUTE_TYPE_LABELS[dispute.disputeType] || dispute.disputeType}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/60 mb-1">Invoice</p>
                          <p className="text-white font-semibold">#{dispute.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white/60 mb-1">Amount</p>
                          <p className="text-white font-semibold">{formatCurrency(dispute.amount)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 mb-1">Gateway</p>
                          <p className="text-white font-semibold">{dispute.gateway || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white/60 mb-1">Raised By</p>
                          <p className="text-white font-semibold">{dispute.raisedBy?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white/60 mb-1">Created</p>
                          <p className="text-white font-semibold">{formatDate(dispute.createdAt)}</p>
                        </div>
                        {dispute.resolvedAt && (
                          <div>
                            <p className="text-white/60 mb-1">Resolved</p>
                            <p className="text-white font-semibold">{formatDate(dispute.resolvedAt)}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-white/60 mb-1 text-sm">Reason</p>
                        <p className="text-white/90">{dispute.reason || 'No reason provided'}</p>
                      </div>

                      {dispute.resolution && (
                        <div>
                          <p className="text-white/60 mb-1 text-sm">Resolution</p>
                          <p className="text-white/90">{dispute.resolution}</p>
                        </div>
                      )}

                      {dispute.resolvedBy && (
                        <div>
                          <p className="text-white/60 mb-1 text-sm">Resolved By</p>
                          <p className="text-white/90">{dispute.resolvedBy.fullName} ({dispute.resolvedBy.email})</p>
                        </div>
                      )}
                    </div>

                    {isAdmin && dispute.status === 'OPEN' && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openResolutionModal(dispute)}
                          className="btn btn-primary text-sm"
                        >
                          Resolve Dispute
                        </button>
                        <Link
                          to={`/invoices/${dispute.paymentId}`}
                          className="btn btn-secondary text-sm text-center"
                        >
                          View Payment
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resolution Modal */}
          {showResolutionModal && selectedDispute && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowResolutionModal(false)}>
              <div className="card max-w-2xl w-full space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Resolve Dispute</h3>
                  <button 
                    className="text-white/60 hover:text-white text-2xl"
                    onClick={() => setShowResolutionModal(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Resolution Status</label>
                    <select
                      className="input-field"
                      value={resolutionForm.status}
                      onChange={(e) => setResolutionForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/90 mb-2">Resolution Details</label>
                    <textarea
                      className="input-field min-h-[150px]"
                      placeholder="Provide detailed resolution notes..."
                      value={resolutionForm.resolution}
                      onChange={(e) => setResolutionForm(prev => ({ ...prev, resolution: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-sm text-white/70 mb-2">
                      <strong className="text-white">Dispute:</strong> {selectedDispute.reason}
                    </p>
                    <p className="text-sm text-white/70">
                      <strong className="text-white">Amount:</strong> {formatCurrency(selectedDispute.amount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleResolveDispute}
                    disabled={resolving || !resolutionForm.resolution.trim()}
                    className="btn btn-primary flex-1"
                  >
                    {resolving ? 'Resolving...' : 'Submit Resolution'}
                  </button>
                  <button
                    onClick={() => setShowResolutionModal(false)}
                    className="btn btn-secondary"
                    disabled={resolving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


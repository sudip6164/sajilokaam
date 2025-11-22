import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { gradients } from '../theme/designSystem'

export function MyBidsPage() {
  const [bids, setBids] = useState([])
  const [filteredBids, setFilteredBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const { token, profile } = useAuth()
  const { error: showError } = useToast()

  useEffect(() => {
    loadBids()
  }, [])

  useEffect(() => {
    filterBids()
  }, [statusFilter, bids])

  const loadBids = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` }
      const res = await fetch('http://localhost:8080/api/jobs/my-bids', { headers })
      if (!res.ok) throw new Error('Failed to load bids')
      const data = await res.json()
      const bidsList = Array.isArray(data) ? data : []
      setBids(bidsList)
      setFilteredBids(bidsList)
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterBids = () => {
    let filtered = [...bids]

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(bid => bid.status === statusFilter)
    }

    setFilteredBids(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge badge-warning',
      ACCEPTED: 'badge badge-success',
      REJECTED: 'badge badge-gray'
    }
    return badges[status] || 'badge badge-gray'
  }

  // Calculate stats
  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'PENDING').length,
    accepted: bids.filter(b => b.status === 'ACCEPTED').length,
    rejected: bids.filter(b => b.status === 'REJECTED').length,
    totalValue: bids.filter(b => b.status === 'ACCEPTED').reduce((sum, bid) => sum + (bid.amount || 0), 0)
  }

  const heroStats = [
    {
      label: 'Total bids',
      value: stats.total,
      accent: 'from-emerald-500 to-teal-500',
      detail: 'submitted'
    },
    {
      label: 'Pending',
      value: stats.pending,
      accent: 'from-amber-500 to-orange-500',
      detail: 'awaiting review'
    },
    {
      label: 'Accepted',
      value: stats.accepted,
      accent: 'from-violet-500 to-purple-600',
      detail: stats.totalValue > 0 ? `$${stats.totalValue.toLocaleString()}` : 'won'
    }
  ]

  if (loading) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="loading-skeleton h-6 w-3/4 mb-3"></div>
                  <div className="loading-skeleton h-4 w-full mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Proposal center
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  My <span className="gradient-text">proposals</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Track all your job bids, monitor acceptance rates, and manage your proposal pipeline.
                </p>
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
              <div className="flex flex-wrap gap-3">
                <Link to="/jobs" className="btn btn-primary">
                  Browse Jobs
                </Link>
                <Link to="/projects" className="btn btn-secondary">
                  View Projects
                </Link>
              </div>
            </div>
          </div>

          {bids.length > 0 && (
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label className="block text-sm font-bold text-white/90">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field w-full sm:w-auto"
                >
                  <option value="ALL">All Bids ({bids.length})</option>
                  <option value="PENDING">Pending ({bids.filter(b => b.status === 'PENDING').length})</option>
                  <option value="ACCEPTED">Accepted ({bids.filter(b => b.status === 'ACCEPTED').length})</option>
                  <option value="REJECTED">Rejected ({bids.filter(b => b.status === 'REJECTED').length})</option>
                </select>
              </div>
            </div>
          )}

          {bids.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No bids yet</h3>
              <p className="text-white/70 mb-4">Start bidding on jobs to see them here.</p>
              <Link to="/jobs" className="btn btn-primary inline-flex items-center">
                Browse Jobs
              </Link>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No bids match the filter</h3>
              <button
                onClick={() => setStatusFilter('ALL')}
                className="btn btn-secondary mt-4"
              >
                Show All Bids
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredBids.map(bid => (
                <div key={bid.id} className="card border-2 border-white/10 hover:border-emerald-500/50 hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4 flex-wrap">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold text-white mb-2">
                            {bid.job?.title || 'Job Title'}
                          </h2>
                          <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-emerald-400">${bid.amount?.toLocaleString()}</div>
                          <div className="text-sm text-white/60">Bid Amount</div>
                        </div>
                      </div>
                      
                      {bid.message && (
                        <p className="text-white/70 mb-4 leading-relaxed line-clamp-2">{bid.message}</p>
                      )}

                      {bid.job && (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30 flex-shrink-0">
                            {bid.job.client?.fullName?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white/60">Client</p>
                            <p className="text-base font-bold text-white truncate">{bid.job.client?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-white/50 truncate">{bid.job.client?.email}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-4 border-t border-white/10 flex-wrap">
                        <Link
                          to={`/jobs/${bid.job?.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          View Job Details
                        </Link>
                        {bid.status === 'ACCEPTED' && (
                          <Link
                            to="/projects"
                            className="text-sm text-emerald-400 font-semibold flex items-center gap-2 hover:text-emerald-300 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Bid Accepted! Check Projects
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


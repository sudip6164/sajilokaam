import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'

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

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="loading-skeleton h-10 w-64 mb-8"></div>
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
    <div className="min-h-screen py-12">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="page-title">My Bids</h1>
            <p className="page-subtitle">Track all your job bids and their status</p>
          </div>

          {bids.length > 0 && (
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label className="block text-sm font-semibold text-gray-700">Filter by Status</label>
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
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bids yet</h3>
              <p className="text-gray-600 mb-4">Start bidding on jobs to see them here.</p>
              <Link to="/jobs" className="btn btn-primary inline-flex items-center">
                Browse Jobs
              </Link>
            </div>
          ) : filteredBids.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No bids match the filter</h3>
              <button
                onClick={() => setStatusFilter('ALL')}
                className="btn btn-secondary mt-4"
              >
                Show All Bids
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBids.map(bid => (
                <div key={bid.id} className="card hover:shadow-xl transition-all">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {bid.job?.title || 'Job Title'}
                          </h2>
                          <span className={getStatusBadge(bid.status)}>{bid.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-extrabold text-emerald-600">${bid.amount}</div>
                          <div className="text-sm text-gray-500">Bid Amount</div>
                        </div>
                      </div>
                      
                      {bid.message && (
                        <p className="text-gray-600 mb-4 leading-relaxed">{bid.message}</p>
                      )}

                      {bid.job && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {bid.job.client?.fullName?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700">Client</p>
                            <p className="text-base font-bold text-gray-900">{bid.job.client?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{bid.job.client?.email}</p>
                          </div>
                          {bid.job.description && (
                            <div className="text-sm text-gray-600 max-w-md">
                              <p className="font-semibold mb-1">Job Description:</p>
                              <p className="line-clamp-2">{bid.job.description}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                        <Link
                          to={`/jobs/${bid.job?.id}`}
                          className="btn btn-secondary text-sm"
                        >
                          View Job Details
                        </Link>
                        {bid.status === 'ACCEPTED' && (
                          <span className="text-sm text-emerald-600 font-semibold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Bid Accepted! Check Projects
                          </span>
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


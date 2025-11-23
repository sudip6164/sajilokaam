import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function AdminAuditTrailPage() {
  const { token } = useAuth()
  const { error: showError } = useToast()
  const [trail, setTrail] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (token) {
      loadTrail()
    }
  }, [token, currentPage])

  const loadTrail = async () => {
    try {
      const response = await api.admin.getAuditTrail(currentPage, 50, {}, token)
      setTrail(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      showError(err.message || 'Failed to load audit trail')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Admin Console
              </p>
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  Audit <span className="gradient-text">trail</span>
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  Track all system changes and administrative actions for compliance and security.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-semibold">User</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Action</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Entity</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trail.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{entry.user?.fullName || 'System'}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          entry.action === 'CREATE' ? 'badge-success' :
                          entry.action === 'UPDATE' ? 'badge-primary' :
                          'badge-danger'
                        }`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="p-4 text-white/70">
                        {entry.entityType} #{entry.entityId}
                      </td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white/70">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="btn btn-sm btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


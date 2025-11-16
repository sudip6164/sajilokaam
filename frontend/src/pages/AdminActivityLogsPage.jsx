import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function AdminActivityLogsPage() {
  const { token } = useAuth()
  const { error: showError } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (token) {
      loadLogs()
    }
  }, [token, currentPage])

  const loadLogs = async () => {
    try {
      const response = await api.admin.getActivityLogs(currentPage, 50, {}, token)
      setLogs(response.content || [])
      setTotalPages(response.totalPages || 0)
    } catch (err) {
      showError(err.message || 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
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

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <h1 className="page-title mb-8">Activity Logs</h1>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-semibold">User</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Action</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Entity</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Description</th>
                    <th className="text-left p-4 text-white/70 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{log.user?.fullName || 'System'}</td>
                      <td className="p-4">
                        <span className="badge badge-primary">{log.action}</span>
                      </td>
                      <td className="p-4 text-white/70">
                        {log.entityType && log.entityId ? `${log.entityType} #${log.entityId}` : '-'}
                      </td>
                      <td className="p-4 text-white/70 text-sm">{log.description || '-'}</td>
                      <td className="p-4 text-white/60 text-sm">
                        {new Date(log.createdAt).toLocaleString()}
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


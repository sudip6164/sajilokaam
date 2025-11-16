import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function InvoicesPage() {
  const { token } = useAuth()
  const { error: showError } = useToast()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    if (token) {
      loadInvoices()
    }
  }, [token, statusFilter])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await api.invoices.getAll(token)
      setInvoices(data || [])
    } catch (err) {
      showError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'DRAFT': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      'SENT': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'PAID': 'bg-green-500/20 text-green-300 border-green-500/30',
      'OVERDUE': 'bg-red-500/20 text-red-300 border-red-500/30',
      'CANCELLED': 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
    return `px-3 py-1 rounded-full text-xs font-semibold border ${statusMap[status] || statusMap['DRAFT']}`
  }

  const filteredInvoices = statusFilter === 'ALL' 
    ? invoices 
    : invoices.filter(inv => inv.status === statusFilter)

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <h1 className="page-title mb-8">Invoices</h1>
          <div className="card">
            <div className="loading-skeleton h-8 w-1/4 mb-4"></div>
            <div className="loading-skeleton h-40 w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="page-title">Invoices</h1>
          <Link to="/invoices/new" className="btn btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6 p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-violet-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              All
            </button>
            {['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No invoices found</h3>
            <p className="text-white/70 mb-6">Create your first invoice to get started</p>
            <Link to="/invoices/new" className="btn btn-primary">
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-white/20">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {invoice.client?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {invoice.project?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-violet-400">
                      {invoice.currency} {parseFloat(invoice.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-violet-400 hover:text-violet-300 mr-3"
                      >
                        View
                      </Link>
                      <a
                        href={api.invoices.generatePdf(invoice.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


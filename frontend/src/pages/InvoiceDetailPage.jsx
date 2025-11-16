import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [invoice, setInvoice] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (token && id) {
      loadInvoice()
      loadPayments()
    }
  }, [token, id])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const data = await api.invoices.getById(id, token)
      setInvoice(data)
    } catch (err) {
      showError(err.message || 'Failed to load invoice')
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      const data = await api.payments.getByInvoice(id, token)
      setPayments(data || [])
    } catch (err) {
      console.error('Failed to load payments', err)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await api.invoices.update(id, token, { status: newStatus })
      showSuccess('Invoice status updated!')
      loadInvoice()
    } catch (err) {
      showError(err.message || 'Failed to update invoice status')
    } finally {
      setUpdating(false)
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

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="loading-skeleton h-10 w-48 mb-8"></div>
          <div className="card">
            <div className="loading-skeleton h-40 w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="card text-center py-16">
            <h3 className="text-xl font-bold text-white mb-2">Invoice not found</h3>
            <Link to="/invoices" className="btn btn-primary mt-4">
              Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="mb-8">
          <Link to="/invoices" className="text-violet-400 hover:text-violet-300 font-semibold mb-4 inline-flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="page-title">Invoice {invoice.invoiceNumber}</h1>
              <p className="page-subtitle">
                {invoice.project?.title || 'No project'}
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={api.invoices.generatePdf(invoice.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
              {invoice.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusUpdate('SENT')}
                  disabled={updating}
                  className="btn btn-primary"
                >
                  {updating ? 'Sending...' : 'Send Invoice'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Info */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Invoice Details</h2>
                <span className={getStatusBadge(invoice.status)}>
                  {invoice.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-white/60 mb-1">Issue Date</p>
                  <p className="text-white font-semibold">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">Due Date</p>
                  <p className="text-white font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">From</p>
                  <p className="text-white font-semibold">{invoice.freelancer?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">To</p>
                  <p className="text-white font-semibold">{invoice.client?.fullName || 'N/A'}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-sm font-semibold text-white/70">Description</th>
                        <th className="text-right py-2 text-sm font-semibold text-white/70">Qty</th>
                        <th className="text-right py-2 text-sm font-semibold text-white/70">Price</th>
                        <th className="text-right py-2 text-sm font-semibold text-white/70">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items?.map((item) => (
                        <tr key={item.id} className="border-b border-white/5">
                          <td className="py-3 text-sm text-white">{item.description}</td>
                          <td className="py-3 text-sm text-white/80 text-right">{item.quantity}</td>
                          <td className="py-3 text-sm text-white/80 text-right">
                            {invoice.currency} {parseFloat(item.unitPrice).toFixed(2)}
                          </td>
                          <td className="py-3 text-sm font-semibold text-white text-right">
                            {invoice.currency} {parseFloat(item.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Subtotal:</span>
                  <span>{invoice.currency} {parseFloat(invoice.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(invoice.taxRate) > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{invoice.currency} {parseFloat(invoice.taxAmount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(invoice.discount) > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Discount:</span>
                    <span>-{invoice.currency} {parseFloat(invoice.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                  <span>Total:</span>
                  <span className="text-violet-400">
                    {invoice.currency} {parseFloat(invoice.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm font-semibold text-white/70 mb-2">Notes</p>
                  <p className="text-white/80">{invoice.notes}</p>
                </div>
              )}

              {invoice.terms && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm font-semibold text-white/70 mb-2">Terms</p>
                  <p className="text-white/80">{invoice.terms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payments */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payments</h3>
              {payments.length === 0 ? (
                <p className="text-white/50 text-sm">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {invoice.currency} {parseFloat(payment.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-white/60">{payment.paymentMethod || 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                          payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      {payment.paidAt && (
                        <p className="text-xs text-white/50">
                          Paid: {new Date(payment.paidAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { gradients } from '../theme/designSystem'

export function InvoiceDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()
  const [invoice, setInvoice] = useState(null)
  const [payments, setPayments] = useState([])
  const [invoiceItems, setInvoiceItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [gatewayChoice, setGatewayChoice] = useState('KHALTI')
  const [initiatingPaymentId, setInitiatingPaymentId] = useState(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeForm, setDisputeForm] = useState({ paymentId: '', disputeType: 'REFUND_REQUEST', reason: '' })
  const [submittingDispute, setSubmittingDispute] = useState(false)

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
      setInvoiceItems(data?.items || [])
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

  const handleCreatePaymentIntent = async () => {
    if (!invoice) {
      showError('Invoice not loaded yet')
      return
    }
    setUpdating(true)
    try {
      await api.payments.create(token, {
        invoiceId: Number(id),
        amount: invoice.totalAmount,
        paymentMethod: 'ONLINE',
        status: 'PENDING'
      })
      showSuccess('Payment intent created. Initiate via gateway next.')
      await loadPayments()
    } catch (err) {
      showError(err.message || 'Failed to create payment intent')
    } finally {
      setUpdating(false)
    }
  }

  const handleInitiatePayment = async () => {
    if (!initiatingPaymentId) return
    try {
      const response = await api.payments.initiate(initiatingPaymentId, token, {
        gateway: gatewayChoice,
        returnUrl: `${window.location.origin}/payments?status=success`,
        cancelUrl: `${window.location.origin}/payments?status=cancel`
      })
      showSuccess('Gateway initiated. Complete the payment in the new window.')
      if (response?.paymentUrl) {
        window.open(response.paymentUrl, '_blank', 'noopener')
      }
      setShowPaymentModal(false)
      setInitiatingPaymentId(null)
      await loadPayments()
    } catch (err) {
      showError(err.message || 'Failed to initiate gateway payment')
    }
  }

  const handleDisputeSubmit = async (e) => {
    e.preventDefault()
    if (!disputeForm.paymentId) {
      showError('Select a payment to dispute')
      return
    }
    if (!disputeForm.reason.trim()) {
      showError('Please describe the issue')
      return
    }

    setSubmittingDispute(true)
    try {
      await api.disputes.create(disputeForm.paymentId, token, {
        disputeType: disputeForm.disputeType,
        reason: disputeForm.reason.trim()
      })
      showSuccess('Dispute submitted')
      setShowDisputeModal(false)
      setDisputeForm({ paymentId: '', disputeType: 'REFUND_REQUEST', reason: '' })
    } catch (err) {
      showError(err.message || 'Failed to submit dispute')
    } finally {
      setSubmittingDispute(false)
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
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="hero-grid">
              <div className="space-y-6">
                <div className="loading-skeleton h-8 w-48"></div>
                <div className="loading-skeleton h-12 w-3/4"></div>
                <div className="loading-skeleton h-6 w-1/2"></div>
              </div>
            </div>
            <div className="card">
              <div className="loading-skeleton h-40 w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="page-shell bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="card text-center py-16">
              <h3 className="text-xl font-bold text-white mb-2">Invoice not found</h3>
              <Link to="/invoices" className="btn btn-primary mt-4">
                Back to Invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalPaid = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingAmount = invoice.totalAmount - totalPaid

  return (
    <>
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <Link to="/invoices" className="text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-2 transition-colors text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Invoices
              </Link>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Invoice #{invoice.invoiceNumber}
                </p>
                <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                  {invoice.project?.title || 'Invoice Details'}
                </h1>
                <p className="text-white/70 text-lg max-w-xl mt-4">
                  {invoice.client?.username ? `Client: ${invoice.client.username}` : 'View invoice details, payment history, and manage status.'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-4">
              <div className="stat-pill">
                <div className="text-xs text-white/60 uppercase tracking-wider">Total Amount</div>
                <div className="text-2xl font-black text-white">{invoice.currency} {invoice.totalAmount?.toLocaleString() || '0.00'}</div>
              </div>
              <div className="stat-pill">
                <div className="text-xs text-white/60 uppercase tracking-wider">Paid</div>
                <div className="text-2xl font-black text-emerald-400">{invoice.currency} {totalPaid.toLocaleString()}</div>
              </div>
              <div className="stat-pill">
                <div className="text-xs text-white/60 uppercase tracking-wider">Pending</div>
                <div className="text-2xl font-black text-amber-400">{invoice.currency} {pendingAmount.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
                      {invoiceItems.map((item) => (
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Payments</h3>
                  <p className="text-white/60 text-sm">Track settlements for this invoice</p>
                </div>
                <button
                  className="btn btn-secondary text-xs"
                  onClick={handleCreatePaymentIntent}
                  disabled={updating}
                >
                  {updating ? 'Preparing...' : 'Create Intent'}
                </button>
              </div>
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
                          <p className="text-xs text-white/60">{payment.paymentMethod || payment.gateway || 'N/A'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                          payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      {payment.gateway && (
                        <p className="text-[11px] text-white/50 mb-2">
                          Gateway: {payment.gateway}
                        </p>
                      )}
                      {payment.paidAt && (
                        <p className="text-xs text-white/50">
                          Paid: {new Date(payment.paidAt).toLocaleString()}
                        </p>
                      )}
                      <div className="flex gap-3 mt-3">
                        {payment.status === 'PENDING' && (
                          <button
                            className="text-xs text-violet-300 hover:text-violet-200"
                            onClick={() => {
                              setInitiatingPaymentId(payment.id)
                              setGatewayChoice(payment.gateway || 'KHALTI')
                              setShowPaymentModal(true)
                            }}
                          >
                            Initiate via gateway →
                          </button>
                        )}
                        <button
                          className="text-xs text-rose-200 hover:text-rose-100"
                          onClick={() => {
                            setDisputeForm({ paymentId: payment.id, disputeType: 'REFUND_REQUEST', reason: '' })
                            setShowDisputeModal(true)
                          }}
                        >
                          Raise dispute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Initiate Payment</h3>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => {
                  setShowPaymentModal(false)
                  setInitiatingPaymentId(null)
                }}
              >
                ×
              </button>
            </div>
            <p className="text-sm text-white/70">
              Choose a gateway to continue. You'll be redirected to complete the payment securely.
            </p>
            <div className="flex gap-3 flex-wrap">
              {['KHALTI', 'ESEWA', 'BANK_TRANSFER'].map(gateway => (
                <button
                  key={gateway}
                  type="button"
                  onClick={() => setGatewayChoice(gateway)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    gatewayChoice === gateway ? 'bg-white text-slate-900' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {gateway.charAt(0) + gateway.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="btn btn-primary flex-1"
                onClick={handleInitiatePayment}
                disabled={!initiatingPaymentId}
              >
                Launch Gateway
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPaymentModal(false)
                  setInitiatingPaymentId(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Raise a Dispute</h3>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => setShowDisputeModal(false)}
              >
                ×
              </button>
            </div>
            <form className="space-y-4" onSubmit={handleDisputeSubmit}>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Dispute Type</label>
                <select
                  className="input-field"
                  value={disputeForm.disputeType}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, disputeType: e.target.value }))}
                >
                  <option value="REFUND_REQUEST">Refund request</option>
                  <option value="PAYMENT_ISSUE">Payment issue</option>
                  <option value="SERVICE_NOT_DELIVERED">Service not delivered</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Reason</label>
                <textarea
                  className="input-field min-h-[150px]"
                  placeholder="Describe the issue in detail..."
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1" disabled={submittingDispute}>
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDisputeModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}


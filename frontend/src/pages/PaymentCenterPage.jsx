import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { api } from '../utils/api'
import { Link } from 'react-router-dom'
import { gradients } from '../theme/designSystem'

const GATEWAY_COLORS = {
  KHALTI: 'bg-purple-500/20 text-purple-100 border-purple-500/30',
  ESEWA: 'bg-green-500/20 text-green-100 border-green-500/30',
  BANK_TRANSFER: 'bg-blue-500/20 text-blue-100 border-blue-500/30'
}

const STATUS_COLORS = {
  PENDING: 'text-amber-200 bg-amber-500/10 border border-amber-500/30',
  SUCCESS: 'text-emerald-200 bg-emerald-500/10 border border-emerald-500/30',
  FAILED: 'text-rose-200 bg-rose-500/10 border border-rose-500/30',
  REFUNDED: 'text-cyan-200 bg-cyan-500/10 border border-cyan-500/30'
}

export function PaymentCenterPage() {
  const { token } = useAuth()
  const { success: showSuccess, error: showError } = useToast()

  const [invoices, setInvoices] = useState([])
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [payments, setPayments] = useState([])
  const [transactions, setTransactions] = useState([])
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGateway, setActiveGateway] = useState('KHALTI')
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeForm, setDisputeForm] = useState({ paymentId: '', disputeType: 'REFUND_REQUEST', reason: '' })
  const [submittingDispute, setSubmittingDispute] = useState(false)

  useEffect(() => {
    if (token) {
      loadInvoices()
      loadTransactions()
      loadDisputes()
    }
  }, [token])

  useEffect(() => {
    if (selectedInvoiceId && token) {
      loadPayments(selectedInvoiceId)
    }
  }, [selectedInvoiceId, token])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const data = await api.invoices.getAll(token)
      setInvoices(data || [])
      if ((data || []).length > 0) {
        setSelectedInvoiceId(data[0].id)
      }
    } catch (err) {
      showError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async (invoiceId) => {
    try {
      const data = await api.payments.getByInvoice(invoiceId, token)
      setPayments(data || [])
    } catch (err) {
      showError(err.message || 'Failed to load payments')
    }
  }

  const loadTransactions = async () => {
    try {
      const data = await api.payments.getTransactions(token)
      setTransactions(data || [])
    } catch (err) {
      console.error('Failed to load transactions', err)
    }
  }

  const loadDisputes = async () => {
    try {
      const data = await api.disputes.getMine(token)
      setDisputes(data || [])
    } catch (err) {
      console.error('Failed to load disputes', err)
    }
  }

  const invoiceOptions = useMemo(() => {
    return invoices.map(inv => ({
      value: inv.id,
      label: `${inv.invoiceNumber} · ${inv.client?.fullName || 'N/A'}`
    }))
  }, [invoices])

  const handleCreatePayment = async () => {
    if (!selectedInvoiceId) {
      showError('Select an invoice first')
      return
    }

    setCreatingPayment(true)
    try {
      const invoice = invoices.find(inv => inv.id === Number(selectedInvoiceId))
      const response = await api.payments.create(token, {
        invoiceId: Number(selectedInvoiceId),
        amount: invoice?.totalAmount,
        paymentMethod: activeGateway,
        status: 'PENDING'
      })
      showSuccess('Payment intent created. Initiate to continue.')
      setPayments(prev => [response, ...prev])
      await loadDisputes()
    } catch (err) {
      showError(err.message || 'Failed to create payment')
    } finally {
      setCreatingPayment(false)
    }
  }

  const handleRaiseDispute = async (e) => {
    e.preventDefault()
    if (!disputeForm.paymentId) {
      showError('Select a payment to dispute')
      return
    }
    if (!disputeForm.reason.trim()) {
      showError('Reason is required')
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
      await loadDisputes()
    } catch (err) {
      showError(err.message || 'Failed to submit dispute')
    } finally {
      setSubmittingDispute(false)
    }
  }

  const stats = {
    totalTransactions: transactions.length,
    successful: transactions.filter(t => t.status === 'SUCCESS').length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    totalAmount: transactions.filter(t => t.status === 'SUCCESS').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0),
    activeDisputes: disputes.filter(d => d.status === 'OPEN').length
  }

  const heroStats = [
    {
      label: 'Transactions',
      value: stats.totalTransactions,
      accent: 'from-violet-500 to-purple-600',
      detail: 'all time'
    },
    {
      label: 'Successful',
      value: stats.successful,
      accent: 'from-emerald-500 to-teal-500',
      detail: stats.totalAmount > 0 ? `$${stats.totalAmount.toFixed(2)}` : 'completed'
    },
    {
      label: 'Active disputes',
      value: stats.activeDisputes,
      accent: 'from-amber-500 to-orange-500',
      detail: 'needs attention'
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
            <div className="card h-[300px] loading-skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="page-shell bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="hero-grid">
            <div className="space-y-6">
              <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Financial hub
              </p>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
                    <span className="gradient-text">Payment center</span>
                  </h1>
                  <p className="text-white/70 text-lg max-w-xl mt-4">
                    Track invoices, initiate online payments, manage escrow, and resolve disputes.
                  </p>
                </div>
                <Link to="/invoices" className="btn btn-secondary text-sm whitespace-nowrap">
                  Manage Invoices
                </Link>
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
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card space-y-4">
              <h2 className="text-lg font-bold text-white">Choose Invoice & Gateway</h2>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Invoice</label>
                <select
                  className="input-field"
                  value={selectedInvoiceId || ''}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                >
                  {invoiceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70 font-semibold mb-2 block">Gateway</label>
                <div className="flex gap-3 flex-wrap">
                  {['KHALTI', 'ESEWA', 'BANK_TRANSFER'].map(gateway => (
                    <button
                      key={gateway}
                      type="button"
                      onClick={() => setActiveGateway(gateway)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                        activeGateway === gateway
                          ? 'bg-white text-slate-900'
                          : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      {gateway.charAt(0) + gateway.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleCreatePayment}
                disabled={creatingPayment}
              >
                {creatingPayment ? 'Preparing...' : `Initiate via ${activeGateway}`}
              </button>
            </div>

            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Escrow Snapshot</h2>
                <Link to="/projects" className="text-sm text-violet-300 hover:text-violet-200">View Projects →</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 uppercase">Accounts</p>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-white/40 text-xs">Escrow accounts tracked</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 uppercase">Releases</p>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-white/40 text-xs">Milestone payouts</p>
                </div>
              </div>
              <p className="text-white/60 text-sm">
                Escrow visibility coming next: deposit, release, and dispute management flows will show up here.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
                  <p className="text-white/60 text-sm">
                    {selectedInvoiceId ? 'Linked to invoice' : 'Select an invoice to see payments'}
                  </p>
                </div>
                <Link
                  to={`/invoices/${selectedInvoiceId || ''}`}
                  className="text-violet-300 text-sm hover:text-violet-200"
                  onClick={(e) => {
                    if (!selectedInvoiceId) {
                      e.preventDefault()
                      showError('Choose an invoice first')
                    }
                  }}
                >
                  View invoice →
                </Link>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 text-white/50 text-sm">
                  {selectedInvoiceId ? 'No payments recorded yet.' : 'Choose an invoice to visualize payments.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map(payment => (
                    <div key={payment.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {payment.gateway || payment.paymentMethod || 'N/A'}
                          </p>
                          <p className="text-xs text-white/60">
                            {payment.paymentReference || 'No reference'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">
                            Rs. {Number(payment.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-white/50">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : 'Not yet paid'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING}`}>
                          {payment.status}
                        </span>
                        {payment.gateway && (
                          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${GATEWAY_COLORS[payment.gateway] || 'bg-white/10 text-white/70 border border-white/20'}`}>
                            {payment.gateway}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-3">
                        {payment.status === 'PENDING' && (
                          <button
                            className="text-xs text-violet-300 hover:text-violet-200"
                            onClick={() => showError('Initiate this payment from invoice detail to launch the gateway.')}
                          >
                            Initiate via invoice →
                          </button>
                        )}
                        <button
                          className="text-xs text-rose-200 hover:text-rose-100"
                          onClick={() => {
                            setDisputeForm(prev => ({ ...prev, paymentId: payment.id, reason: '', disputeType: 'REFUND_REQUEST' }))
                            setShowDisputeModal(true)
                          }}
                        >
                          Raise Dispute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Gateway Transactions</h3>
                  <p className="text-white/60 text-sm">Latest from Khalti, eSewa, and more</p>
                </div>
                <button className="text-sm text-violet-300 hover:text-violet-200" onClick={loadTransactions}>
                  Refresh
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-white/50 text-sm">
                  No gateway activity recorded yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {transactions.map(txn => (
                    <div key={txn.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold text-sm">{txn.transactionId}</p>
                        <span className={`px-2 py-1 rounded text-[11px] font-semibold ${STATUS_COLORS[txn.status] || STATUS_COLORS.PENDING}`}>
                          {txn.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{txn.gateway}</span>
                        <span>Rs. {Number(txn.amount).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-white/50 mt-2">
                        {txn.processedAt ? new Date(txn.processedAt).toLocaleString() : 'Pending processing'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Your Disputes</h3>
                <p className="text-white/60 text-sm">Monitor open payment disputes</p>
              </div>
              <div className="flex gap-2">
                <Link to="/disputes" className="btn btn-primary text-xs">
                  View All Disputes
                </Link>
                <button
                  className="btn btn-secondary text-xs"
                  onClick={() => {
                    setDisputeForm({ paymentId: '', disputeType: 'REFUND_REQUEST', reason: '' })
                    setShowDisputeModal(true)
                  }}
                >
                  New Dispute
                </button>
              </div>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-12 text-white/50 text-sm">
                No disputes on file.
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {disputes.map(dispute => (
                  <div key={dispute.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-semibold text-sm">
                        {dispute.invoiceNumber || 'Invoice'}
                      </p>
                      <span className={`px-2 py-1 rounded text-[11px] font-semibold ${STATUS_COLORS[dispute.status] || STATUS_COLORS.PENDING}`}>
                        {dispute.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mb-2">
                      Type: {dispute.disputeType?.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed">{dispute.reason}</p>
                    <p className="text-xs text-white/50 mt-2">
                      Raised {dispute.createdAt ? new Date(dispute.createdAt).toLocaleString() : '—'}
                    </p>
                    {dispute.resolution && (
                      <p className="text-xs text-emerald-300 mt-1">Resolution: {dispute.resolution}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {showDisputeModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="card max-w-lg w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Raise a Payment Dispute</h3>
            <button
              className="text-white/60 hover:text-white"
              onClick={() => setShowDisputeModal(false)}
            >
              ×
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleRaiseDispute}>
            <div>
              <label className="text-sm text-white/70 font-semibold mb-2 block">Payment</label>
              <select
                className="input-field"
                value={disputeForm.paymentId}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, paymentId: e.target.value }))}
              >
                <option value="">Select payment</option>
                {payments.map(payment => (
                  <option key={payment.id} value={payment.id}>
                    {payment.paymentReference || payment.gateway || 'Payment'} · Rs. {Number(payment.amount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
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
                placeholder="Describe what went wrong…"
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


import { useEffect, useMemo, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import { BarChart, PieChart } from '../components/Chart'

const statusStyles = {
  COMPLETED: 'bg-emerald-500/20 text-emerald-300',
  PENDING: 'bg-amber-500/20 text-amber-300',
  FAILED: 'bg-rose-500/20 text-rose-300',
  REFUNDED: 'bg-cyan-500/20 text-cyan-300'
}

const disputeStyles = {
  OPEN: 'text-amber-300 border-amber-500/40',
  IN_REVIEW: 'text-sky-300 border-sky-500/40',
  RESOLVED: 'text-emerald-300 border-emerald-500/40',
  CLOSED: 'text-slate-300 border-slate-500/40'
}

const defaultFormatter = new Intl.NumberFormat('en-NP', {
  style: 'currency',
  currency: 'NPR',
  maximumFractionDigits: 2
})

const formatCurrency = (amount) => {
  const asNumber = typeof amount === 'number' ? amount : parseFloat(amount || 0)
  return defaultFormatter.format(isNaN(asNumber) ? 0 : asNumber)
}

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-NP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return iso
  }
}

export function AdminPaymentsPage() {
  const { token } = useAuth()
  const { error: showError } = useToast()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadDashboard()
    }
  }, [token])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const data = await api.admin.getPaymentDashboard(token)
      setDashboard(data)
    } catch (err) {
      showError(err.message || 'Failed to load payment analytics')
    } finally {
      setLoading(false)
    }
  }

  const statusChartData = useMemo(() => {
    return (dashboard?.statuses || []).map(item => ({
      label: item.status,
      value: Number(item.count || 0)
    }))
  }, [dashboard])

  const gatewayChartData = useMemo(() => {
    return (dashboard?.gateways || [])
      .map(item => ({
        label: item.gateway || 'OFFLINE',
        value: Number(item.totalAmount || 0)
      }))
      .filter(item => item.value > 0)
  }, [dashboard])

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="loading-skeleton h-10 w-60" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="card p-6">
                  <div className="loading-skeleton h-5 w-32 mb-3" />
                  <div className="loading-skeleton h-10 w-24" />
                </div>
              ))}
            </div>
            <div className="card h-72" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card h-80" />
              <div className="card h-80" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen py-12 bg-pattern">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center card py-16">
            <h2 className="text-2xl font-bold text-white mb-4">Unable to load payment data</h2>
            <p className="text-white/70 mb-6">Check your connection or try refreshing the dashboard.</p>
            <button className="btn btn-primary" onClick={loadDashboard}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { summary, disputes, recentPayments = [], recentDisputes = [] } = dashboard

  const statCards = [
    {
      label: 'Total Collected',
      value: formatCurrency(summary?.totalCollected),
      subtext: `${summary?.totalTransactions || 0} transactions`,
      accent: 'from-emerald-500 to-green-500'
    },
    {
      label: 'Pending Amount',
      value: formatCurrency(summary?.pendingAmount),
      subtext: 'Awaiting confirmation',
      accent: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Refunded',
      value: formatCurrency(summary?.refundedAmount),
      subtext: 'Manual + gateway refunds',
      accent: 'from-cyan-500 to-blue-500'
    },
    {
      label: 'Average Ticket',
      value: formatCurrency(summary?.averageTicketSize),
      subtext: 'Completed payments only',
      accent: 'from-violet-500 to-purple-500'
    }
  ]

  return (
    <div className="min-h-screen py-12 bg-pattern">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-white/50 font-semibold">Admin Console</p>
              <h1 className="page-title mt-1">Payments & Disputes</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn btn-secondary" onClick={loadDashboard}>
                Refresh
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map((card, idx) => (
              <div key={idx} className="card p-6 bg-white/5">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {idx === 0 ? '₨' : idx === 1 ? '⏳' : idx === 2 ? '↺' : '≈'}
                </div>
                <p className="text-sm uppercase tracking-wide text-white/60">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                <p className="text-white/50 text-sm mt-2">{card.subtext}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Gateway Mix</h2>
                  <p className="text-white/60 text-sm">Live volume split by processor</p>
                </div>
              </div>
              {gatewayChartData.length > 0 ? (
                <PieChart data={gatewayChartData} size={260} />
              ) : (
                <p className="text-white/60 text-sm">No payment data yet.</p>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Status Pipeline</h2>
                  <p className="text-white/60 text-sm">Transactions by lifecycle state</p>
                </div>
              </div>
              {statusChartData.length > 0 ? (
                <BarChart data={statusChartData} width={420} height={220} color="#a855f7" />
              ) : (
                <p className="text-white/60 text-sm">No transactions available.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Recent Payments</h2>
                  <p className="text-white/60 text-sm">10 most recent transactions</p>
                </div>
              </div>
              <table className="min-w-full divide-y divide-white/5">
                <thead>
                  <tr className="text-left text-white/60 text-xs uppercase tracking-widest">
                    <th className="py-3">Invoice</th>
                    <th className="py-3">Client</th>
                    <th className="py-3">Freelancer</th>
                    <th className="py-3">Gateway</th>
                    <th className="py-3 text-right">Amount</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentPayments.map(payment => (
                    <tr key={payment.id}>
                      <td className="py-4">
                        <p className="text-white font-semibold">{payment.invoiceNumber || `#${payment.id}`}</p>
                        <p className="text-xs text-white/50">{formatDate(payment.createdAt)}</p>
                      </td>
                      <td className="py-4 text-white/80">{payment.clientName || '—'}</td>
                      <td className="py-4 text-white/80">{payment.freelancerName || '—'}</td>
                      <td className="py-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-white/10 text-white/80">
                          {payment.gateway
                            ? payment.gateway
                            : payment.status === 'COMPLETED'
                              ? 'OFFLINE'
                              : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 text-right text-white font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-4 text-right">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusStyles[payment.status] || 'bg-white/10 text-white'}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Dispute Queue</h2>
                    <p className="text-white/60 text-sm">Escalations needing review</p>
                  </div>
                  <span className="text-3xl font-bold text-white">{disputes?.open || 0}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SummaryPill label="Open" value={disputes?.open} color="bg-amber-500/10 text-amber-200" />
                  <SummaryPill label="In review" value={disputes?.inReview} color="bg-sky-500/10 text-sky-200" />
                  <SummaryPill label="Resolved" value={disputes?.resolved} color="bg-emerald-500/10 text-emerald-200" />
                  <SummaryPill label="Closed" value={disputes?.closed} color="bg-slate-500/10 text-slate-200" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Latest Disputes</h2>
                    <p className="text-white/60 text-sm">5 most recent cases</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentDisputes.length === 0 && (
                    <p className="text-white/60 text-sm">No disputes filed yet.</p>
                  )}
                  {recentDisputes.map(dispute => (
                    <div key={dispute.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold">{dispute.invoiceNumber || `Payment #${dispute.paymentId}`}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${disputeStyles[dispute.status] || 'text-white border-white/30'}`}>
                          {dispute.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 mb-2">{dispute.disputeType}</p>
                      <p className="text-xs text-white/40">{formatDate(dispute.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryPill({ label, value, color }) {
  return (
    <div className={`rounded-2xl px-4 py-3 text-sm font-semibold ${color || 'bg-white/10 text-white'}`}>
      <p className="text-xs uppercase tracking-widest text-white/60">{label}</p>
      <p className="text-2xl text-white mt-1">{value ?? 0}</p>
    </div>
  )
}


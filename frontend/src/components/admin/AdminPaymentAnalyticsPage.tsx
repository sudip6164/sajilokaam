import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from './AdminDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { adminApi } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AdminPaymentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const data = await adminApi.getPaymentDashboard();
      setPaymentData(data);
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout activePage="payments">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const summary = paymentData?.summary || {};
  const gateways = paymentData?.gateways || [];
  const statuses = paymentData?.statuses || [];
  const recentPayments = paymentData?.recentPayments || [];
  const disputes = paymentData?.disputes || {};

  const summaryCards = [
    {
      title: 'Total Collected',
      value: `Rs. ${(summary.totalCollected || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Amount',
      value: `Rs. ${(summary.pendingAmount || 0).toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Refunded Amount',
      value: `Rs. ${(summary.refundedAmount || 0).toLocaleString()}`,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Transactions',
      value: (summary.totalTransactions || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const gatewayData = gateways.map((g: any) => ({
    name: g.gateway || 'OFFLINE',
    amount: Number(g.totalAmount || 0),
    count: g.count || 0,
  }));

  const statusData = statuses.map((s: any) => ({
    name: s.status || 'UNKNOWN',
    count: s.count || 0,
  }));

  const disputeData = [
    { name: 'Open', value: disputes.open || 0 },
    { name: 'In Review', value: disputes.inReview || 0 },
    { name: 'Resolved', value: disputes.resolved || 0 },
    { name: 'Closed', value: disputes.closed || 0 },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminDashboardLayout activePage="payments">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive payment insights and metrics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  {card.title === 'Total Collected' && summary.averageTicketSize && (
                    <p className="text-xs text-gray-500 mt-1">
                      Avg: Rs. {Number(summary.averageTicketSize).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gateway Breakdown */}
          {gatewayData.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Payment Gateway Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gatewayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => `Rs. ${Number(value).toLocaleString()}`}
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#3b82f6" name="Amount (Rs.)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Status Distribution */}
          {statusData.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Dispute Summary */}
          {disputes.total !== undefined && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Dispute Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disputeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#ef4444" name="Disputes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Payments */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 text-sm font-semibold">ID</th>
                      <th className="text-left p-4 text-sm font-semibold">Amount</th>
                      <th className="text-left p-4 text-sm font-semibold">Status</th>
                      <th className="text-left p-4 text-sm font-semibold">Gateway</th>
                      <th className="text-left p-4 text-sm font-semibold">Invoice</th>
                      <th className="text-left p-4 text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment: any) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 text-sm">#{payment.id}</td>
                        <td className="p-4 text-sm font-semibold">
                          Rs. {Number(payment.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(payment.status)}>
                            {payment.status || 'UNKNOWN'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{payment.gateway || 'OFFLINE'}</td>
                        <td className="p-4 text-sm">
                          {payment.invoiceNumber || 'N/A'}
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {payment.createdAt 
                            ? new Date(payment.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent payments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}

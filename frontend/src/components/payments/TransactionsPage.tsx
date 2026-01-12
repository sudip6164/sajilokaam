import { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function TransactionsPage() {
  const { hasRole } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const isFreelancer = hasRole('FREELANCER');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await paymentsApi.getTransactions();
      setTransactions(data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.paymentReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.invoice?.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'all' ||
      (filterType === 'income' && transaction.type === 'CREDIT') ||
      (filterType === 'expense' && transaction.type === 'DEBIT');

    const matchesStatus =
      filterStatus === 'all' ||
      transaction.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      COMPLETED: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REFUNDED: 'outline',
    };

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const calculateTotals = () => {
    const completed = filteredTransactions.filter(t => t.status === 'COMPLETED');
    const income = completed
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    const expense = completed
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { income, expense, net: income - expense };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">View all your payment transactions</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      Rs. {totals.income.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <ArrowDownCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expense</p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      Rs. {totals.expense.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <ArrowUpCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Balance</p>
                    <p className={`text-2xl font-bold mt-2 ${totals.net >= 0 ? 'text-primary' : 'text-red-600'}`}>
                      Rs. {totals.net.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by reference or invoice number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-gray-500">Loading transactions...</p>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">No transactions found</p>
                  <p className="text-gray-600 mt-1">
                    {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Your transaction history will appear here'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">
                              {transaction.invoice?.invoiceNumber || 'Payment'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.invoice?.project?.title || 'Direct payment'}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-900">
                              {transaction.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm font-mono text-gray-600">
                              {transaction.paymentReference || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span
                              className={`font-semibold ${
                                transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'CREDIT' ? '+' : '-'}Rs.{' '}
                              {transaction.amount?.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

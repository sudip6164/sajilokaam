import { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Plus,
  Calendar,
  DollarSign,
  User,
  Filter
} from 'lucide-react';
import { invoicesApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '../Router';
import { useAuth } from '@/contexts/AuthContext';

export function InvoicesListPage() {
  const { navigate } = useRouter();
  const { user, hasRole } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const isClient = hasRole('CLIENT');
  const isFreelancer = hasRole('FREELANCER');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.list();
      setInvoices(data);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      toast.info('Generating PDF...');
      await invoicesApi.downloadPDF(invoiceId);
      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.project?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterStatus === 'all' ||
      invoice.paymentStatus?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PAID: 'default',
      PARTIALLY_PAID: 'secondary',
      UNPAID: 'destructive',
      OVERDUE: 'destructive',
    };
    
    const labels: any = {
      PAID: 'Paid',
      PARTIALLY_PAID: 'Partially Paid',
      UNPAID: 'Unpaid',
      OVERDUE: 'Overdue',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-600 mt-1">Manage and track your invoices</p>
            </div>
            {isFreelancer && (
              <Button onClick={() => navigate('create-invoice')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by invoice number or project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterStatus === 'paid' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('paid')}
                    size="sm"
                  >
                    Paid
                  </Button>
                  <Button
                    variant={filterStatus === 'unpaid' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('unpaid')}
                    size="sm"
                  >
                    Unpaid
                  </Button>
                  <Button
                    variant={filterStatus === 'overdue' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('overdue')}
                    size="sm"
                  >
                    Overdue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <div className="space-y-4">
            {loading ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">Loading invoices...</p>
                </CardContent>
              </Card>
            ) : filteredInvoices.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900">No invoices found</p>
                  <p className="text-gray-600 mt-1">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : isFreelancer
                      ? 'Create your first invoice to get started'
                      : 'Invoices from freelancers will appear here'}
                  </p>
                  {isFreelancer && !searchQuery && filterStatus === 'all' && (
                    <Button className="mt-4" onClick={() => navigate('create-invoice')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredInvoices.map((invoice) => (
                <Card key={invoice.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {invoice.invoiceNumber}
                            </h3>
                            {getStatusBadge(invoice.paymentStatus)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {invoice.project?.title || 'No project associated'}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4" />
                              <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="font-medium text-gray-900">
                                  Rs. {invoice.totalAmount?.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <div>
                                <p className="text-xs text-gray-500">Issue Date</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(invoice.issueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(invoice.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="h-4 w-4" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  {isClient ? 'From' : 'To'}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {isClient 
                                    ? invoice.freelancer?.fullName || 'Unknown'
                                    : invoice.client?.fullName || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('invoice-detail', { invoiceId: invoice.id })}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

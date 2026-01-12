import { useState, useEffect } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft,
  Download,
  CreditCard,
  CheckCircle,
  Calendar,
  User,
  Building2,
  FileText
} from 'lucide-react';
import { invoicesApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '../Router';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentModal } from './PaymentModal';

export function InvoiceDetailPage() {
  const { navigate, pageParams } = useRouter();
  const { user, hasRole } = useAuth();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const isClient = hasRole('CLIENT');
  const invoiceId = pageParams?.invoiceId;

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await invoicesApi.get(invoiceId);
      setInvoice(data);
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('Generating PDF...');
      await invoicesApi.downloadPDF(invoiceId);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

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
      <Badge variant={variants[status] || 'secondary'} className="text-sm">
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-gray-500">Loading invoice...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-gray-500">Invoice not found</p>
            <Button className="mt-4" onClick={() => navigate('invoices-list')}>
              Back to Invoices
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('invoices-list')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                <p className="text-gray-600 mt-1">Invoice Details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(invoice.paymentStatus)}
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {isClient && invoice.paymentStatus !== 'PAID' && (
                <Button onClick={() => setPaymentModalOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              )}
            </div>
          </div>

          {/* Invoice Card */}
          <Card className="border-2">
            <CardContent className="p-8">
              {/* Header Info */}
              <div className="flex justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <p className="text-sm text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">From:</p>
                  <p className="font-semibold text-gray-900">
                    {invoice.freelancer?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {invoice.freelancer?.email}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Bill To */}
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Bill To:</p>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {invoice.client?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">{invoice.client?.email}</p>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              {invoice.project && (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-700">Project</p>
                  </div>
                  <p className="text-gray-900">{invoice.project.title}</p>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-3 text-sm font-semibold text-gray-700">
                        Description
                      </th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">
                        Unit Price
                      </th>
                      <th className="text-right py-3 text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items?.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 text-gray-900">{item.description}</td>
                        <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-900">
                          Rs. {item.unitPrice?.toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          Rs. {item.amount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      Rs. {invoice.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">
                      Rs. {invoice.taxAmount?.toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">Rs. {invoice.totalAmount?.toFixed(2)}</span>
                  </div>
                  {invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid:</span>
                        <span className="font-medium">Rs. {invoice.paidAmount?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-destructive">
                        <span>Balance Due:</span>
                        <span>
                          Rs. {(invoice.totalAmount - invoice.paidAmount).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Notes:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                  </div>
                </>
              )}

              {/* Terms */}
              {invoice.termsAndConditions && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Terms & Conditions:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {invoice.termsAndConditions}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.payments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Rs. {payment.amount?.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paymentMethod} - {payment.paymentReference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoice={invoice}
        onPaymentSuccess={fetchInvoice}
      />
    </div>
  );
}

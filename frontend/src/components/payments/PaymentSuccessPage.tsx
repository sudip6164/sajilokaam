import { useEffect, useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import { useRouter } from '../Router';

export function PaymentSuccessPage() {
  const { navigate } = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment ID and verification token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('payment_id') || urlParams.get('oid');
      const token = urlParams.get('token') || urlParams.get('refId');

      if (!paymentId || !token) {
        setError('Invalid payment response');
        setVerifying(false);
        return;
      }

      // Verify payment with backend
      const response = await paymentsApi.verify(parseInt(paymentId), { token });
      
      if (response.verified) {
        setVerified(true);
        setPaymentDetails(response.payment);
      } else {
        setError('Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.response?.data?.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              {verifying ? (
                <>
                  <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Verifying Payment...
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your payment with the gateway
                  </p>
                </>
              ) : verified ? (
                <>
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully
                  </p>

                  {paymentDetails && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 text-left">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount Paid:</span>
                          <span className="font-semibold text-gray-900">
                            Rs. {paymentDetails.amount?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <span className="font-semibold text-gray-900">
                            {paymentDetails.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reference:</span>
                          <span className="font-semibold text-gray-900">
                            {paymentDetails.paymentReference}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(paymentDetails.paidAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate('invoices-list')}>
                      View Invoices
                    </Button>
                    <Button variant="outline" onClick={() => navigate('transactions')}>
                      View Transactions
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Verification Failed
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {error || 'We could not verify your payment. Please contact support.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate('invoices-list')}>
                      Back to Invoices
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

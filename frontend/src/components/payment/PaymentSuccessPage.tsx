import { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export function PaymentSuccessPage() {
  const { navigate } = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      
      // Log all parameters for debugging
      console.log('All URL parameters:', Object.fromEntries(urlParams.entries()));
      
      // Our parameters from backend
      const invoiceId = urlParams.get('invoiceId');
      const projectId = urlParams.get('projectId');
      
      // eSewa callback parameters (various formats they might use)
      const productId = urlParams.get('oid') || 
                       urlParams.get('product_code') || 
                       urlParams.get('product_id');
      const transactionCode = urlParams.get('refId') || 
                             urlParams.get('transaction_uuid') || 
                             urlParams.get('transaction_code');
      const amount = urlParams.get('amt') || urlParams.get('amount');

      console.log('Parsed params:', { invoiceId, projectId, productId, transactionCode, amount });

      if (!productId && !invoiceId) {
        toast.error('Invalid payment parameters - missing product/invoice ID');
        setVerifying(false);
        return;
      }

      // Verify payment with backend
      const response = await api.post('/api/payments/esewa/verify', {
        productId: productId || `INV-${invoiceId}`,
        transactionCode: transactionCode || 'MANUAL_VERIFY',
        amount: parseFloat(amount || '0'),
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
        projectId: projectId ? parseInt(projectId) : null
      });

      setPaymentResult(response.data);
      toast.success('Payment successful! Your project has been activated.');

    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we confirm your payment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <div>
                <CardTitle className="text-2xl text-green-900">Payment Successful!</CardTitle>
                <p className="text-green-700 mt-1">Your project has been activated</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {paymentResult && (
              <>
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{paymentResult.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice ID:</span>
                    <span className="font-medium">{paymentResult.invoiceId}</span>
                  </div>
                  {paymentResult.projectId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project ID:</span>
                      <span className="font-medium">{paymentResult.projectId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">{paymentResult.status}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Your payment has been securely held in escrow</li>
                    <li>The freelancer can now start working on your project</li>
                    <li>View your project details in the dashboard</li>
                    <li>Track progress and communicate with the freelancer</li>
                    <li>Release payment once the project is completed</li>
                  </ul>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => navigate('client-dashboard')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              {paymentResult?.projectId && (
                <Button
                  onClick={() => navigate('client-projects')}
                  variant="outline"
                  className="flex-1"
                >
                  View Project
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

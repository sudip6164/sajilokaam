import { useRouter } from '../Router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

export function PaymentFailurePage() {
  const { navigate } = useRouter();

  const handleRetry = () => {
    // Go back to previous page or dashboard
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-3">
              <XCircle className="h-12 w-12 text-red-600" />
              <div>
                <CardTitle className="text-2xl text-red-900">Payment Failed</CardTitle>
                <p className="text-red-700 mt-1">Your payment could not be processed</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Possible Reasons:</h4>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Payment was cancelled by you</li>
                <li>Insufficient balance in your eSewa account</li>
                <li>Network connectivity issues</li>
                <li>Invalid payment credentials</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-3">What would you like to do?</h4>
              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Try Payment Again
                </Button>
                <Button
                  onClick={() => navigate('client-dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-semibold mb-2">Need Help?</p>
              <p>
                If you continue to experience issues, please contact our support team
                or try a different payment method.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

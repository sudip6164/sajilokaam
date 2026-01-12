import { Header } from '../Header';
import { Footer } from '../Footer';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { XCircle } from 'lucide-react';
import { useRouter } from '../Router';

export function PaymentCancelPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <XCircle className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Cancelled
              </h1>
              <p className="text-gray-600 mb-6">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('invoices-list')}>
                  Back to Invoices
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

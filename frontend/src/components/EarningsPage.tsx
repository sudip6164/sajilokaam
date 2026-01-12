import { Header } from './Header';
import { Footer } from './Footer';
import { EarningsDashboard } from './analytics/EarningsDashboard';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';

export function EarningsPage() {
  const { navigate } = useRouter();
  const { hasRole } = useAuth();
  
  // Earnings page is primarily for freelancers, but could also be used by clients
  const getDashboardRoute = () => {
    if (hasRole('CLIENT')) return 'client-dashboard';
    return 'freelancer-dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(getDashboardRoute())}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Earnings</h1>
          <p className="text-muted-foreground">
            Track your income, transactions, and financial analytics
          </p>
        </div>

        {/* Earnings Dashboard */}
        <EarningsDashboard />
      </main>

      <Footer />
    </div>
  );
}
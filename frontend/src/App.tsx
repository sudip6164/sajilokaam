import { Router, useRouter } from "./components/Router";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Page Components
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { PopularCategories } from "./components/PopularCategories";
import { FeaturedFreelancers } from "./components/FeaturedFreelancers";
import { StatsSection } from "./components/StatsSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { CallToAction } from "./components/CallToAction";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { EmailVerificationPage } from "./components/EmailVerificationPage";
import { AccountSettingsPage } from "./components/AccountSettingsPage";
import { EnhancedFindWorkPage } from "./components/EnhancedFindWorkPage";
import { FindFreelancersPage } from "./components/FindFreelancersPage";
import { FreelancerDashboard } from "./components/FreelancerDashboard";
import { ClientDashboard } from "./components/ClientDashboard";
import { FreelancerProfilePage } from "./components/FreelancerProfilePage";
import { ClientProfilePage } from "./components/ClientProfilePage";
import { FreelancerPublicProfilePage } from "./components/FreelancerPublicProfilePage";
import { ClientPublicProfilePage } from "./components/ClientPublicProfilePage";
import { JobDetailPage } from "./components/JobDetailPage";
import { SubmitProposalPage } from "./components/SubmitProposalPage";
import { ViewProposalPage } from "./components/ViewProposalPage";
import { ProposalsListPage } from "./components/ProposalsListPage";
import { MessagesPage } from "./components/MessagesPage";
import { ProjectDetailPage } from "./components/ProjectDetailPage";
import { EarningsPage } from "./components/EarningsPage";
import { PostJobPage } from "./components/PostJobPage";
import { FeaturesPage } from "./components/FeaturesPage";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { PricingPage } from "./components/PricingPage";
import { TermsPage } from "./components/TermsPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { AccessDeniedPage } from "./components/AccessDeniedPage";
import { SuccessPage } from "./components/SuccessPage";
import { FailurePage } from "./components/FailurePage";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminLoginPage } from "./components/admin/AdminLoginPage";
import { AdminDashboardPage } from "./components/admin/AdminDashboardPage";
import { FreelancerManagementPage } from "./components/admin/FreelancerManagementPage";
import { ClientManagementPage } from "./components/admin/ClientManagementPage";
import { AdminManagementPage } from "./components/admin/AdminManagementPage";
import { VerificationQueuePage } from "./components/admin/VerificationQueuePage";
import { AnalyticsPage } from "./components/admin/AnalyticsPage";
import { InvoicesListPage } from "./components/payments/InvoicesListPage";
import { CreateInvoicePage } from "./components/payments/CreateInvoicePage";
import { InvoiceDetailPage } from "./components/payments/InvoiceDetailPage";
import { PaymentPage } from "./components/payment/PaymentPage";
import { PaymentSuccessPage } from "./components/payment/PaymentSuccessPage";
import { PaymentFailurePage } from "./components/payment/PaymentFailurePage";
import { ClientProjectsPage } from "./components/projects/ClientProjectsPage";
import { FreelancerProjectsPage } from "./components/projects/FreelancerProjectsPage";
import { TransactionsPage } from "./components/payments/TransactionsPage";
import { EscrowManagementPage } from "./components/payments/EscrowManagementPage";
import { PaymentCancelPage } from "./components/payments/PaymentCancelPage";

const queryClient = new QueryClient();

function HomePage() {
  return (
    <div className="w-full min-h-screen bg-background overflow-x-hidden" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw' }}>
      <Header />
      <main className="w-full pt-16" style={{ width: '100%', maxWidth: '100vw' }}>
        <HeroSection />
        <StatsSection />
        <PopularCategories />
        <HowItWorksSection />
        <FeaturedFreelancers />
        <TestimonialsSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}

function AppContent() {
  const { currentPage } = useRouter();
  const { isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your session</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignUpPage />;
    case 'forgot-password':
      return <ForgotPasswordPage />;
    case 'reset-password':
      return <ResetPasswordPage />;
    case 'verify-email':
      return <EmailVerificationPage />;
    case 'account-settings':
      return <AccountSettingsPage />;
    case 'find-work':
      return <EnhancedFindWorkPage />;
    case 'find-freelancers':
      return <FindFreelancersPage />;
    case 'payment':
      return <PaymentPage />;
    case 'payment-success':
      return <PaymentSuccessPage />;
    case 'payment-failure':
      return <PaymentFailurePage />;
    case 'client-projects':
      return <ClientProjectsPage />;
    case 'freelancer-projects':
      return <FreelancerProjectsPage />;
    case 'freelancer-dashboard':
      return <FreelancerDashboard />;
    case 'client-dashboard':
      return <ClientDashboard />;
    case 'freelancer-profile':
      return <FreelancerProfilePage />;
    case 'client-profile':
      return <ClientProfilePage />;
    case 'view-freelancer':
      return <FreelancerPublicProfilePage />;
    case 'view-client':
      return <ClientPublicProfilePage />;
    case 'job-detail':
      return <JobDetailPage />;
    case 'proposals-list':
      return <ProposalsListPage />;
    case 'submit-proposal':
      return <SubmitProposalPage />;
    case 'view-proposal':
      return <ViewProposalPage />;
    case 'messages':
      return <MessagesPage />;
    case 'project-detail':
    case 'project-workspace':
      return <ProjectDetailPage />;
    case 'earnings':
      return <EarningsPage />;
    case 'post-job':
      return <PostJobPage />;
    case 'invoices-list':
      return <InvoicesListPage />;
    case 'create-invoice':
      return <CreateInvoicePage />;
    case 'invoice-detail':
      return <InvoiceDetailPage />;
    case 'transactions':
      return <TransactionsPage />;
    case 'escrow':
      return <EscrowManagementPage />;
    case 'payment-success':
      return <PaymentSuccessPage />;
    case 'payment-cancel':
      return <PaymentCancelPage />;
    case 'features':
      return <FeaturesPage />;
    case 'about':
      return <AboutPage />;
    case 'contact':
      return <ContactPage />;
    case 'pricing':
      return <PricingPage />;
    case 'terms':
      return <TermsPage />;
    case 'privacy':
      return <PrivacyPage />;
      case 'admin-login':
        return <AdminLoginPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
    case 'admin-freelancers':
      return <FreelancerManagementPage />;
    case 'admin-clients':
      return <ClientManagementPage />;
    case 'admin-admins':
      return <AdminManagementPage />;
    case 'admin-verification':
      return <VerificationQueuePage />;
    case 'admin-payments':
      return <div>Payment Analytics - Coming Soon</div>;
    case 'admin-analytics':
      return <AnalyticsPage />;
    case 'admin-settings':
      return <div>System Settings - Coming Soon</div>;
    case '404':
      return <NotFoundPage />;
    case 'access-denied':
      return <AccessDeniedPage />;
    case 'success':
      return <SuccessPage />;
    case 'failure':
      return <FailurePage />;
    case 'home':
    default:
      return <HomePage />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router>
              <AppContent />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

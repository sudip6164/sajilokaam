import { Router, useRouter } from "./components/Router";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";

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
import { FindWorkPage } from "./components/FindWorkPage";
import { FindFreelancersPage } from "./components/FindFreelancersPage";
import { FreelancerDashboard } from "./components/FreelancerDashboard";
import { ClientDashboard } from "./components/ClientDashboard";
import { FreelancerProfilePage } from "./components/FreelancerProfilePage";
import { JobDetailPage } from "./components/JobDetailPage";
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
      return <FindWorkPage />;
    case 'find-freelancers':
      return <FindFreelancersPage />;
    case 'freelancer-dashboard':
      return <FreelancerDashboard />;
    case 'client-dashboard':
      return <ClientDashboard />;
    case 'freelancer-profile':
      return <FreelancerProfilePage />;
    case 'job-detail':
      return <JobDetailPage />;
    case 'messages':
      return <MessagesPage />;
    case 'project-detail':
    case 'project-workspace':
      return <ProjectDetailPage />;
    case 'earnings':
      return <EarningsPage />;
    case 'post-job':
      return <PostJobPage />;
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
    case 'admin-dashboard':
      return <AdminDashboard />;
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

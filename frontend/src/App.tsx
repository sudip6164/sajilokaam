import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import { PublicLayout } from "@/layouts/PublicLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import FreelancerLayout from "@/layouts/FreelancerLayout";
import ClientLayout from "@/layouts/ClientLayout";

// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";
import Success from "@/pages/Success";
import Failure from "@/pages/Failure";
import AccessDenied from "@/pages/AccessDenied";
import Jobs from "@/pages/Jobs";
import JobDetailPublic from "@/pages/JobDetailPublic";

// Auth Pages
import Login from "@/pages/auth/Login";
import AdminLogin from "@/pages/auth/AdminLogin";
import Register from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import EmailVerified from "@/pages/auth/EmailVerified";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ProtectedRoute from "@/components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import VerificationQueue from "@/pages/admin/VerificationQueue";
import Statistics from "@/pages/admin/Statistics";
import Reports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/AdminSettings";

// Freelancer Pages
import FreelancerDashboard from "@/pages/freelancer/FreelancerDashboard";
import AvailableJobs from "@/pages/freelancer/AvailableJobs";
import MyBids from "@/pages/freelancer/MyBids";
import MyProjects from "@/pages/freelancer/MyProjects";
import ProjectDetail from "@/pages/freelancer/ProjectDetail";
import Invoices from "@/pages/freelancer/Invoices";
import Notifications from "@/pages/freelancer/Notifications";
import Profile from "@/pages/freelancer/Profile";

// Client Pages
import ClientDashboard from "@/pages/client/ClientDashboard";
import PostJob from "@/pages/client/PostJob";
import MyJobs from "@/pages/client/MyJobs";
import JobDetail from "@/pages/client/JobDetail";
import ClientProjects from "@/pages/client/ClientProjects";
import ClientInvoices from "@/pages/client/ClientInvoices";
import ClientNotifications from "@/pages/client/ClientNotifications";
import ClientProfile from "@/pages/client/ClientProfile";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetailPublic />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="verification" element={<VerificationQueue />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Freelancer Routes */}
            <Route path="/freelancer" element={<FreelancerLayout />}>
              <Route index element={<FreelancerDashboard />} />
              <Route path="jobs" element={<AvailableJobs />} />
              <Route path="bids" element={<MyBids />} />
              <Route path="projects" element={<MyProjects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Client Routes */}
            <Route path="/client" element={<ClientLayout />}>
              <Route index element={<ClientDashboard />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="projects" element={<ClientProjects />} />
              <Route path="projects/:id" element={<ClientProjects />} />
              <Route path="invoices" element={<ClientInvoices />} />
              <Route path="notifications" element={<ClientNotifications />} />
              <Route path="profile" element={<ClientProfile />} />
            </Route>

            {/* Utility Routes */}
            <Route path="/success" element={<Success />} />
            <Route path="/failure" element={<Failure />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

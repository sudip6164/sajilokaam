import { useState, createContext, useContext, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Page = 'home' | 'login' | 'signup' | 'find-work' | 'find-freelancers' | 'freelancer-dashboard' | 'client-dashboard' | 'freelancer-profile' | 'client-profile' | 'view-freelancer' | 'view-client' | 'job-detail' | 'proposals-list' | 'submit-proposal' | 'view-proposal' | 'messages' | 'project-detail' | 'earnings' | 'features' | 'about' | 'contact' | 'pricing' | 'terms' | 'privacy' | 'forgot-password' | 'reset-password' | 'verify-email' | 'account-settings' | 'admin-login' | 'admin-dashboard' | 'admin-freelancers' | 'admin-clients' | 'admin-admins' | 'admin-verification' | 'admin-payments' | 'admin-analytics' | 'admin-settings' | 'project-workspace' | '404' | 'access-denied' | 'success' | 'failure' | 'post-job' | 'invoices-list' | 'create-invoice' | 'invoice-detail' | 'transactions' | 'escrow' | 'payment-success' | 'payment-cancel';

export type UserType = 'freelancer' | 'client' | null;

interface RouterUser {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
}

interface RouterContextType {
  currentPage: Page;
  navigate: (page: Page, params?: any) => void;
  user: RouterUser | null;
  login: (user: RouterUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  pageParams: any;
}

export const RouterContext = createContext<RouterContextType>({
  currentPage: 'home',
  navigate: () => {},
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  pageParams: null,
});

// Map URL paths to page names
const pathToPage: Record<string, Page> = {
  '/': 'home',
  '/home': 'home',
  '/login': 'login',
  '/signup': 'signup',
  '/admin': 'admin-login',
  '/forgot-password': 'forgot-password',
  '/reset-password': 'reset-password',
  '/verify-email': 'verify-email',
  '/find-work': 'find-work',
  '/find-freelancers': 'find-freelancers',
  '/freelancer-dashboard': 'freelancer-dashboard',
  '/client-dashboard': 'client-dashboard',
  '/admin-dashboard': 'admin-dashboard',
  '/admin-freelancers': 'admin-freelancers',
  '/admin-clients': 'admin-clients',
  '/admin-admins': 'admin-admins',
  '/admin-verification': 'admin-verification',
  '/admin-payments': 'admin-payments',
  '/admin-analytics': 'admin-analytics',
  '/admin-settings': 'admin-settings',
  '/freelancer-profile': 'freelancer-profile',
  '/client-profile': 'client-profile',
  '/view-freelancer': 'view-freelancer',
  '/view-client': 'view-client',
  '/job-detail': 'job-detail',
  '/proposals-list': 'proposals-list',
  '/submit-proposal': 'submit-proposal',
  '/view-proposal': 'view-proposal',
  '/messages': 'messages',
  '/project-detail': 'project-detail',
  '/project-workspace': 'project-workspace',
  '/earnings': 'earnings',
  '/post-job': 'post-job',
  '/invoices-list': 'invoices-list',
  '/create-invoice': 'create-invoice',
  '/invoice-detail': 'invoice-detail',
  '/transactions': 'transactions',
  '/escrow': 'escrow',
  '/payment-success': 'payment-success',
  '/payment-cancel': 'payment-cancel',
  '/features': 'features',
  '/about': 'about',
  '/contact': 'contact',
  '/pricing': 'pricing',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/account-settings': 'account-settings',
  '/404': '404',
  '/access-denied': 'access-denied',
  '/success': 'success',
  '/failure': 'failure',
};

// Map page names to URL paths
const pageToPath: Record<Page, string> = {
  'home': '/',
  'login': '/login',
  'signup': '/signup',
  'admin-login': '/admin',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'verify-email': '/verify-email',
  'find-work': '/find-work',
  'find-freelancers': '/find-freelancers',
  'freelancer-dashboard': '/freelancer-dashboard',
  'client-dashboard': '/client-dashboard',
  'admin-dashboard': '/admin-dashboard',
  'admin-freelancers': '/admin-freelancers',
  'admin-clients': '/admin-clients',
  'admin-admins': '/admin-admins',
  'admin-verification': '/admin-verification',
  'admin-payments': '/admin-payments',
  'admin-analytics': '/admin-analytics',
  'admin-settings': '/admin-settings',
  'freelancer-profile': '/freelancer-profile',
  'client-profile': '/client-profile',
  'view-freelancer': '/view-freelancer',
  'view-client': '/view-client',
  'job-detail': '/job-detail',
  'proposals-list': '/proposals-list',
  'submit-proposal': '/submit-proposal',
  'view-proposal': '/view-proposal',
  'messages': '/messages',
  'project-detail': '/project-detail',
  'project-workspace': '/project-workspace',
  'earnings': '/earnings',
  'post-job': '/post-job',
  'invoices-list': '/invoices-list',
  'create-invoice': '/create-invoice',
  'invoice-detail': '/invoice-detail',
  'transactions': '/transactions',
  'escrow': '/escrow',
  'payment-success': '/payment-success',
  'payment-cancel': '/payment-cancel',
  'features': '/features',
  'about': '/about',
  'contact': '/contact',
  'pricing': '/pricing',
  'terms': '/terms',
  'privacy': '/privacy',
  'account-settings': '/account-settings',
  '404': '/404',
  'access-denied': '/access-denied',
  'success': '/success',
  'failure': '/failure',
};

// Get page from current URL
function getPageFromPath(): Page {
  const path = window.location.pathname;
  const page = pathToPage[path];
  return page || 'home';
}

export function Router({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>(() => getPageFromPath());
  const [pageParams, setPageParams] = useState<any>(null);
  const auth = useAuth();
  
  // Convert AuthContext user to Router user format
  const getRouterUser = (): RouterUser | null => {
    if (!auth.user) return null;
    
    const isFreelancer = auth.hasRole('FREELANCER');
    const isClient = auth.hasRole('CLIENT');
    const isAdmin = auth.hasRole('ADMIN');
    
    // Determine user type (admin is treated as client for routing)
    let type: UserType = null;
    if (isFreelancer) type = 'freelancer';
    else if (isClient || isAdmin) type = 'client';
    
    return {
      id: auth.user.id.toString(),
      name: auth.user.fullName,
      email: auth.user.email,
      type,
    };
  };

  const routerUser = getRouterUser();
  const isAuthenticated = auth.isAuthenticated;

  const navigate = (page: Page, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    
    // Update browser URL
    const path = pageToPath[page] || '/';
    let url = path;
    if (params?.token) {
      url = `${path}?token=${params.token}`;
    } else if (params?.jobId && (page === 'job-detail' || page === 'proposals-list' || page === 'submit-proposal')) {
      url = `${path}?jobId=${params.jobId}`;
    } else if (params?.freelancerId && page === 'view-freelancer') {
      url = `${path}?freelancerId=${params.freelancerId}`;
    } else if (params?.bidId && page === 'view-proposal') {
      url = `${path}?bidId=${params.bidId}`;
    } else if (params?.projectId && page === 'project-detail') {
      url = `${path}?projectId=${params.projectId}`;
    }
    window.history.pushState({ page, params }, '', url);
  };

  // Initialize from URL on mount and handle browser back/forward
  useEffect(() => {
    // Sync page from URL on mount (handles refresh and direct navigation)
    // This only runs once on mount, so we can safely set the page
    const page = getPageFromPath();
    setCurrentPage(page);

    // Parse query parameters (e.g., ?token=... for reset-password, ?jobId=... for job-detail)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const jobId = urlParams.get('jobId');
    const freelancerId = urlParams.get('freelancerId');
    const bidId = urlParams.get('bidId');
    const projectId = urlParams.get('projectId');
    if (token && page === 'reset-password') {
      setPageParams({ token });
    } else if (jobId && (page === 'job-detail' || page === 'proposals-list' || page === 'submit-proposal')) {
      setPageParams({ jobId: parseInt(jobId, 10) });
    } else if (freelancerId && page === 'view-freelancer') {
      setPageParams({ freelancerId: parseInt(freelancerId, 10) });
    } else if (bidId && page === 'view-proposal') {
      setPageParams({ bidId: parseInt(bidId, 10) });
    } else if (projectId && page === 'project-detail') {
      setPageParams({ projectId: parseInt(projectId, 10) });
    }

    // Handle browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      const page = getPageFromPath();
      setCurrentPage(page);
      
      // Parse query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const jobId = urlParams.get('jobId');
      const freelancerId = urlParams.get('freelancerId');
      const bidId = urlParams.get('bidId');
      const projectId = urlParams.get('projectId');
      if (token && page === 'reset-password') {
        setPageParams({ token });
      } else if (jobId && (page === 'job-detail' || page === 'proposals-list' || page === 'submit-proposal')) {
        setPageParams({ jobId: parseInt(jobId, 10) });
      } else if (freelancerId && page === 'view-freelancer') {
        setPageParams({ freelancerId: parseInt(freelancerId, 10) });
      } else if (bidId && page === 'view-proposal') {
        setPageParams({ bidId: parseInt(bidId, 10) });
      } else if (projectId && page === 'project-detail') {
        setPageParams({ projectId: parseInt(projectId, 10) });
      } else {
        setPageParams(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Only run on mount

  const login = (userData: RouterUser) => {
    // This is kept for backward compatibility but AuthContext handles actual login
    // Redirect to appropriate dashboard based on user type
    if (userData.type === 'freelancer') {
      navigate('freelancer-dashboard');
    } else if (userData.type === 'client') {
      navigate('client-dashboard');
    }
  };

  const logout = () => {
    auth.logout();
    navigate('home');
  };

  // Auto-redirect after login
  useEffect(() => {
    // Don't redirect while AuthContext is still loading (handles page refresh)
    if (auth.isLoading) {
      return;
    }

    if (auth.isAuthenticated && routerUser) {
      // Only auto-redirect if we're on login/signup pages
      // Don't redirect from profile pages
      if (currentPage === 'login' || currentPage === 'signup') {
        let targetPage: Page;
        if (routerUser.type === 'freelancer') {
          targetPage = 'freelancer-dashboard';
        } else if (routerUser.type === 'client') {
          targetPage = 'client-dashboard';
        } else {
          return;
        }
        setCurrentPage(targetPage);
        const path = pageToPath[targetPage];
        window.history.pushState({ page: targetPage }, '', path);
      }
      // Ensure profile pages stay on profile pages (don't redirect away)
      if (currentPage === 'client-profile' || currentPage === 'freelancer-profile') {
        // Page is already correct, just ensure URL matches
        const path = pageToPath[currentPage];
        if (window.location.pathname !== path) {
          window.history.replaceState({ page: currentPage }, '', path);
        }
      }
    } else if (!auth.isAuthenticated) {
      // If logged out and on protected page, redirect to home
      // Only do this after AuthContext has finished loading
      const protectedPages: Page[] = ['freelancer-dashboard', 'client-dashboard', 'admin-dashboard', 'messages', 'earnings', 'project-detail', 'project-workspace', 'account-settings', 'freelancer-profile', 'client-profile'];
      if (protectedPages.includes(currentPage)) {
        setCurrentPage('home');
        window.history.pushState({ page: 'home' }, '', '/');
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, routerUser, currentPage]);

  return (
    <RouterContext.Provider value={{ 
      currentPage, 
      navigate, 
      user: routerUser, 
      login, 
      logout, 
      isAuthenticated,
      pageParams
    }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router');
  }
  return context;
}
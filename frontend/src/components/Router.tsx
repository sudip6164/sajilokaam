import { useState, createContext, useContext, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Page = 'home' | 'login' | 'signup' | 'find-work' | 'find-freelancers' | 'freelancer-dashboard' | 'client-dashboard' | 'freelancer-profile' | 'job-detail' | 'messages' | 'project-detail' | 'earnings' | 'features' | 'about' | 'contact' | 'pricing' | 'terms' | 'privacy' | 'forgot-password' | 'reset-password' | 'verify-email' | 'account-settings' | 'admin-dashboard' | 'project-workspace' | '404' | 'access-denied' | 'success' | 'failure';

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

export function Router({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
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
  };

  const login = (userData: RouterUser) => {
    // This is kept for backward compatibility but AuthContext handles actual login
    // Redirect to appropriate dashboard based on user type
    if (userData.type === 'freelancer') {
      setCurrentPage('freelancer-dashboard');
    } else if (userData.type === 'client') {
      setCurrentPage('client-dashboard');
    }
  };

  const logout = () => {
    auth.logout();
    setCurrentPage('home');
  };

  // Auto-redirect after login
  useEffect(() => {
    if (auth.isAuthenticated && routerUser) {
      // Only auto-redirect if we're on login/signup pages
      if (currentPage === 'login' || currentPage === 'signup') {
        if (routerUser.type === 'freelancer') {
          setCurrentPage('freelancer-dashboard');
        } else if (routerUser.type === 'client') {
          setCurrentPage('client-dashboard');
        }
      }
    } else if (!auth.isAuthenticated) {
      // If logged out and on protected page, redirect to home
      const protectedPages: Page[] = ['freelancer-dashboard', 'client-dashboard', 'admin-dashboard', 'messages', 'earnings', 'project-detail', 'project-workspace', 'account-settings'];
      if (protectedPages.includes(currentPage)) {
        setCurrentPage('home');
      }
    }
  }, [auth.isAuthenticated, routerUser, currentPage]);

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
import { useState, createContext, useContext } from 'react';
import React from 'react';

export type Page = 'home' | 'login' | 'signup' | 'find-work' | 'find-freelancers' | 'freelancer-dashboard' | 'client-dashboard' | 'freelancer-profile' | 'job-detail' | 'messages' | 'project-detail' | 'earnings' | 'features' | 'about' | 'contact' | 'pricing' | 'terms' | 'privacy' | 'forgot-password' | 'reset-password' | 'verify-email' | 'account-settings' | 'admin-dashboard' | 'project-workspace' | '404' | 'access-denied' | 'success' | 'failure';

export type UserType = 'freelancer' | 'client' | null;

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  avatar?: string;
}

interface RouterContextType {
  currentPage: Page;
  navigate: (page: Page, params?: any) => void;
  user: User | null;
  login: (user: User) => void;
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
  const [user, setUser] = useState<User | null>(null);
  const [pageParams, setPageParams] = useState<any>(null);

  const navigate = (page: Page, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
  };

  const login = (userData: User) => {
    setUser(userData);
    // Redirect to appropriate dashboard based on user type
    if (userData.type === 'freelancer') {
      setCurrentPage('freelancer-dashboard');
    } else if (userData.type === 'client') {
      setCurrentPage('client-dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const isAuthenticated = user !== null;

  return (
    <RouterContext.Provider value={{ 
      currentPage, 
      navigate, 
      user, 
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
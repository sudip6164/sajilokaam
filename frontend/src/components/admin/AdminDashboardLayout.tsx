import { useState, useEffect } from 'react';
import { useRouter, Page } from '../Router';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Shield,
  CheckSquare,
  Settings,
  DollarSign,
  LogOut,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

export function AdminDashboardLayout({ children, activePage }: AdminDashboardLayoutProps) {
  const { navigate } = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems: Array<{ id: string; label: string; icon: any; page: Page }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, page: 'admin-dashboard' },
    { id: 'freelancers', label: 'Freelancers', icon: Users, page: 'admin-freelancers' },
    { id: 'clients', label: 'Clients', icon: Briefcase, page: 'admin-clients' },
    { id: 'admins', label: 'Admins', icon: Shield, page: 'admin-admins' },
    { id: 'verification', label: 'Verification Queue', icon: CheckSquare, page: 'admin-verification' },
    { id: 'payments', label: 'Payment Analytics', icon: DollarSign, page: 'admin-payments' },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3, page: 'admin-analytics' },
    { id: 'settings', label: 'System Settings', icon: Settings, page: 'admin-settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Avatar className="h-10 w-10 bg-primary">
              <AvatarFallback className="bg-primary text-white">
                {user?.fullName?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-20 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.page)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main 
          className="flex-1 overflow-y-auto pb-6 pl-3 pr-3" 
          style={{ 
            marginLeft: '72px',
            marginRight: '72px',
            paddingTop: '72px'
          }}
        >
          {children}
        </main>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

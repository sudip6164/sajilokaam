import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  CheckCircle,
  Folder,
  MessageSquare,
  Receipt,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface DashboardLayoutProps {
  userRole: "admin" | "freelancer" | "client";
}

const adminNavItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Verification Queue", href: "/admin/verification", icon: CheckCircle, badge: 5 },
  { name: "Statistics", href: "/admin/statistics", icon: BarChart3 },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const freelancerNavItems: NavItem[] = [
  { name: "Dashboard", href: "/freelancer", icon: LayoutDashboard },
  { name: "Available Jobs", href: "/freelancer/jobs", icon: Briefcase },
  { name: "My Bids", href: "/freelancer/bids", icon: FileText },
  { name: "My Projects", href: "/freelancer/projects", icon: Folder },
  { name: "Invoices", href: "/freelancer/invoices", icon: Receipt },
  { name: "Messages", href: "/freelancer/messages", icon: MessageSquare, badge: 3 },
  { name: "Notifications", href: "/freelancer/notifications", icon: Bell, badge: 7 },
  { name: "Profile", href: "/freelancer/profile", icon: User },
];

const clientNavItems: NavItem[] = [
  { name: "Dashboard", href: "/client", icon: LayoutDashboard },
  { name: "Post a Job", href: "/client/post-job", icon: Briefcase },
  { name: "My Jobs", href: "/client/jobs", icon: FileText },
  { name: "My Projects", href: "/client/projects", icon: Folder },
  { name: "Invoices", href: "/client/invoices", icon: Receipt },
  { name: "Messages", href: "/client/messages", icon: MessageSquare, badge: 2 },
  { name: "Notifications", href: "/client/notifications", icon: Bell, badge: 4 },
  { name: "Settings", href: "/client/settings", icon: Settings },
];

export function DashboardLayout({ userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = 
    userRole === "admin" ? adminNavItems : 
    userRole === "freelancer" ? freelancerNavItems : 
    clientNavItems;

  const userName = userRole === "admin" ? "Admin User" : userRole === "freelancer" ? "Ram Sharma" : "ABC Company";
  const userEmail = userRole === "admin" ? "admin@sajilokaam.com" : userRole === "freelancer" ? "ram@email.com" : "abc@company.com";

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">
                  Sajilo<span className="text-primary">Kaam</span>
                </span>
                <p className="text-[10px] text-muted-foreground -mt-1 capitalize">{userRole} Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded-full",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                {userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => navigate("/login")}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 h-9 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {userName.charAt(0)}
                </div>
                <span className="text-sm font-medium">{userName.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

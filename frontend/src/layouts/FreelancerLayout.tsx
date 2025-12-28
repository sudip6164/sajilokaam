import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  Briefcase, 
  FileText, 
  FolderKanban, 
  Receipt, 
  Bell, 
  User, 
  Menu, 
  X, 
  Home,
  LogOut,
  ChevronDown,
  Search,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const sidebarLinks = [
  { name: "Dashboard", href: "/freelancer", icon: Home },
  { name: "Available Jobs", href: "/freelancer/jobs", icon: Briefcase },
  { name: "My Bids", href: "/freelancer/bids", icon: FileText },
  { name: "My Projects", href: "/freelancer/projects", icon: FolderKanban },
  { name: "Teams", href: "/freelancer/teams", icon: Users },
  { name: "Invoices", href: "/freelancer/invoices", icon: Receipt },
  { name: "Notifications", href: "/freelancer/notifications", icon: Bell },
  { name: "Profile", href: "/freelancer/profile", icon: User },
];

export default function FreelancerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const notificationCount = 5;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">SK</span>
              </div>
              <div>
                <span className="font-bold text-lg text-foreground">Sajilo Kaam</span>
                <p className="text-xs text-muted-foreground">Freelancer Portal</p>
              </div>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname === link.href || 
                (link.href !== "/freelancer" && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.name}</span>
                  {link.name === "Notifications" && notificationCount > 0 && (
                    <Badge className="ml-auto bg-accent text-accent-foreground">
                      {notificationCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User card */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Avatar>
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Ram Kumar</p>
                <p className="text-xs text-muted-foreground">Verified Freelancer</p>
              </div>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary">
                Pro
              </Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search jobs, projects..." 
                  className="pl-10 w-64 bg-muted/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                      <AvatarFallback>RK</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">Ram Kumar</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/freelancer/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/login" className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { Button } from "./ui/button";
import { Menu, Bell, User, LayoutDashboard, MessageSquare, LogOut, Home } from "lucide-react";
import { useRouter } from "./Router";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { NotificationsDropdown } from "./notifications/NotificationsDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { navigate, isAuthenticated, user: routerUser } = useRouter();
  const { user: authUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use authUser for profile info, routerUser for type
  const user = authUser || routerUser;
  const isFreelancer = authUser?.roles.some(r => r.name === 'FREELANCER');
  const isClient = authUser?.roles.some(r => r.name === 'CLIENT');
  const isAdmin = authUser?.roles.some(r => r.name === 'ADMIN');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <button 
          onClick={() => navigate('home')}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-semibold text-foreground">SajiloKaam</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('home')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('find-work')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Find Work
          </button>
          <button 
            onClick={() => navigate('find-freelancers')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Find Freelancers
          </button>
          <button 
            onClick={() => navigate('features')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => navigate('about')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => navigate('pricing')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => navigate('contact')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Auth & CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
                <NotificationsDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={undefined} alt={authUser?.fullName || routerUser?.name || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                        {(authUser?.fullName || routerUser?.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:block max-w-[120px] truncate">
                      {authUser?.fullName || routerUser?.name || 'User'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem 
                    onClick={() => {
                      if (isFreelancer) {
                        navigate('freelancer-profile');
                      } else if (isClient) {
                        navigate('client-profile');
                      } else {
                        navigate('account-settings');
                      }
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate(
                      isAdmin ? 'admin-dashboard' : 
                      isFreelancer ? 'freelancer-dashboard' : 
                      'client-dashboard'
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('messages')}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      logout();
                      navigate('home');
                    }}
                    variant="destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('login')}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('signup')}
              >
                Sign Up
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                onClick={() => navigate('post-job')}
              >
                Post a Job
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
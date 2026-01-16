import { Button } from "./ui/button";
import { Menu, Bell, User, LayoutDashboard, MessageSquare, LogOut } from "lucide-react";
import { useRouter } from "./Router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { profileApi, notificationsApi } from "@/lib/api";
import { NotificationsDropdown } from "./notifications/NotificationsDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function NotificationBellWithBadge() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsApi.list({ read: false, page: 0, size: 1 });
      setUnreadCount(data.totalElements || 0);
    } catch (error) {
      // Ignore errors
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>
      <NotificationsDropdown 
        isOpen={showNotifications} 
        onClose={() => {
          setShowNotifications(false);
          fetchUnreadCount(); // Refresh count when closing
        }} 
      />
    </div>
  );
}

export function Header() {
  const { navigate, isAuthenticated, user: routerUser } = useRouter();
  const { user: authUser, logout } = useAuth();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  
  // Use authUser for profile info, routerUser for type
  const user = authUser || routerUser;
  const isFreelancer = authUser?.roles.some(r => r.name === 'FREELANCER');
  const isClient = authUser?.roles.some(r => r.name === 'CLIENT');
  const isAdmin = authUser?.roles.some(r => r.name === 'ADMIN');

  // Fetch profile picture
  useEffect(() => {
    if (isAuthenticated && (isFreelancer || isClient)) {
      fetchProfilePicture();
    }
  }, [isAuthenticated, isFreelancer, isClient]);

  const fetchProfilePicture = async () => {
    try {
      if (isFreelancer) {
        const profile = await profileApi.getFreelancerProfile();
        setProfilePictureUrl(profile.profilePictureUrl || null);
      } else if (isClient) {
        const profile = await profileApi.getClientProfile();
        setProfilePictureUrl(profile.profilePictureUrl || null);
      }
    } catch (error) {
      // Profile might not exist yet, that's okay
      console.debug('Profile not found or error fetching profile picture');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 w-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <button 
          onClick={() => navigate('home')}
          className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer border-0 bg-transparent p-0 m-0"
          style={{ outline: 'none', boxShadow: 'none', border: 'none', borderWidth: 0, borderStyle: 'none' }}
          tabIndex={0}
        >
          <img 
            src="/logo.png" 
            alt="SajiloKaam Logo" 
            className="h-20 w-20 object-contain"
            style={{ display: 'block' }}
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('home')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
          >
            Home
          </button>
          {/* Show "Find Work" only for freelancers or non-authenticated users */}
          {(!isAuthenticated || isFreelancer) && (
            <button 
              onClick={() => navigate('find-work')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
            >
              Find Work
            </button>
          )}
          {/* Show "Find Freelancers" only for clients or non-authenticated users */}
          {(!isAuthenticated || isClient || isAdmin) && (
            <button 
              onClick={() => navigate('find-freelancers')}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
            >
              Find Freelancers
            </button>
          )}
          <button 
            onClick={() => navigate('features')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => navigate('about')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={() => navigate('pricing')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
          >
            Pricing
          </button>
          <button 
            onClick={() => navigate('contact')}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Auth & CTA */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Notifications */}
              <NotificationBellWithBadge />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer focus:outline-none focus-visible:outline-none focus-visible:ring-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profilePictureUrl || undefined} alt={authUser?.fullName || routerUser?.name || 'User'} />
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
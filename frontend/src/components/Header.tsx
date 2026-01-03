import { Button } from "./ui/button";
import { Menu, Bell } from "lucide-react";
import { useRouter } from "./Router";
import { useState } from "react";
import { NotificationsDropdown } from "./notifications/NotificationsDropdown";

export function Header() {
  const { navigate, isAuthenticated, user } = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

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
          {isAuthenticated ? (
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

              {/* Messages */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('messages')}
              >
                Messages
              </Button>

              {/* Admin Access (for development/demo) */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('admin-dashboard')}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                title="Admin Dashboard"
              >
                ⚙️
              </Button>

              {/* Dashboard */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(user?.type === 'freelancer' ? 'freelancer-dashboard' : 'client-dashboard')}
              >
                Dashboard
              </Button>
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
            </>
          )}
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            onClick={() => navigate('find-freelancers')}
          >
            Post a Job
          </Button>
        </div>

        {/* Mobile Menu */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
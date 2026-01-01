import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Briefcase, User, Building2, MessageSquare, FileText, FolderKanban, Receipt, Bell, LogOut, Settings, Home, DollarSign, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Top navigation - Public pages
const topNavigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];

// Bottom navigation - Role-based actions
const freelancerNav = [
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Bids", href: "/bids", icon: FileText },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Messages", href: "/messages", icon: MessageSquare },
];

const clientNav = [
  { name: "Post Job", href: "/post-job", icon: Briefcase },
  { name: "Jobs", href: "/my-jobs", icon: FileText },
  { name: "Projects", href: "/my-projects", icon: FolderKanban },
  { name: "Freelancers", href: "/freelancers", icon: User },
  { name: "Messages", href: "/client-messages", icon: MessageSquare },
];

const publicBottomNav = [
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Freelancers", href: "/freelancers", icon: User },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Safely get auth context
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // If AuthContext is not available, use default values
    authContext = {
      isAuthenticated: false,
      user: null,
      hasRole: () => false,
      logout: () => {},
    };
  }
  
  const { isAuthenticated, user, hasRole, logout } = authContext;
  
  // Load profile picture for freelancers
  useEffect(() => {
    if (isAuthenticated && hasRole("FREELANCER")) {
      profileApi.getFreelancerProfile()
        .then(profile => {
          if (profile.profilePictureUrl) {
            setProfilePictureUrl(profile.profilePictureUrl);
          }
        })
        .catch(() => {
          // Silently fail
        });
    }
  }, [isAuthenticated, hasRole]);
  
  const isFreelancer = hasRole("FREELANCER");
  const isClient = hasRole("CLIENT");
  const isAdmin = hasRole("ADMIN");
  
  const bottomNav = isFreelancer ? freelancerNav : isClient ? clientNav : publicBottomNav;
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/80 backdrop-blur-lg">
      {/* Top Navbar - Public Pages */}
      <nav className="bg-primary border-b border-primary/20">
        <div className="container mx-auto flex items-center justify-between py-2 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary-foreground tracking-tight">
              Sajilo<span className="text-primary-foreground/80">Kaam</span>
            </span>
          </Link>

          {/* Top Nav Links - Desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {topNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  location.pathname === item.href
                    ? "text-primary-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex lg:items-center lg:gap-3">
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="secondary" size="sm" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {isFreelancer && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" asChild title="Notifications">
                    <Link to="/freelancer/notifications">
                      <Bell className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {isClient && (
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10" asChild title="Notifications">
                    <Link to="/client/notifications">
                      <Bell className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full text-primary-foreground hover:bg-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profilePictureUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'User'}`} />
                        <AvatarFallback className="text-xs bg-white/20 text-primary-foreground">
                          {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                        <div className="flex gap-1 mt-1">
                          {user?.roles.map((role) => (
                            <Badge key={role.id} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isFreelancer && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/invoices">
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Invoices</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/freelancer">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isClient && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/client-profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/client-invoices">
                            <Receipt className="mr-2 h-4 w-4" />
                            <span>Invoices</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/client">
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Navbar - Role-based Actions */}
      <nav className="bg-background border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center justify-center gap-6 py-3 px-4">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-primary relative py-1",
                  location.pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {location.pathname === item.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-background border-b border-border",
          mobileMenuOpen ? "max-h-[800px]" : "max-h-0"
        )}
      >
        <div className="container mx-auto py-4 space-y-2">
          {/* Top Navigation - Mobile */}
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
            Pages
          </div>
          {topNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Bottom Navigation - Mobile */}
          <div className="pt-4 border-t border-border">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
              {isAuthenticated ? "Actions" : "Browse"}
            </div>
            {bottomNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Account Section - Mobile */}
          {isAuthenticated && (
            <div className="pt-4 border-t border-border">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                Account
              </div>
              <Link
                to={isFreelancer ? "/freelancer/profile" : "/client/profile"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              {(isFreelancer || isClient) && (
                <Link
                  to={isFreelancer ? "/freelancer" : "/client"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <Briefcase className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button variant="hero" asChild className="w-full">
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

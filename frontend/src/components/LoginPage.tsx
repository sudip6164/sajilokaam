import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { ArrowLeft, Eye, EyeOff, Github, AlertCircle } from "lucide-react";
import { useRouter } from "./Router";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/lib/validation";

// Social login icons (using Github as example, would include Google, LinkedIn, etc.)
const socialLogins = [
  { name: 'Google', icon: '🔷', color: 'hover:bg-blue-50 hover:border-blue-300' },
  { name: 'GitHub', icon: Github, color: 'hover:bg-gray-50 hover:border-gray-300' },
  { name: 'LinkedIn', icon: '💼', color: 'hover:bg-blue-50 hover:border-blue-400' },
];

export function LoginPage() {
  const { navigate } = useRouter();
  const { login: authLogin, user: authUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  useEffect(() => {
    if (authUser) {
      const isFreelancer = authUser.roles.some(r => r.name === 'FREELANCER');
      const isClient = authUser.roles.some(r => r.name === 'CLIENT');
      const isAdmin = authUser.roles.some(r => r.name === 'ADMIN');
      
      if (isAdmin) {
        navigate('admin-dashboard');
      } else if (isFreelancer) {
        navigate('freelancer-dashboard');
      } else if (isClient) {
        navigate('client-dashboard');
      }
    }
  }, [authUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    
    // Validate password
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      return;
    }
    
    try {
      setIsLoading(true);
      await authLogin(formData.email, formData.password);
      
      // Handle remember me - store token with longer expiry if needed
      // (Currently token expiry is handled by backend, but we can add a flag)
      if (formData.rememberMe) {
        // Could store a flag in localStorage to remember user
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }
    } catch (error: any) {
      // Show error in form instead of just toast
      if (error.response?.status === 401) {
        setErrors({ 
          password: 'Invalid email or password. Please check your credentials and try again.' 
        });
      } else if (error.response?.status === 400) {
        setErrors({ email: 'Invalid email format' });
      } else if (error.message) {
        setErrors({ password: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (field === 'email' && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (field === 'password' && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    
    // Real-time email validation
    if (field === 'email' && typeof value === 'string') {
      const emailValidation = validateEmail(value);
      if (value && !emailValidation.valid) {
        setErrors(prev => ({ ...prev, email: emailValidation.error }));
      }
    }
  };

  const handleDemoLogin = async (userType: 'freelancer' | 'client') => {
    try {
      setIsLoading(true);
      const demoEmail = userType === 'freelancer' ? 'freelancer@demo.com' : 'client@demo.com';
      const demoPassword = 'demo123';
      
      await authLogin(demoEmail, demoPassword);
      // Navigation handled by useEffect watching authUser
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-[100] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="flex h-16 max-w-7xl mx-auto items-center justify-between">
            <button 
              onClick={() => navigate('home')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
            
            <button 
              onClick={() => navigate('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-foreground">SajiloKaam</span>
            </button>

            <div className="w-[100px]"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full px-4 py-8 md:py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>


            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`mt-1.5 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('signup')}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <button 
                onClick={() => navigate('terms')}
                className="text-primary hover:underline"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                onClick={() => navigate('privacy')}
                className="text-primary hover:underline"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
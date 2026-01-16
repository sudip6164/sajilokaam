import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ArrowLeft, Eye, EyeOff, User, Briefcase, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "./Router";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateEmail, validatePassword, validateName } from "@/lib/validation";

export function SignUpPage() {
  const { navigate } = useRouter();
  const { register: authRegister, user: authUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    firstName?: string; 
    lastName?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [formData, setFormData] = useState({
    userType: 'freelancer',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
    
    // Validate first name
    const firstNameValidation = validateName(formData.firstName);
    if (!firstNameValidation.valid) {
      setErrors({ firstName: firstNameValidation.error });
      return;
    }
    
    // Validate last name
    const lastNameValidation = validateName(formData.lastName);
    if (!lastNameValidation.valid) {
      setErrors({ lastName: lastNameValidation.error });
      return;
    }
    
    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setErrors({ email: emailValidation.error });
      return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setErrors({ password: passwordValidation.errors[0] || 'Password is required' });
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    
    try {
      setIsLoading(true);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const role = formData.userType === 'freelancer' ? 'FREELANCER' : 'CLIENT';
      
      await authRegister(formData.email, formData.password, fullName, role);
      // Router will auto-redirect based on user role via useEffect
    } catch (error: any) {
      // Error already handled by AuthContext, but we can add field-specific errors
      if (error.response?.status === 409) {
        // Email already exists
        setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (field === 'firstName' && errors.firstName) {
      setErrors(prev => ({ ...prev, firstName: undefined }));
    }
    if (field === 'lastName' && errors.lastName) {
      setErrors(prev => ({ ...prev, lastName: undefined }));
    }
    if (field === 'email' && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (field === 'password' && errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (field === 'confirmPassword' && errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    // Real-time validation
    if (field === 'firstName' && typeof value === 'string') {
      const validation = validateName(value);
      if (value && !validation.valid) {
        setErrors(prev => ({ ...prev, firstName: validation.error }));
      }
    }
    
    if (field === 'lastName' && typeof value === 'string') {
      const validation = validateName(value);
      if (value && !validation.valid) {
        setErrors(prev => ({ ...prev, lastName: validation.error }));
      }
    }
    
    if (field === 'email' && typeof value === 'string') {
      const validation = validateEmail(value);
      if (value && !validation.valid) {
        setErrors(prev => ({ ...prev, email: validation.error }));
      }
    }
    
    if (field === 'password' && typeof value === 'string') {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
      if (value && !validation.valid) {
        setErrors(prev => ({ ...prev, password: validation.errors[0] }));
      }
      
      // Check password match if confirm password is filled
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
      }
    }
    
    if (field === 'confirmPassword' && typeof value === 'string') {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (value && value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
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
              <img 
                src="/logo.png" 
                alt="SajiloKaam Logo" 
                className="h-10 w-10 object-contain"
              />
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
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">Join SajiloKaam</h1>
              <p className="text-muted-foreground">
                Create your account and start your journey
              </p>
            </div>

            {/* User Type Selection */}
            <div className="space-y-3 mb-6">
              <Label className="text-sm font-medium">I want to:</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'freelancer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    formData.userType === 'freelancer'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <User className={`h-6 w-6 mb-2 ${formData.userType === 'freelancer' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${formData.userType === 'freelancer' ? 'text-primary' : 'text-foreground'}`}>Find Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'client')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
                    formData.userType === 'client'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <Briefcase className={`h-6 w-6 mb-2 ${formData.userType === 'client' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${formData.userType === 'client' ? 'text-primary' : 'text-foreground'}`}>Hire Talent</span>
                </button>
              </div>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Create account</span>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className={`mt-1.5 ${errors.firstName ? 'border-destructive focus:border-destructive' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                  {errors.firstName && (
                    <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.firstName}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className={`mt-1.5 ${errors.lastName ? 'border-destructive focus:border-destructive' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                  {errors.lastName && (
                    <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.lastName}</span>
                    </div>
                  )}
                </div>
              </div>

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
                    placeholder="Create a strong password"
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
                {formData.password && !errors.password && passwordStrength && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength === 'weak' ? 'bg-destructive w-1/3' :
                            passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                            'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength === 'weak' ? 'text-destructive' :
                        passwordStrength === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength === 'weak' ? 'Weak' :
                         passwordStrength === 'medium' ? 'Medium' :
                         'Strong'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use 8+ characters with a mix of letters, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pr-10 ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500 focus:border-green-500' : ''}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
                {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <button 
                      type="button"
                      onClick={() => navigate('terms')}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button 
                      type="button"
                      onClick={() => navigate('privacy')}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Privacy Policy
                    </button>
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Protected by industry-standard encryption and security measures
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from './Router';
import { Header } from './Header';
import { authApi } from '@/lib/api';
import { validatePassword } from '@/lib/validation';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const { navigate, pageParams } = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Get token from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || pageParams?.token;
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('forgot-password');
    }
  }, [pageParams, navigate]);

  const getToken = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || pageParams?.token || null;
  };

  const passwordsMatch = password === confirmPassword && password !== '' && !errors.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setErrors({ password: passwordValidation.errors[0] || 'Password is required' });
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Invalid or missing reset token');
      navigate('forgot-password');
      return;
    }
    
    try {
      setIsLoading(true);
      await authApi.resetPassword(token, password);
      setIsSubmitted(true);
      toast.success('Password reset successfully!');
      // Navigate to login after a delay
      setTimeout(() => navigate('login'), 2000);
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Invalid or expired reset token';
        setErrors({ password: message });
        toast.error(message);
      } else if (error.response?.status === 404) {
        setErrors({ password: 'Reset token not found or expired' });
        toast.error('Reset token not found or expired');
      } else {
        setErrors({ password: 'Failed to reset password. Please try again.' });
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    
    // Clear error when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    
    // Real-time password validation
    if (value) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, password: validation.errors[0] }));
      }
      
      // Check password match if confirm password is filled
      if (confirmPassword) {
        if (value !== confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: undefined }));
        }
      }
    } else {
      setPasswordStrength(null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Clear error when user starts typing
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    // Check password match
    if (value && value !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (value && value === password) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Header />
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Reset Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <Button
              onClick={() => navigate('login')}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-6">
            <Lock className="h-6 w-6 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-8">
            Create a strong password for your account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
              {password && !errors.password && passwordStrength && (
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

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className={`pr-10 ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : confirmPassword && password === confirmPassword ? 'border-green-500 focus:border-green-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
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
              {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1 mt-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
              size="lg"
              disabled={!passwordsMatch || isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => navigate('login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
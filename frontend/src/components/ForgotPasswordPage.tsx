import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from './Router';
import { Header } from './Header';
import { authApi } from '@/lib/api';
import { validateEmail } from '@/lib/validation';

export function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      // Handle different error cases
      if (err.response?.status === 404) {
        // Endpoint not found (backend issue) or email not found
        // Check if it's the endpoint that's missing (no response data) vs email not found
        if (!err.response?.data || Object.keys(err.response.data).length === 0) {
          // Endpoint doesn't exist - show error
          setError('Password reset feature is not available. Please contact support.');
        } else {
          // Email not found - don't reveal this for security, show generic message
          setError('If an account exists with this email, you will receive password reset instructions.');
          // Still show success state to prevent email enumeration
          setIsSubmitted(true);
        }
      } else if (err.response?.status === 429) {
        // Rate limiting
        setError('Too many requests. Please try again later.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.request && !err.response) {
        // Network error
        setError('Network error. Please check your connection and try again.');
      } else {
        // Generic error - show message from server or default
        const errorMessage = err.response?.data?.message || 'Failed to send reset email. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Real-time email validation
    if (value && !validateEmail(value).valid) {
      setError(validateEmail(value).error || 'Invalid email address');
    } else if (value && validateEmail(value).valid) {
      setError('');
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Header />
        <div className="w-full max-w-md">
          {/* Back Button */}
          <div className="sticky top-0 z-[100] bg-muted/20 backdrop-blur-sm pb-4">
            <button
              onClick={() => navigate('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </div>

          {/* Success Card */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent password reset instructions to <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              If you don't see the email, check your spam folder or try again.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('login')}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Back to Login
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setError('');
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      <div className="w-full max-w-md">
        {/* Back Button - Sticky */}
        <div className="sticky top-0 z-[100] bg-muted/20 backdrop-blur-sm pb-4">
          <button
            onClick={() => navigate('login')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 mb-6">
            <Mail className="h-6 w-6 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground mb-8">
            No worries! Enter your email address and we'll send you instructions to reset your password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="mb-2">
                Email Address
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="john@example.com"
                required
                className={error ? 'border-destructive' : ''}
              />
              {error && (
                <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              size="lg"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Remember your password? </span>
            <button
              onClick={() => navigate('login')}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
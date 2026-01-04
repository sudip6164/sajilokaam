import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from './Router';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { validateEmail } from '@/lib/validation';

type VerificationStatus = 'loading' | 'success' | 'error' | 'resend';

export function EmailVerificationPage() {
  const { navigate, pageParams } = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Get token from URL and verify on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || pageParams?.token;
    
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
    }
  }, [pageParams]);

  const verifyEmail = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      setStatus('success');
      toast.success('Email verified successfully!');
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data?.message || 'Invalid or expired verification token';
        setStatus('error');
        toast.error(message);
      } else {
        setStatus('error');
        toast.error('Failed to verify email. Please try again.');
      }
    }
  };

  // Countdown for resend button
  useEffect(() => {
    if (status === 'resend' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, status]);

  const handleResend = async () => {
    // Validate email if provided
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setEmailError(emailValidation.error || 'Invalid email address');
        return;
      }
    }

    try {
      setIsResending(true);
      setEmailError('');
      
      if (email) {
        await authApi.resendVerification(email);
        toast.success('Verification email sent! Check your inbox.');
      } else {
        // If no email provided, we can't resend - show error
        setEmailError('Please enter your email address');
        setIsResending(false);
        return;
      }
      
      setStatus('resend');
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setEmailError(error.response.data?.message || 'Invalid email address');
      } else {
        setEmailError('Failed to send verification email. Please try again.');
        toast.error('Failed to send verification email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            {/* Loading Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">Verifying Your Email</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-6">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">Email Verified!</h1>
            <p className="text-muted-foreground mb-8">
              Your email has been successfully verified. You can now access all features of your account.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  // Navigate to appropriate dashboard based on user role
                  // For now, just go to home - user can navigate from there
                  navigate('home');
                }}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Continue
              </Button>
              <Button
                onClick={() => navigate('home')}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error' || status === 'resend') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-3">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't verify your email. The link may have expired or been already used.
            </p>

            {/* Info Box */}
            <div className="bg-muted/30 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium mb-2 text-sm">Common issues:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Verification link has expired (valid for 24 hours)</li>
                <li>Email was already verified</li>
                <li>Link was clicked multiple times</li>
              </ul>
            </div>

            {/* Resend Form */}
            {status === 'error' && (
              <div className="mb-6">
                <Label htmlFor="resend-email" className="text-sm font-medium mb-2">
                  Enter your email to resend verification
                </Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className={emailError ? 'border-destructive' : ''}
                />
                {emailError && (
                  <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {status === 'error' && (
                <Button
                  onClick={handleResend}
                  disabled={isResending || (!canResend && status === 'resend')}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  {isResending 
                    ? 'Sending...' 
                    : !canResend && status === 'resend' 
                      ? `Resend in ${countdown}s` 
                      : 'Resend Verification Email'
                  }
                </Button>
              )}
              <Button
                onClick={() => navigate('login')}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

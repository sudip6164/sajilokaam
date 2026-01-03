import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

type VerificationStatus = 'loading' | 'success' | 'error' | 'resend';

export function EmailVerificationPage() {
  const { navigate } = useRouter();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Simulate verification on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // Randomly succeed or fail for demo
      const success = Math.random() > 0.3;
      setStatus(success ? 'success' : 'error');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Countdown for resend button
  useEffect(() => {
    if (status === 'resend' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, status]);

  const handleResend = () => {
    setStatus('resend');
    setCountdown(60);
    setCanResend(false);
    
    // Simulate resend
    setTimeout(() => {
      alert('Verification email sent! Check your inbox.');
    }, 500);
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
                onClick={() => navigate('freelancer-dashboard')}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                Go to Dashboard
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

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                disabled={!canResend && status === 'resend'}
                className="w-full bg-gradient-to-r from-primary to-secondary"
              >
                {!canResend && status === 'resend' 
                  ? `Resend in ${countdown}s` 
                  : 'Resend Verification Email'
                }
              </Button>
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

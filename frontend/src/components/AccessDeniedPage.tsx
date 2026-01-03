import { ShieldX } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

export function AccessDeniedPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-3xl font-bold mb-3">Access Denied</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('home')}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

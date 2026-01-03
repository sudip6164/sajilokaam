import { XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

interface FailurePageProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function FailurePage({ 
  title = 'Something Went Wrong',
  message = 'An error occurred while processing your request. Please try again.',
  actionLabel = 'Try Again',
  onAction
}: FailurePageProps) {
  const { navigate } = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8">
          {message}
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('home')}
          >
            Go Home
          </Button>
          <Button 
            onClick={handleAction}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

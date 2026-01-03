import { CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

interface SuccessPageProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SuccessPage({ 
  title = 'Success!',
  message = 'Your action was completed successfully.',
  actionLabel = 'Continue',
  onAction
}: SuccessPageProps) {
  const { navigate } = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      navigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-success/10 p-6">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8">
          {message}
        </p>

        {/* CTA */}
        <Button 
          size="lg"
          onClick={handleAction}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

import { SearchX } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';

export function NotFoundPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Large 404 with gradient */}
        <h1 className="text-9xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          404
        </h1>
        
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <SearchX className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Title and Description */}
        <h2 className="text-3xl font-bold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* CTA */}
        <Button 
          size="lg"
          onClick={() => navigate('home')}
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
}

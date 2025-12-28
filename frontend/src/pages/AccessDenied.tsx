import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Access Denied
          </h1>

          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. This could be because:
          </p>

          <ul className="text-left text-sm text-muted-foreground space-y-2 mb-8 bg-muted/50 rounded-lg p-4">
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              You need to log in to access this resource
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              Your account doesn't have the required permissions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-destructive">•</span>
              The resource is restricted to specific user roles
            </li>
          </ul>

          <div className="space-y-3">
            <Button asChild className="w-full gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Go to Login
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Think this is a mistake?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;

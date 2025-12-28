import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailVerified() {
  return (
    <div className="text-center animate-fade-in">
      <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-secondary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h2>
      <p className="text-muted-foreground mb-8">Your account has been verified successfully. You can now start using Sajilo Kaam.</p>
      <Button variant="hero" size="lg" asChild>
        <Link to="/login">Continue to Login</Link>
      </Button>
    </div>
  );
}

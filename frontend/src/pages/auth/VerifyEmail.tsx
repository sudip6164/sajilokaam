import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  return (
    <div className="text-center animate-fade-in">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
      <p className="text-muted-foreground mb-6">We've sent a verification link to your email address. Please click the link to verify your account.</p>
      <Button variant="outline" asChild className="mb-4">
        <Link to="/login"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
      </Button>
      <p className="text-sm text-muted-foreground">Didn't receive the email? <button className="text-primary hover:underline">Resend</button></p>
    </div>
  );
}

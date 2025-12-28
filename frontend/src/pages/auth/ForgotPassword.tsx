import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: "Email Sent", description: "Check your inbox for reset instructions" });
    setSent(true);
    setIsLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
        <p className="text-muted-foreground mb-6">We've sent password reset instructions to {email}</p>
        <Button variant="outline" asChild><Link to="/login"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h2>
      <p className="text-muted-foreground mb-8">Enter your email and we'll send you reset instructions.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
      <p className="text-center mt-6"><Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></p>
    </div>
  );
}

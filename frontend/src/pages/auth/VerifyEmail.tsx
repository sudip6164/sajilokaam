import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const email = searchParams.get("email");

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address required");
      return;
    }
    setIsResending(true);
    try {
      // TODO: Replace with actual endpoint when backend implements it
      await api.post("/auth/resend-verification", { email });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 501) {
        toast.info("Email verification feature coming soon.");
      } else {
        toast.error(error.response?.data?.message || "Failed to resend email");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h2>
      <p className="text-muted-foreground mb-6">
        {email 
          ? `We've sent a verification link to ${email}. Please click the link to verify your account.`
          : "We've sent a verification link to your email address. Please click the link to verify your account."}
      </p>
      <Button variant="outline" asChild className="mb-4">
        <Link to="/login"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
      </Button>
      <p className="text-sm text-muted-foreground">
        Didn't receive the email?{" "}
        <button 
          className="text-primary hover:underline" 
          onClick={handleResend}
          disabled={isResending || !email}
        >
          {isResending ? "Sending..." : "Resend"}
        </button>
      </p>
    </div>
  );
}

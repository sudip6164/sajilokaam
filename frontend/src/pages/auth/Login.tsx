import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"freelancer" | "client" | "both">("both");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && user && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname;
      
      // If there's an intended destination, use it
      if (from && !from.startsWith("/login") && !from.startsWith("/register")) {
        navigate(from, { replace: true });
        return;
      }
      
      // Redirect based on role
      const roles = user.roles.map((r) => r.name);
      
      if (roles.includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else if (roles.includes("CLIENT")) {
        navigate("/client", { replace: true });
      } else if (roles.includes("FREELANCER")) {
        navigate("/freelancer", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      
      setLoginSuccess(false);
    }
  }, [loginSuccess, user, isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      setLoginSuccess(true);
      // The useEffect will handle the redirect once user is loaded
    } catch (error) {
      // Error is already handled by auth context
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
      <p className="text-muted-foreground mb-6">Sign in to continue to Sajilo Kaam</p>

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setLoginType("freelancer")}
          className={cn(
            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
            loginType === "freelancer"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Briefcase className="w-5 h-5" />
          <span className="font-medium">Freelancer</span>
        </button>
        <button
          type="button"
          onClick={() => setLoginType("client")}
          className={cn(
            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
            loginType === "client"
              ? "border-secondary bg-secondary/5 text-secondary"
              : "border-border text-muted-foreground hover:border-secondary/50"
          )}
        >
          <Building2 className="w-5 h-5" />
          <span className="font-medium">Client</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="email" placeholder="you@example.com" className="pl-11" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11" value={formData.password} onChange={e => setFormData(p => ({...p, password: e.target.value}))} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded border-input" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : loginType === "both" ? "Sign In" : `Sign In as ${loginType === "freelancer" ? "Freelancer" : "Client"}`}
        </Button>
      </form>

      <p className="text-center text-muted-foreground mt-8">
        Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

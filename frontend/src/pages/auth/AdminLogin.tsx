import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Handle redirect after successful login
  useEffect(() => {
    if (loginSuccess && user && isAuthenticated) {
      const roles = user.roles.map((r) => r.name);
      
      // Only allow admin access
      if (roles.includes("ADMIN")) {
        const from = (location.state as any)?.from?.pathname;
        navigate(from || "/admin", { replace: true });
      } else {
        toast.error("Access denied. Admin privileges required.");
        navigate("/login", { replace: true });
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
    } catch (error) {
      setLoginSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
      </div>
      <p className="text-muted-foreground mb-8 text-center">
        Sign in with your admin credentials to access the admin panel
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="email" 
              placeholder="admin@example.com" 
              className="pl-11" 
              value={formData.email} 
              onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              className="pl-11 pr-11" 
              value={formData.password} 
              onChange={e => setFormData(p => ({...p, password: e.target.value}))} 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In as Admin"}
        </Button>
      </form>

      <p className="text-center text-muted-foreground mt-8">
        Not an admin? <Link to="/login" className="text-primary font-medium hover:underline">Regular Login</Link>
      </p>
    </div>
  );
}


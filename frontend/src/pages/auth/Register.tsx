import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"freelancer" | "client">("freelancer");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: "Account created!", description: "Please verify your email" });
    navigate("/verify-email");
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
      <p className="text-muted-foreground mb-6">Join Nepal's #1 freelance platform</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[{ type: "freelancer" as const, icon: Briefcase, label: "Freelancer" }, { type: "client" as const, icon: Building2, label: "Client" }].map(opt => (
          <button key={opt.type} type="button" onClick={() => setAccountType(opt.type)} className={cn("flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all", accountType === opt.type ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>
            <opt.icon className="w-5 h-5" />
            <span className="font-medium">{opt.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Ram Sharma" className="pl-11" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
          </div>
        </div>

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
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
          <Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData(p => ({...p, confirmPassword: e.target.value}))} required />
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" required className="mt-1 rounded border-input" />
          <span className="text-sm text-muted-foreground">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-muted-foreground mt-6">
        Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

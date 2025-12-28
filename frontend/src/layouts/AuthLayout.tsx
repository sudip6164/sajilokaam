import { Outlet, Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">Sajilo Kaam</h1>
              <p className="text-primary-foreground/80 text-sm">Easy Work for Nepal</p>
            </div>
          </Link>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
                Connect with <br />
                <span className="text-accent">Nepal's Best</span> <br />
                ICT Talent
              </h2>
            </div>
            
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Join thousands of freelancers and clients building the future of Nepal's digital economy.
            </p>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">5,000+</p>
                <p className="text-primary-foreground/70 text-sm">Freelancers</p>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">2,500+</p>
                <p className="text-primary-foreground/70 text-sm">Clients</p>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-foreground">₹15M+</p>
                <p className="text-primary-foreground/70 text-sm">Paid Out</p>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-8 left-12 right-12">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary-foreground/20 backdrop-blur-sm border-2 border-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-primary-foreground/80 text-sm">
                +500 freelancers joined this month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Sajilo<span className="text-primary">Kaam</span>
              </span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

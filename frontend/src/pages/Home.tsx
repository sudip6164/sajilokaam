import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Briefcase, 
  Users, 
  Shield, 
  Star, 
  CheckCircle,
  Zap,
  Clock,
  TrendingUp,
  Award,
  MessageSquare,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Briefcase,
    title: "Find Quality Jobs",
    description: "Access hundreds of ICT projects from verified clients across Nepal.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Milestone-based payments with escrow protection for every project.",
    color: "bg-secondary/10 text-secondary"
  },
  {
    icon: Users,
    title: "Top Talent Pool",
    description: "Connect with Nepal's best developers, designers, and tech experts.",
    color: "bg-accent/20 text-accent-foreground"
  },
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description: "Smart algorithms match you with the perfect projects or freelancers.",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Built-in tools to track work hours and manage project timelines.",
    color: "bg-secondary/10 text-secondary"
  },
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description: "Seamless communication with integrated messaging and file sharing.",
    color: "bg-accent/20 text-accent-foreground"
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and build your professional profile showcasing your skills and portfolio.",
    icon: Users
  },
  {
    step: "02",
    title: "Find or Post Jobs",
    description: "Browse available projects or post your requirements to attract top talent.",
    icon: Briefcase
  },
  {
    step: "03",
    title: "Collaborate & Deliver",
    description: "Work together with integrated project management and communication tools.",
    icon: MessageSquare
  },
  {
    step: "04",
    title: "Get Paid Securely",
    description: "Receive payments safely through our secure escrow payment system.",
    icon: DollarSign
  }
];

const testimonials = [
  {
    name: "Sita Gurung",
    role: "Full-Stack Developer",
    image: "S",
    content: "Sajilo Kaam transformed my freelance career. I've completed over 50 projects and built lasting relationships with amazing clients.",
    rating: 5
  },
  {
    name: "Rajesh Thapa",
    role: "CEO, TechNepal Solutions",
    image: "R",
    content: "Finding skilled developers in Nepal was always a challenge. This platform made it incredibly easy to hire and manage remote talent.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "UI/UX Designer",
    image: "P",
    content: "The project management tools and secure payment system give me peace of mind. I can focus on what I do best - designing!",
    rating: 5
  }
];

const stats = [
  { value: "5,000+", label: "Freelancers" },
  { value: "2,500+", label: "Clients" },
  { value: "10,000+", label: "Projects Completed" },
  { value: "NPR 50M+", label: "Paid to Freelancers" }
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nepal's #1 Freelance Platform for ICT
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Empowering Nepal's 
              <span className="block mt-2">
                <span className="text-primary">Digital</span>{" "}
                <span className="text-secondary">Workforce</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Connect with top freelance talent or find your next opportunity. 
              Sajilo Kaam makes freelancing simple, secure, and successful for everyone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button size="xl" variant="hero" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/about">
                  Learn More
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground">
              Powerful tools and features designed specifically for Nepal's freelance ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} hover className="border-0 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-muted-foreground">
              Join thousands of freelancers and clients already using Sajilo Kaam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative text-center group">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="relative mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 mb-6">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
              Loved by Thousands
            </h2>
            <p className="text-muted-foreground">
              See what our community has to say about Sajilo Kaam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.image}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Join Nepal's fastest-growing freelance platform today. 
                Create your free account and start earning!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="gold" asChild>
                  <Link to="/register">
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

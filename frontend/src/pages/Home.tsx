import { useState, useEffect } from "react";
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
  DollarSign,
  Search,
  Building2,
  UserCheck,
  Lock,
  FolderKanban,
  FileText,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jobsApi, projectsApi, bidsApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(true);
  
  const isFreelancer = hasRole("FREELANCER");
  const isClient = hasRole("CLIENT");

  useEffect(() => {
    loadFeaturedJobs();
    if (isAuthenticated) {
      loadPersonalizedData();
    }
  }, [isAuthenticated, isFreelancer, isClient]);

  const loadFeaturedJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const jobs = await jobsApi.list({ status: "OPEN" });
      // Get first 6 jobs
      setFeaturedJobs(jobs.slice(0, 6));
    } catch (error) {
      // Silently fail - homepage should work even if jobs fail to load
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadPersonalizedData = async () => {
    try {
      setIsLoadingPersonal(true);
      if (isFreelancer) {
        const [projects, bids] = await Promise.all([
          projectsApi.list({ freelancerId: user?.id, status: "IN_PROGRESS" }).catch(() => []),
          bidsApi.list({ freelancerId: user?.id, status: "PENDING" }).catch(() => []),
        ]);
        setMyProjects(projects.slice(0, 3));
        setMyBids(bids.slice(0, 3));
      } else if (isClient) {
        const [jobs, projects] = await Promise.all([
          jobsApi.list({ clientId: user?.id, status: "OPEN" }).catch(() => []),
          projectsApi.list({ clientId: user?.id, status: "IN_PROGRESS" }).catch(() => []),
        ]);
        setMyJobs(jobs.slice(0, 3));
        setMyProjects(projects.slice(0, 3));
      }
    } catch (error) {
      // Silently fail
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const formatCurrency = (min?: number, max?: number) => {
    if (min && max) {
      return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `NPR ${min.toLocaleString()}+`;
    if (max) return `Up to NPR ${max.toLocaleString()}`;
    return "Negotiable";
  };

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
              Nepal's #1 Freelancing Marketplace
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
              Hire Talent or 
              <span className="block mt-2">
                <span className="text-primary">Find Work</span>{" "}
                <span className="text-secondary">in Nepal</span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Connect with skilled Nepali freelancers or discover your next opportunity. 
              Post projects, browse jobs, and get work done securely.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, skills, or keywords..."
                  className="pl-12 pr-4 h-14 text-base"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        window.location.href = `/jobs?search=${encodeURIComponent(query)}`;
                      } else {
                        window.location.href = "/jobs";
                      }
                    }
                  }}
                />
                <Button 
                  size="lg" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const query = input?.value || "";
                    if (query.trim()) {
                      window.location.href = `/jobs?search=${encodeURIComponent(query)}`;
                    } else {
                      window.location.href = "/jobs";
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Dual CTAs - Different for logged in users */}
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <Button size="xl" variant="hero" asChild className="gap-2">
                  <Link to="/register?role=client">
                    <Building2 className="w-5 h-5" />
                    Post a Job
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild className="gap-2">
                  <Link to="/register?role=freelancer">
                    <Briefcase className="w-5 h-5" />
                    Find Work
                  </Link>
                </Button>
                <Button size="xl" variant="ghost" asChild>
                  <Link to="/jobs">
                    Browse Jobs
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                {isFreelancer && (
                  <>
                    <Button size="xl" variant="hero" asChild className="gap-2">
                      <Link to="/jobs">
                        <Briefcase className="w-5 h-5" />
                        Browse Jobs
                      </Link>
                    </Button>
                    <Button size="xl" variant="outline" asChild className="gap-2">
                      <Link to="/projects">
                        <FolderKanban className="w-5 h-5" />
                        My Projects
                      </Link>
                    </Button>
                  </>
                )}
                {isClient && (
                  <>
                    <Button size="xl" variant="hero" asChild className="gap-2">
                      <Link to="/post-job">
                        <Building2 className="w-5 h-5" />
                        Post a Job
                      </Link>
                    </Button>
                    <Button size="xl" variant="outline" asChild className="gap-2">
                      <Link to="/freelancers">
                        <Users className="w-5 h-5" />
                        Find Freelancers
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center px-4">
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary">
                  <UserCheck className="h-4 w-4" />
                  <span>KYC Verified Users</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Escrow Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Sections for Logged In Users */}
      {isAuthenticated && (
        <>
          {/* Freelancer Dashboard */}
          {isFreelancer && (
            <section className="py-12 bg-muted/30">
              <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Projects */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FolderKanban className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Active Projects</h3>
                            <p className="text-sm text-muted-foreground">Projects you're working on</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/projects">View All</Link>
                        </Button>
                      </div>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myProjects.length > 0 ? (
                        <div className="space-y-3">
                          {myProjects.map((project) => (
                            <Link key={project.id} to={`/projects/${project.id}`}>
                              <div className="p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium line-clamp-1">{project.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">Budget: NPR {project.budget?.toLocaleString()}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No active projects yet</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link to="/jobs">Browse Jobs</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* My Bids */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary/10">
                            <FileText className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">My Bids</h3>
                            <p className="text-sm text-muted-foreground">Your pending proposals</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/bids">View All</Link>
                        </Button>
                      </div>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myBids.length > 0 ? (
                        <div className="space-y-3">
                          {myBids.map((bid) => (
                            <div key={bid.id} className="p-3 rounded-lg border">
                              <p className="font-medium line-clamp-1">Bid: NPR {bid.amount?.toLocaleString()}</p>
                              <Badge variant="outline" className="mt-2">{bid.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No pending bids</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link to="/jobs">Browse Jobs</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {/* Client Dashboard */}
          {isClient && (
            <section className="py-12 bg-muted/30">
              <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Jobs */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">My Jobs</h3>
                            <p className="text-sm text-muted-foreground">Jobs you've posted</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/my-jobs">View All</Link>
                        </Button>
                      </div>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myJobs.length > 0 ? (
                        <div className="space-y-3">
                          {myJobs.map((job) => (
                            <Link key={job.id} to={`/my-jobs/${job.id}`}>
                              <div className="p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium line-clamp-1">{job.title}</p>
                                <Badge variant="secondary" className="mt-2">{job.status}</Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No jobs posted yet</p>
                          <Button variant="outline" size="sm" className="mt-4" asChild>
                            <Link to="/post-job">Post a Job</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Projects */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary/10">
                            <FolderKanban className="h-5 w-5 text-secondary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Active Projects</h3>
                            <p className="text-sm text-muted-foreground">Projects in progress</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/my-projects">View All</Link>
                        </Button>
                      </div>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myProjects.length > 0 ? (
                        <div className="space-y-3">
                          {myProjects.map((project) => (
                            <Link key={project.id} to={`/my-projects/${project.id}`}>
                              <div className="p-3 rounded-lg border hover:bg-muted transition-colors">
                                <p className="font-medium line-clamp-1">{project.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">Budget: NPR {project.budget?.toLocaleString()}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No active projects yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Featured Jobs Preview */}
      {featuredJobs.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Latest Job Opportunities
                </h2>
                <p className="text-muted-foreground">
                  Browse recent projects posted by clients
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/jobs">
                  View All Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card hover className="h-full transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-lg line-clamp-2 flex-1">{job.title}</h3>
                        <Badge variant="secondary" className="ml-2 shrink-0">{job.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {job.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {(job.budgetMin || job.budgetMax) && (
                          <div className="flex items-center gap-1 text-secondary font-medium">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(job.budgetMin, job.budgetMax)}</span>
                          </div>
                        )}
                        {job.expiresAt && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Due: {new Date(job.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="ghost" size="sm" className="w-full">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

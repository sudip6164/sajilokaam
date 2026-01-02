import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Briefcase, 
  Users, 
  Shield, 
  Star, 
  CheckCircle2,
  Zap,
  Clock,
  Calendar,
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
  Sparkles,
  ArrowDown,
  Play,
  BarChart3,
  Globe,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { jobsApi, projectsApi, bidsApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { value: "5,000+", label: "Active Freelancers", icon: Users, color: "text-primary" },
  { value: "2,500+", label: "Verified Clients", icon: Building2, color: "text-secondary" },
  { value: "10,000+", label: "Projects Completed", icon: CheckCircle2, color: "text-green-600" },
  { value: "NPR 50M+", label: "Total Paid", icon: DollarSign, color: "text-accent" }
];

const features = [
  {
    icon: Briefcase,
    title: "Find Quality Jobs",
    description: "Access hundreds of verified ICT projects from clients across Nepal. Filter by skills, budget, and timeline.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Milestone-based payments with escrow protection. Get paid safely and on time for every project.",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  {
    icon: Users,
    title: "Top Talent Pool",
    description: "Connect with Nepal's best developers, designers, and tech experts. Verified profiles and portfolios.",
    color: "bg-accent/10 text-accent-foreground border-accent/20"
  },
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description: "Smart algorithms match you with perfect projects or freelancers based on skills and experience.",
    color: "bg-primary/10 text-primary border-primary/20"
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Built-in tools to track work hours, manage timelines, and deliver projects on schedule.",
    color: "bg-secondary/10 text-secondary border-secondary/20"
  },
  {
    icon: MessageSquare,
    title: "Real-time Collaboration",
    description: "Seamless communication with integrated messaging, file sharing, and project updates.",
    color: "bg-accent/10 text-accent-foreground border-accent/20"
  }
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Sign up and build your professional profile showcasing your skills, portfolio, and experience.",
    icon: Users,
    color: "from-primary to-primary/80"
  },
  {
    step: "02",
    title: "Find or Post Jobs",
    description: "Browse available projects or post your requirements to attract top talent from Nepal.",
    icon: Briefcase,
    color: "from-secondary to-secondary/80"
  },
  {
    step: "03",
    title: "Collaborate & Deliver",
    description: "Work together with integrated project management, communication tools, and task tracking.",
    icon: MessageSquare,
    color: "from-accent to-accent/80"
  },
  {
    step: "04",
    title: "Get Paid Securely",
    description: "Receive payments safely through our secure escrow system with milestone-based releases.",
    icon: DollarSign,
    color: "from-primary to-secondary"
  }
];

const testimonials = [
  {
    name: "Sita Gurung",
    role: "Full-Stack Developer",
    company: "Freelancer",
    image: "S",
    content: "Sajilo Kaam transformed my freelance career. I've completed over 50 projects and built lasting relationships with amazing clients. The platform is intuitive and payment is always secure.",
    rating: 5,
    location: "Kathmandu, Nepal"
  },
  {
    name: "Rajesh Thapa",
    role: "CEO",
    company: "TechNepal Solutions",
    image: "R",
    content: "Finding skilled developers in Nepal was always a challenge. This platform made it incredibly easy to hire and manage remote talent. Highly recommended for any business.",
    rating: 5,
    location: "Pokhara, Nepal"
  },
  {
    name: "Priya Sharma",
    role: "UI/UX Designer",
    company: "Freelancer",
    image: "P",
    content: "The project management tools and secure payment system give me peace of mind. I can focus on what I do best - designing beautiful interfaces!",
    rating: 5,
    location: "Lalitpur, Nepal"
  }
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
      setFeaturedJobs(jobs.slice(0, 6));
    } catch (error) {
      // Silently fail
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
      <section className="relative min-h-[85vh] flex items-center justify-center py-16 lg:py-24 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nepal's #1 Freelancing Marketplace
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Hire Talent or{" "}
              <span className="block mt-3">
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Find Work
                </span>{" "}
                <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                  in Nepal
                </span>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Connect with skilled Nepali freelancers or discover your next opportunity. 
              Post projects, browse jobs, and get work done securely with escrow protection.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative bg-background rounded-2xl border-2 border-primary/20 shadow-xl p-2 flex items-center gap-2">
                <Search className="absolute left-6 h-6 w-6 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search jobs by title, skills, or keywords..."
                  className="pl-14 pr-4 h-16 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.target as HTMLInputElement).value;
                      navigate(query.trim() ? `/jobs?search=${encodeURIComponent(query)}` : "/jobs");
                    }
                  }}
                />
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                    const query = input?.value || "";
                    navigate(query.trim() ? `/jobs?search=${encodeURIComponent(query)}` : "/jobs");
                  }}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* CTAs */}
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg" asChild>
                  <Link to="/register?role=client">
                    <Building2 className="w-5 h-5 mr-2" />
                    Post a Job
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2" asChild>
                  <Link to="/register?role=freelancer">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Find Work
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-14 px-8 text-base" asChild>
                  <Link to="/jobs">
                    Browse Jobs
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {isFreelancer && (
                  <>
                    <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg" asChild>
                      <Link to="/jobs">
                        <Briefcase className="w-5 h-5 mr-2" />
                        Browse Jobs
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2" asChild>
                      <Link to="/projects">
                        <FolderKanban className="w-5 h-5 mr-2" />
                        My Projects
                      </Link>
                    </Button>
                  </>
                )}
                {isClient && (
                  <>
                    <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg" asChild>
                      <Link to="/post-job">
                        <Building2 className="w-5 h-5 mr-2" />
                        Post a Job
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2" asChild>
                      <Link to="/freelancers">
                        <Users className="w-5 h-5 mr-2" />
                        Find Freelancers
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-border/50">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                <UserCheck className="h-4 w-4" />
                <span className="text-sm font-medium">KYC Verified</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Escrow Protection</span>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-12 flex justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
                <span className="text-sm font-medium">Scroll to explore</span>
                <ArrowDown className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Dashboard for Logged In Users */}
      {isAuthenticated && (
        <section className="py-16 bg-background border-y border-border">
          <div className="container mx-auto px-4">
            {isFreelancer && (
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h2>
                    <p className="text-muted-foreground">Quick overview of your active work</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/freelancer">View Full Dashboard</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Active Projects */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <FolderKanban className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Active Projects</CardTitle>
                            <p className="text-sm text-muted-foreground">Projects you're working on</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/projects">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myProjects.length > 0 ? (
                        <div className="space-y-3">
                          {myProjects.map((project) => (
                            <Link key={project.id} to={`/projects/${project.id}`}>
                              <div className="p-4 rounded-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                                <p className="font-semibold mb-1 line-clamp-1">{project.title}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Budget: NPR {project.budget?.toLocaleString() || "N/A"}
                                  </span>
                                  <Badge variant="outline">{project.status}</Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-4">No active projects yet</p>
                          <Button variant="outline" asChild>
                            <Link to="/jobs">Browse Jobs</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* My Bids */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-secondary/10">
                            <FileText className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">My Bids</CardTitle>
                            <p className="text-sm text-muted-foreground">Your pending proposals</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/bids">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myBids.length > 0 ? (
                        <div className="space-y-3">
                          {myBids.map((bid) => (
                            <div key={bid.id} className="p-4 rounded-lg border-2">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold">Bid: NPR {bid.amount?.toLocaleString()}</p>
                                <Badge 
                                  variant={bid.status === "PENDING" ? "secondary" : bid.status === "ACCEPTED" ? "default" : "outline"}
                                >
                                  {bid.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {bid.proposal || bid.message || "No proposal text"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-4">No pending bids</p>
                          <Button variant="outline" asChild>
                            <Link to="/jobs">Browse Jobs</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {isClient && (
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h2>
                    <p className="text-muted-foreground">Manage your jobs and projects</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/client">View Full Dashboard</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* My Jobs */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">My Jobs</CardTitle>
                            <p className="text-sm text-muted-foreground">Jobs you've posted</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/my-jobs">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myJobs.length > 0 ? (
                        <div className="space-y-3">
                          {myJobs.map((job) => (
                            <Link key={job.id} to={`/my-jobs/${job.id}`}>
                              <div className="p-4 rounded-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold line-clamp-1">{job.title}</p>
                                  <Badge variant="secondary">{job.status}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {job.description || "No description"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                          <Button variant="outline" asChild>
                            <Link to="/post-job">Post a Job</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Projects */}
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-secondary/10">
                            <FolderKanban className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Active Projects</CardTitle>
                            <p className="text-sm text-muted-foreground">Projects in progress</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/my-projects">View All</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoadingPersonal ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                      ) : myProjects.length > 0 ? (
                        <div className="space-y-3">
                          {myProjects.map((project) => (
                            <Link key={project.id} to={`/my-projects/${project.id}`}>
                              <div className="p-4 rounded-lg border-2 hover:border-secondary/50 hover:bg-secondary/5 transition-all cursor-pointer">
                                <p className="font-semibold mb-1 line-clamp-1">{project.title}</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Budget: NPR {project.budget?.toLocaleString() || "N/A"}
                                  </span>
                                  <Badge variant="outline">{project.status}</Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <FolderKanban className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No active projects yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                <div>
                  <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1.5" />
                    Featured Opportunities
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                    Latest Job Opportunities
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Browse recent projects posted by verified clients. Find your next opportunity today.
                  </p>
                </div>
                <Button size="lg" variant="outline" className="border-2" asChild>
                  <Link to="/jobs">
                    View All Jobs
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredJobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`}>
                    <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-xl line-clamp-2 flex-1 group-hover:text-primary transition-colors leading-tight">
                            {job.title}
                          </h3>
                          <Badge variant="secondary" className="ml-3 shrink-0">{job.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-5 leading-relaxed min-h-[60px]">
                          {job.description || "No description provided"}
                        </p>
                        <div className="space-y-3 mb-5">
                          {(job.budgetMin || job.budgetMax) && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                              <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                              <span className="font-bold text-secondary text-sm">
                                {formatCurrency(job.budgetMin, job.budgetMax)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {job.expiresAt && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Due {new Date(job.expiresAt).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <Button variant="ghost" size="sm" className="w-full group/btn" asChild>
                            <Link to={`/jobs/${job.id}`}>
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Award className="h-3 w-3 mr-1.5" />
                Platform Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground">
                Powerful tools and features designed specifically for Nepal's freelance ecosystem. 
                Built for freelancers and clients who demand excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 border-2 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
                <Target className="h-3 w-3 mr-1.5" />
                Getting Started
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Simple steps to start your freelance journey or find the perfect talent. 
                Join thousands already using Sajilo Kaam.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative text-center group">
                    {index < howItWorks.length - 1 && (
                      <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-transparent" />
                    )}
                    <div className={`relative mx-auto w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 mb-6 group-hover:scale-110`}>
                      <Icon className="w-9 h-9 text-white" />
                      <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
                <Star className="h-3 w-3 mr-1.5 fill-accent text-accent" />
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Loved by Thousands
              </h2>
              <p className="text-lg text-muted-foreground">
                See what our community has to say about Sajilo Kaam. 
                Real stories from real freelancers and clients.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-foreground mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {testimonial.image}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        {testimonial.company && (
                          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center bg-background/5 backdrop-blur-sm border-2 border-white/20">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join Nepal's fastest-growing freelance platform today. 
                  Create your free account and start earning or hiring!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" variant="secondary" className="h-14 px-8 text-base shadow-xl" asChild>
                    <Link to="/register">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base border-2 border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

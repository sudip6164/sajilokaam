import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { jobsApi, projectsApi } from "@/lib/api";
import { toast } from "sonner";

const stats = [
  {
    label: "Active Jobs",
    value: "8",
    change: "+2 this month",
    icon: Briefcase,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Hired Freelancers",
    value: "12",
    change: "+3 this month",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    label: "Total Spent",
    value: "NPR 245K",
    change: "+18% vs last month",
    icon: DollarSign,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    label: "Avg. Completion",
    value: "4.2 days",
    change: "-0.8 days improvement",
    icon: Clock,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

const activeJobs = [
  {
    id: 1,
    title: "E-commerce Website Development",
    bids: 12,
    budget: "NPR 80,000",
    deadline: "Dec 25, 2024",
    status: "Hiring",
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    bids: 8,
    budget: "NPR 45,000",
    deadline: "Dec 20, 2024",
    status: "In Progress",
  },
  {
    id: 3,
    title: "SEO Optimization",
    bids: 15,
    budget: "NPR 25,000",
    deadline: "Dec 18, 2024",
    status: "Hiring",
  },
];

const activeProjects = [
  {
    id: 1,
    title: "Company Portfolio Website",
    freelancer: { name: "Sita Sharma", avatar: "https://i.pravatar.cc/150?img=5" },
    progress: 75,
    dueDate: "Dec 22, 2024",
  },
  {
    id: 2,
    title: "Logo Design Package",
    freelancer: { name: "Hari Thapa", avatar: "https://i.pravatar.cc/150?img=12" },
    progress: 90,
    dueDate: "Dec 19, 2024",
  },
  {
    id: 3,
    title: "Content Writing - Blog Posts",
    freelancer: { name: "Maya KC", avatar: "https://i.pravatar.cc/150?img=9" },
    progress: 45,
    dueDate: "Dec 28, 2024",
  },
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeJobs: 0,
    hiredFreelancers: 0,
    totalSpent: 0,
    avgCompletion: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [jobsData, projectsData] = await Promise.all([
        jobsApi.list({ clientId: user.id }),
        projectsApi.list({ clientId: user.id }),
      ]);

      setJobs(jobsData.filter((j: any) => j.status === "OPEN" || j.status === "ACTIVE").slice(0, 3));
      setProjects(projectsData.filter((p: any) => p.status !== "COMPLETED").slice(0, 3));

      // Calculate stats
      const activeJobsCount = jobsData.filter((j: any) => j.status === "OPEN" || j.status === "ACTIVE").length;
      const uniqueFreelancers = new Set(projectsData.map((p: any) => p.freelancerId)).size;
      const totalSpent = projectsData
        .filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      setStats({
        activeJobs: activeJobsCount,
        hiredFreelancers: uniqueFreelancers,
        totalSpent,
        avgCompletion: 4.2, // Placeholder
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const displayStats = [
    {
      label: "Active Jobs",
      value: stats.activeJobs.toString(),
      change: "+2 this month",
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Hired Freelancers",
      value: stats.hiredFreelancers.toString(),
      change: "+3 this month",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Total Spent",
      value: `NPR ${(stats.totalSpent / 1000).toFixed(0)}K`,
      change: "+18% vs last month",
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Avg. Completion",
      value: `${stats.avgCompletion} days`,
      change: "-0.8 days improvement",
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            Welcome back, {user?.fullName || "Client"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/client/post-job">
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-secondary" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Jobs */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Active Jobs
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/client/jobs" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active jobs. <Link to="/client/post-job" className="text-primary hover:underline">Post one now</Link>
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/client/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors block"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {job.budget && <span>NPR {job.budget.toLocaleString()}</span>}
                      {job.deadline && (
                        <>
                          <span>•</span>
                          <span>Due: {new Date(job.deadline).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{job.status}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-secondary" />
            Projects in Progress
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/client/projects" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active projects
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/client/projects/${project.id}`}
                  className="block"
                >
                  <Card className="bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 line-clamp-1">{project.title || "Untitled Project"}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>F</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">
                          Freelancer ID: {project.freelancerId}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="secondary">{project.status}</Badge>
                        </div>
                      </div>
                      {project.deadline && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;

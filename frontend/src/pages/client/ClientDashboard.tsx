import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  FolderKanban,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { jobsApi, projectsApi } from "@/lib/api";
import { toast } from "sonner";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    hiredFreelancers: 0,
    totalSpent: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [jobsData, projectsData] = await Promise.all([
        jobsApi.list({ clientId: user.id }).catch(() => []),
        projectsApi.list({ clientId: user.id }).catch(() => []),
      ]);

      const activeJobsCount = jobsData.filter((j: any) => j.status === "OPEN" || j.status === "ACTIVE").length;
      const activeProjectsCount = projectsData.filter((p: any) => p.status !== "COMPLETED").length;
      const uniqueFreelancers = new Set(projectsData.map((p: any) => p.freelancerId)).size;
      const totalSpent = projectsData
        .filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      setStats({
        activeJobs: activeJobsCount,
        hiredFreelancers: uniqueFreelancers,
        totalSpent,
        activeProjects: activeProjectsCount,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { name: "Post a Job", href: "/post-job", icon: Plus, description: "Create new job posting" },
    { name: "My Jobs", href: "/my-jobs", icon: FileText, description: "Manage your job postings" },
    { name: "My Projects", href: "/my-projects", icon: FolderKanban, description: "Track active work" },
    { name: "Find Freelancers", href: "/freelancers", icon: User, description: "Discover talent" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Quick stats and links to manage your projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold mt-1">{stats.activeJobs}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hired Freelancers</p>
                <p className="text-2xl font-bold mt-1">{stats.hiredFreelancers}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">
                  NPR {stats.totalSpent > 0 ? (stats.totalSpent / 1000).toFixed(0) + "K" : "0"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <DollarSign className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold mt-1">{stats.activeProjects}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <FolderKanban className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.name} to={link.href}>
                  <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{link.name}</h3>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;

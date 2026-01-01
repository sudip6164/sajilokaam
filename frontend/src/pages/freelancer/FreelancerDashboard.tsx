import { useState, useEffect } from "react";
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  ArrowRight,
  FileText,
  FolderKanban
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectsApi, bidsApi } from "@/lib/api";
import { toast } from "sonner";

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEarnings: 0,
    pendingBids: 0,
    completedProjects: 0,
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
      const [projectsData, bidsData] = await Promise.all([
        projectsApi.list({ freelancerId: user.id }).catch(() => []),
        bidsApi.list({ freelancerId: user.id }).catch(() => []),
      ]);

      const activeProjectsCount = projectsData.filter((p: any) => p.status !== "COMPLETED").length;
      const completedProjectsCount = projectsData.filter((p: any) => p.status === "COMPLETED").length;
      const pendingBidsCount = bidsData.filter((b: any) => b.status === "PENDING").length;
      const totalEarnings = projectsData
        .filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      setStats({
        activeProjects: activeProjectsCount,
        totalEarnings,
        pendingBids: pendingBidsCount,
        completedProjects: completedProjectsCount,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { name: "Browse Jobs", href: "/jobs", icon: Briefcase, description: "Find new opportunities" },
    { name: "My Bids", href: "/bids", icon: FileText, description: "View your proposals" },
    { name: "My Projects", href: "/projects", icon: FolderKanban, description: "Manage active work" },
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
          Quick stats and links to manage your freelance work
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold mt-1">{stats.activeProjects}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">
                  NPR {stats.totalEarnings > 0 ? (stats.totalEarnings / 1000).toFixed(0) + "K" : "0"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10">
                <DollarSign className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Bids</p>
                <p className="text-2xl font-bold mt-1">{stats.pendingBids}</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completedProjects}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <Briefcase className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
}

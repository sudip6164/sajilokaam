import { useState, useEffect } from "react";
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Star, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { projectsApi, bidsApi } from "@/lib/api";
import { toast } from "sonner";

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalEarnings: 0,
    pendingBids: 0,
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
        projectsApi.list({ freelancerId: user.id }),
        bidsApi.list({ freelancerId: user.id }),
      ]);

      setProjects(projectsData.filter((p: any) => p.status !== "COMPLETED").slice(0, 3));
      setBids(bidsData.slice(0, 3));

      const activeProjectsCount = projectsData.filter((p: any) => p.status !== "COMPLETED").length;
      const pendingBidsCount = bidsData.filter((b: any) => b.status === "PENDING").length;
      const totalEarnings = projectsData
        .filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + (p.budget || 0), 0);

      setStats({
        activeProjects: activeProjectsCount,
        totalEarnings,
        pendingBids: pendingBidsCount,
      });
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const displayStats = [
    { 
      label: "Active Projects", 
      value: stats.activeProjects.toString(), 
      icon: Briefcase, 
      change: "Ongoing",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    { 
      label: "Total Earnings", 
      value: `NPR ${(stats.totalEarnings / 1000).toFixed(0)}K`, 
      icon: DollarSign, 
      change: "From completed projects",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    { 
      label: "Pending Bids", 
      value: stats.pendingBids.toString(), 
      icon: Clock, 
      change: "Awaiting response",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    { 
      label: "Active Projects", 
      value: projects.length.toString(), 
      icon: Star, 
      change: "Currently working",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
  ];

  const formatCurrency = (amount?: number) => {
    if (!amount) return "NPR 0";
    return `NPR ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName || "Freelancer"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your freelance work today.
          </p>
        </div>
        <Button asChild>
          <Link to="/freelancer/jobs">
            Find New Jobs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow">
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
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Projects</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/freelancer/projects">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active projects. <Link to="/freelancer/jobs" className="text-primary hover:underline">Find jobs</Link>
              </div>
            ) : (
              projects.map((project) => (
                <Link key={project.id} to={`/freelancer/projects/${project.id}`}>
                  <div className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.title || "Untitled Project"}</p>
                        <p className="text-sm text-muted-foreground">Client ID: {project.clientId}</p>
                      </div>
                      {project.deadline && (
                        <Badge variant="outline">{new Date(project.deadline).toLocaleDateString()}</Badge>
                      )}
                    </div>
                    <Badge variant="secondary">{project.status}</Badge>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent bids */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Bids</span>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/freelancer/bids">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bids.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bids yet. <Link to="/freelancer/jobs" className="text-primary hover:underline">Browse jobs</Link>
              </div>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">Job ID: {bid.jobId}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(Number(bid.amount))}</p>
                  </div>
                  <Badge 
                    variant={
                      bid.status === "ACCEPTED" ? "default" : 
                      bid.status === "REJECTED" ? "destructive" : "secondary"
                    }
                  >
                    {bid.status === "ACCEPTED" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {bid.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

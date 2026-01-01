import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Search,
  Eye,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { projectsApi, tasksApiEnhanced } from "@/lib/api";
import { toast } from "sonner";

const ClientProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await projectsApi.list({ clientId: user.id });
      
      // Load progress for each project
      const projectsWithProgress = await Promise.all(
        data.map(async (project: any) => {
          try {
            const tasks = await tasksApiEnhanced.list(project.id);
            const completedTasks = tasks.filter((t: any) => t.status === "DONE" || t.status === "COMPLETED").length;
            const totalTasks = tasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            return { ...project, progress, totalTasks, completedTasks };
          } catch {
            return { ...project, progress: 0, totalTasks: 0, completedTasks: 0 };
          }
        })
      );
      
      setProjects(projectsWithProgress);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = (status: string) => {
    return projects.filter((project) => {
      const projectStatus = project.status?.toLowerCase() || "";
      let matchesStatus = true;
      
      if (status === "all") {
        matchesStatus = true;
      } else if (status === "in-progress") {
        matchesStatus = projectStatus === "in_progress" || projectStatus === "in-progress" || projectStatus === "active";
      } else if (status === "completed") {
        matchesStatus = projectStatus === "completed" || projectStatus === "done";
      }
      
      const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return `NPR ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "in_progress":
      case "in-progress":
      case "active":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><PlayCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
      case "done":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "on_hold":
      case "on-hold":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="h-3 w-3 mr-1" />On Hold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">My Projects</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track progress and manage your ongoing projects
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search projects by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-2 focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="grid w-full max-w-md grid-cols-3 border-2">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            In Progress ({filterProjects("in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Completed ({filterProjects("completed").length})
          </TabsTrigger>
        </TabsList>

        {["all", "in-progress", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
            {filterProjects(tab).length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-20 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <FolderKanban className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "You don't have any projects yet."
                      : `No ${tab.replace("-", " ")} projects at the moment.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filterProjects(tab).map((project) => {
                  const daysRemaining = getDaysRemaining(project.deadline);
                  const isOverdue = daysRemaining !== null && daysRemaining < 0;
                  
                  return (
                    <Link key={project.id} to={`/my-projects/${project.id}`}>
                      <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xl group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                {project.title || "Untitled Project"}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  Freelancer ID: {project.freelancerId}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>

                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                              {project.description}
                            </p>
                          )}

                          {/* Progress */}
                          {project.totalTasks > 0 && (
                            <div className="space-y-2 mb-4 pb-4 border-b">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Progress</span>
                                <span className="font-bold text-primary">{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {project.completedTasks} of {project.totalTasks} tasks completed
                              </p>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="space-y-2">
                            {project.budget && (
                              <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/10">
                                <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                                <span className="font-bold text-secondary">{formatCurrency(project.budget)}</span>
                              </div>
                            )}
                            {project.deadline && (
                              <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isOverdue ? 'bg-red-500/10' : daysRemaining !== null && daysRemaining <= 7 ? 'bg-yellow-500/10' : 'bg-muted/50'}`}>
                                <Calendar className={`h-4 w-4 flex-shrink-0 ${isOverdue ? 'text-red-600' : daysRemaining !== null && daysRemaining <= 7 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                                <span className={isOverdue ? 'text-red-600 font-semibold' : daysRemaining !== null && daysRemaining <= 7 ? 'text-yellow-600 font-semibold' : 'text-muted-foreground'}>
                                  {isOverdue 
                                    ? `Overdue by ${Math.abs(daysRemaining)} days`
                                    : daysRemaining !== null && daysRemaining <= 7
                                    ? `${daysRemaining} days remaining`
                                    : `Due ${new Date(project.deadline).toLocaleDateString()}`
                                  }
                                </span>
                              </div>
                            )}
                          </div>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4 group/btn border-2" 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ClientProjects;

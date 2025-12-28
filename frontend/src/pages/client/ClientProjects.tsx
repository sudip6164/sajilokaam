import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Search,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { projectsApi } from "@/lib/api";
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
      setProjects(data);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-primary" />
          My Projects
        </h1>
        <p className="text-muted-foreground mt-1">
          Track progress and manage your ongoing projects
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({filterProjects("in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filterProjects("completed").length})
          </TabsTrigger>
        </TabsList>

        {["all", "in-progress", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {filterProjects(tab).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "You don't have any projects yet."
                      : `No ${tab.replace("-", " ")} projects at the moment.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterProjects(tab).map((project) => (
                <Link key={project.id} to={`/client/projects/${project.id}`}>
                  <Card hover className="cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Project Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{project.title || "Untitled Project"}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>F</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  Freelancer ID: {project.freelancerId}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary">{project.status}</Badge>
                          </div>

                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {project.budget && (
                              <span className="text-muted-foreground">
                                Budget: <span className="font-medium text-foreground">{formatCurrency(project.budget)}</span>
                              </span>
                            )}
                            {project.deadline && (
                              <span className="text-muted-foreground">
                                Due: <span className="font-medium text-foreground">{new Date(project.deadline).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <Link to={`/client/projects/${project.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ClientProjects;

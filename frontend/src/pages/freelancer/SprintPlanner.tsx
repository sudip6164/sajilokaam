import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sprintsApi, projectsApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function SprintPlanner() {
  const { id } = useParams<{ id: string }>();
  const projectId = id ? parseInt(id) : 0;
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<any | null>(null);
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [sprintForm, setSprintForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sprintsData, tasksData] = await Promise.all([
        sprintsApi.list(projectId),
        projectsApi.getTasks(projectId),
      ]);
      setSprints(sprintsData);
      setTasks(tasksData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load sprint data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    try {
      setIsCreatingSprint(true);
      await sprintsApi.create(projectId, {
        name: sprintForm.name,
        description: sprintForm.description,
        startDate: sprintForm.startDate || undefined,
        endDate: sprintForm.endDate || undefined,
      });
      await loadData();
      setIsSprintDialogOpen(false);
      setSprintForm({ name: "", description: "", startDate: "", endDate: "" });
      toast.success("Sprint created successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create sprint");
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (!confirm("Are you sure you want to delete this sprint?")) return;
    try {
      await sprintsApi.delete(projectId, sprintId);
      await loadData();
      toast.success("Sprint deleted");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete sprint");
    }
  };

  const getSprintTasks = (sprintId: number) => {
    return tasks.filter((t) => t.sprintId === sprintId);
  };

  const getBacklogTasks = () => {
    return tasks.filter((t) => !t.sprintId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/projects/${projectId}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sprint Planner</h1>
          <p className="text-muted-foreground mt-1">Manage sprints and organize tasks</p>
        </div>
        <Button onClick={() => setIsSprintDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </div>

      {/* Backlog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backlog ({getBacklogTasks().length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getBacklogTasks().length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tasks in backlog</p>
          ) : (
            <div className="space-y-2">
              {getBacklogTasks().map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      className={`h-5 w-5 ${
                        task.status === "DONE"
                          ? "text-secondary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={
                        task.status === "DONE" ? "line-through text-muted-foreground" : ""
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                  <Badge variant="outline">{task.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sprints */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Sprints</h2>
        {sprints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No sprints yet. Create your first sprint to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprints.map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id);
              const completedTasks = sprintTasks.filter((t) => t.status === "DONE").length;
              const progress =
                sprintTasks.length > 0
                  ? Math.round((completedTasks / sprintTasks.length) * 100)
                  : 0;

              return (
                <Card key={sprint.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{sprint.name}</CardTitle>
                        {sprint.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {sprint.description}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDeleteSprint(sprint.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sprint.startDate && sprint.endDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(sprint.startDate), "MMM dd")} -{" "}
                          {format(new Date(sprint.endDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Tasks ({sprintTasks.length})
                      </p>
                      {sprintTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No tasks assigned</p>
                      ) : (
                        <div className="space-y-1">
                          {sprintTasks.slice(0, 3).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50"
                            >
                              <CheckCircle
                                className={`h-4 w-4 ${
                                  task.status === "DONE"
                                    ? "text-secondary"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span
                                className={
                                  task.status === "DONE"
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {sprintTasks.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{sprintTasks.length - 3} more tasks
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Badge
                      variant={
                        sprint.status === "ACTIVE"
                          ? "default"
                          : sprint.status === "COMPLETED"
                          ? "secondary"
                          : "outline"
                      }
                      className="w-full justify-center"
                    >
                      {sprint.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sprintName">Sprint Name</Label>
              <Input
                id="sprintName"
                value={sprintForm.name}
                onChange={(e) =>
                  setSprintForm({ ...sprintForm, name: e.target.value })
                }
                placeholder="Sprint 1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sprintDescription">Description</Label>
              <Textarea
                id="sprintDescription"
                value={sprintForm.description}
                onChange={(e) =>
                  setSprintForm({ ...sprintForm, description: e.target.value })
                }
                placeholder="What will this sprint focus on?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={sprintForm.startDate}
                  onChange={(e) =>
                    setSprintForm({ ...sprintForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={sprintForm.endDate}
                  onChange={(e) =>
                    setSprintForm({ ...sprintForm, endDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSprintDialogOpen(false)}
              disabled={isCreatingSprint}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSprint} disabled={isCreatingSprint || !sprintForm.name}>
              {isCreatingSprint ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sprint"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



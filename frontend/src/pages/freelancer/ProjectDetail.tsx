import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  Upload,
  Sparkles,
  Play,
  Pause,
  Send,
  Paperclip,
  CheckCircle,
  MessageSquare,
  Files,
  Timer,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { projectsApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  milestoneId?: number;
  subtasks?: { id: number; title: string; completed: boolean }[];
}

interface Milestone {
  id: number;
  title: string;
  dueDate?: string;
  status?: string;
  tasks: Task[];
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const projectId = parseInt(id);
      
      // Load project, milestones, and tasks in parallel
      const [projectData, milestonesData, tasksData] = await Promise.all([
        projectsApi.get(projectId),
        projectsApi.getMilestones(projectId),
        projectsApi.getTasks(projectId),
      ]);

      setProject(projectData);

      // Load subtasks for each task
      const tasksWithSubtasks = await Promise.all(
        tasksData.map(async (task) => {
          try {
            const subtasks = await projectsApi.getSubtasks(task.id);
            return {
              ...task,
              subtasks: subtasks.map((st: any) => ({
                id: st.id,
                title: st.title,
                completed: st.completed || false,
              })),
            };
          } catch {
            return { ...task, subtasks: [] };
          }
        })
      );

      setTasks(tasksWithSubtasks);

      // Group tasks by milestone
      const milestonesWithTasks = milestonesData.map((milestone: any) => ({
        id: milestone.id,
        title: milestone.title,
        dueDate: milestone.dueDate,
        status: milestone.status || "pending",
        tasks: tasksWithSubtasks.filter((t) => t.milestoneId === milestone.id),
      }));

      setMilestones(milestonesWithTasks);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = async (taskId: number, currentStatus: string) => {
    if (!id) return;
    try {
      const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
      await projectsApi.updateTaskStatus(parseInt(id), taskId, newStatus);
      
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      
      setMilestones(prev => prev.map(m => ({
        ...m,
        tasks: m.tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      })));
      
      toast.success("Task updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleGenerateTasks = () => {
    setIsGeneratingTasks(true);
    setTimeout(() => {
      setIsGeneratingTasks(false);
      toast({
        title: "Tasks Generated!",
        description: "AI has analyzed your project documents and created task suggestions.",
      });
    }, 2500);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-secondary/10 text-secondary",
    paid: "bg-accent/10 text-accent-foreground",
    TODO: "bg-muted text-muted-foreground",
    IN_PROGRESS: "bg-primary/10 text-primary",
    DONE: "bg-secondary/10 text-secondary",
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return `NPR ${amount.toLocaleString()}`;
  };

  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/freelancer/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/freelancer/projects" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{project.title}</h1>
            <p className="text-muted-foreground mt-1">{project.description || "No description provided"}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Tracker */}
            <Card className="flex items-center gap-3 px-4 py-2">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-mono text-lg font-semibold">{formatTime(timerSeconds)}</span>
              <Button 
                size="icon" 
                variant={isTimerRunning ? "destructive" : "default"}
                onClick={() => {
                  setIsTimerRunning(!isTimerRunning);
                  if (!isTimerRunning) {
                    const interval = setInterval(() => {
                      setTimerSeconds(s => s + 1);
                    }, 1000);
                    // Store interval ID for cleanup
                  }
                }}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Project overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p className="font-medium">Client ID: {project.clientId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <DollarSign className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-medium">{formatCurrency(project.budget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="font-medium">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-medium">{calculateProgress()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="time">Time Log</TabsTrigger>
        </TabsList>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Milestones & Tasks</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <Button 
                size="sm" 
                onClick={handleGenerateTasks}
                disabled={isGeneratingTasks}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingTasks ? "Generating..." : "Generate Tasks with AI"}
              </Button>
            </div>
          </div>

          {milestones.length === 0 && tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No milestones or tasks yet. Start by creating a milestone.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {milestones.length > 0 ? (
                milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          {milestone.dueDate && (
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {milestone.status && (
                          <Badge className={statusColors[milestone.status] || statusColors.pending}>
                            {milestone.status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {milestone.tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks in this milestone</p>
                      ) : (
                        <div className="space-y-3">
                          {milestone.tasks.map((task) => (
                            <div key={task.id} className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Checkbox 
                                  checked={task.status === "DONE"}
                                  onCheckedChange={() => toggleTask(task.id, task.status)}
                                />
                                <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>
                                  {task.title}
                                </span>
                                {task.status && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.status}
                                  </Badge>
                                )}
                              </div>
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="ml-8 space-y-2">
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-3">
                                      <Checkbox checked={subtask.completed} disabled />
                                      <span className={`text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                                        {subtask.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                // Show tasks without milestones
                <Card>
                  <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <Checkbox 
                            checked={task.status === "DONE"}
                            onCheckedChange={() => toggleTask(task.id, task.status)}
                          />
                          <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </span>
                          {task.status && (
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>CL</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Client</CardTitle>
                  <p className="text-xs text-muted-foreground">Chat feature coming soon</p>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Chat functionality will be available soon</p>
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" disabled>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input 
                  placeholder="Chat feature coming soon..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                  disabled
                />
                <Button size="icon" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shared Files</CardTitle>
                <Button size="sm" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>File sharing feature coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Log Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Time Tracking Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Time tracking feature coming soon</p>
                <p className="text-sm mt-2">Current session: {formatTime(timerSeconds)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

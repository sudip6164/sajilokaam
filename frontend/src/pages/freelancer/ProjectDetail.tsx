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
  Loader2,
  ExternalLink,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { projectsApi, conversationsApi, timeTrackingApi, filesApi, tasksApiEnhanced } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [timerPollingEnabled, setTimerPollingEnabled] = useState(true);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskComments, setTaskComments] = useState<any[]>([]);
  const [taskAttachments, setTaskAttachments] = useState<any[]>([]);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    milestoneId: "",
    status: "TODO",
  });

  useEffect(() => {
    if (id) {
      loadProjectData();
      loadTimeLogs();
      loadFiles();
    }
  }, [id]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!id) return;
    // Only poll if we have an active timer or if polling is enabled
    if (!isTimerRunning && !timerPollingEnabled) return;
    
    loadActiveTimer();
    const interval = setInterval(() => {
      // Only continue polling if timer is running or polling is enabled
      if (isTimerRunning || timerPollingEnabled) {
        loadActiveTimer();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [id, isTimerRunning, timerPollingEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, activeTimer]);

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

      // Load conversation for this project
      try {
        const conversations = await conversationsApi.list({ projectId: projectId });
        if (conversations.length > 0) {
          setConversationId(conversations[0].id);
        }
      } catch (error) {
        // Conversation might not exist yet
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load project details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await conversationsApi.getMessages(conversationId);
      setMessages(response.content);
    } catch (error: any) {
      // Silently fail - conversation might not exist
    }
  };

  const sendMessage = async () => {
    if (!conversationId || !chatInput.trim()) return;
    try {
      setIsSendingMessage(true);
      await conversationsApi.sendMessage(conversationId, { content: chatInput });
      setChatInput("");
      await loadMessages();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadActiveTimer = async () => {
    if (!id) return;
    try {
      const timer = await timeTrackingApi.getActiveTimer();
      const currentProjectId = parseInt(id);
      if (timer && timer.projectId === currentProjectId) {
        setActiveTimer(timer);
        const startTime = new Date(timer.startTime).getTime();
        const now = Date.now();
        setTimerSeconds(Math.floor((now - startTime) / 1000));
        setIsTimerRunning(true);
        setTimerPollingEnabled(true); // Re-enable if it was disabled
      } else {
        // No active timer - stop polling
        setActiveTimer(null);
        setIsTimerRunning(false);
        setTimerSeconds(0);
        setTimerPollingEnabled(false); // Stop polling when no timer
      }
    } catch (error: any) {
      // If 404 or any error, stop polling to avoid spam
      setTimerPollingEnabled(false);
      setActiveTimer(null);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  };

  const startTimer = async () => {
    if (!id) return;
    try {
      await timeTrackingApi.startTimer({ projectId: parseInt(id) });
      setTimerPollingEnabled(true); // Re-enable polling when starting timer
      await loadActiveTimer();
      toast.success("Timer started");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start timer");
    }
  };

  const stopTimer = async () => {
    try {
      await timeTrackingApi.stopTimer();
      setIsTimerRunning(false);
      setTimerSeconds(0);
      setTimerPollingEnabled(false); // Stop polling when timer is stopped
      setActiveTimer(null);
      await loadTimeLogs();
      toast.success("Timer stopped");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to stop timer");
      // Still stop polling even on error
      setTimerPollingEnabled(false);
      setIsTimerRunning(false);
      setTimerSeconds(0);
    }
  };

  const loadTimeLogs = async () => {
    if (!id) return;
    try {
      const response = await timeTrackingApi.getTimeLogs(parseInt(id));
      // Handle both paginated response (with content) and direct array response
      const logs = Array.isArray(response) ? response : (response?.content || []);
      setTimeLogs(logs);
    } catch (error: any) {
      // Silently fail, but ensure timeLogs is set to empty array
      setTimeLogs([]);
    }
  };

  const loadFiles = async () => {
    if (!id) return;
    try {
      const files = await filesApi.list(parseInt(id));
      setProjectFiles(files);
    } catch (error: any) {
      // Silently fail
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!id) return;
    try {
      await filesApi.upload(parseInt(id), file);
      await loadFiles();
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload file");
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Project not found</p>
          <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          to="/projects" 
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
                onClick={isTimerRunning ? stopTimer : startTimer}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTaskForm({ title: "", description: "", milestoneId: "", status: "TODO" });
                  setIsTaskDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && id) {
                      try {
                        setIsGeneratingTasks(true);
                        const result = await filesApi.processDocument(parseInt(id), file);
                        toast.success(`Extracted ${result.tasks.length} tasks from document`);
                        await loadProjectData();
                      } catch (error: any) {
                        toast.error(error.response?.data?.message || "Failed to process document");
                      } finally {
                        setIsGeneratingTasks(false);
                      }
                    }
                  }}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </span>
                </Button>
              </label>
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
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    setSelectedTask(task);
                                    try {
                                      const [comments, attachments] = await Promise.all([
                                        tasksApiEnhanced.getComments(task.id),
                                        tasksApiEnhanced.getAttachments(task.id),
                                      ]);
                                      setTaskComments(comments);
                                      setTaskAttachments(attachments);
                                      setIsCommentsDialogOpen(true);
                                    } catch (error: any) {
                                      toast.error("Failed to load task details");
                                    }
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Comments
                                </Button>
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
                  <CardTitle className="text-base">Project Chat</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {conversationId ? "Connected" : "No conversation yet"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender.id === user?.id ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.sender.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-[70%] ${message.sender.id === user?.id ? "text-right" : ""}`}>
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.sender.id === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(message.createdAt), "MMM dd, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1"
                  disabled={!conversationId || isSendingMessage}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!conversationId || !chatInput.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
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
                <label>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <Button size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                </label>
              </div>
            </CardHeader>
            <CardContent>
              {projectFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No files uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {file.uploadedBy.fullName} • {format(new Date(file.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.fileUrl, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Log Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Tracking Log</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                    <Timer className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm font-semibold">{formatTime(timerSeconds)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={isTimerRunning ? stopTimer : startTimer}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time logs yet</p>
                  <p className="text-sm mt-2">Start the timer to track your work hours</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {log.startTime ? format(new Date(log.startTime), "MMM dd, yyyy") : "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {log.startTime && log.endTime 
                              ? `${format(new Date(log.startTime), "h:mm a")} - ${format(new Date(log.endTime), "h:mm a")}`
                              : log.loggedAt 
                              ? format(new Date(log.loggedAt), "MMM dd, yyyy h:mm a")
                              : "N/A"}
                          </p>
                          {log.description && (
                            <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatTime(log.duration || (log.minutes ? log.minutes * 60 : 0))}
                        </p>
                        {log.category && (
                          <Badge variant="outline" className="mt-1">
                            {log.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskMilestone">Milestone (Optional)</Label>
              <select
                id="taskMilestone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={taskForm.milestoneId}
                onChange={(e) => setTaskForm({ ...taskForm, milestoneId: e.target.value })}
              >
                <option value="">No milestone</option>
                {milestones.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!id || !taskForm.title) return;
                try {
                  await tasksApiEnhanced.create(parseInt(id), {
                    title: taskForm.title,
                    description: taskForm.description || undefined,
                    status: taskForm.status,
                    milestoneId: taskForm.milestoneId ? parseInt(taskForm.milestoneId) : undefined,
                  });
                  await loadProjectData();
                  setIsTaskDialogOpen(false);
                  setTaskForm({ title: "", description: "", milestoneId: "", status: "TODO" });
                  toast.success("Task created successfully");
                } catch (error: any) {
                  toast.error(error.response?.data?.message || "Failed to create task");
                }
              }}
              disabled={!taskForm.title}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Comments & Attachments Dialog */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Tabs defaultValue="comments">
              <TabsList>
                <TabsTrigger value="comments">Comments ({taskComments.length})</TabsTrigger>
                <TabsTrigger value="attachments">Attachments ({taskAttachments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4 mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  {taskComments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No comments yet</p>
                  ) : (
                    <div className="space-y-4">
                      {taskComments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                {comment.author.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.createdAt), "MMM dd, h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm ml-8">{comment.content}</p>
                          {comment.attachments && comment.attachments.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {comment.attachments.map((att: any) => (
                                <a
                                  key={att.id}
                                  href={att.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {att.fileName}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="space-y-2 border-t pt-4">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && selectedTask) {
                            try {
                              await tasksApiEnhanced.addAttachment(selectedTask.id, file);
                              const attachments = await tasksApiEnhanced.getAttachments(selectedTask.id);
                              setTaskAttachments(attachments);
                              toast.success("Attachment added");
                            } catch (error: any) {
                              toast.error("Failed to add attachment");
                            }
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Paperclip className="h-4 w-4 mr-2" />
                          Attach File
                        </span>
                      </Button>
                    </label>
                    <Button
                      size="sm"
                      onClick={async () => {
                        if (!selectedTask || !newComment.trim()) return;
                        try {
                          await tasksApiEnhanced.addComment(selectedTask.id, { content: newComment });
                          setNewComment("");
                          const comments = await tasksApiEnhanced.getComments(selectedTask.id);
                          setTaskComments(comments);
                          toast.success("Comment added");
                        } catch (error: any) {
                          toast.error("Failed to add comment");
                        }
                      }}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                <ScrollArea className="h-[300px]">
                  {taskAttachments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No attachments yet</p>
                  ) : (
                    <div className="space-y-2">
                      {taskAttachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{att.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded by {att.uploadedBy.fullName} • {format(new Date(att.createdAt), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(att.fileUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t pt-4 mt-4">
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && selectedTask) {
                          try {
                            await tasksApiEnhanced.addAttachment(selectedTask.id, file);
                            const attachments = await tasksApiEnhanced.getAttachments(selectedTask.id);
                            setTaskAttachments(attachments);
                            toast.success("Attachment added");
                          } catch (error: any) {
                            toast.error("Failed to add attachment");
                          }
                        }
                      }}
                    />
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Attachment
                      </span>
                    </Button>
                  </label>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

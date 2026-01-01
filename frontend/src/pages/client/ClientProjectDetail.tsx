import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  Send,
  Paperclip,
  CheckCircle,
  MessageSquare,
  Files,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { projectsApi, conversationsApi, filesApi, timeTrackingApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function ClientProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

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
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  const loadProjectData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const projectId = parseInt(id);
      
      const [projectData, tasksData] = await Promise.all([
        projectsApi.get(projectId),
        projectsApi.getTasks(projectId),
      ]);

      setProject(projectData);
      setTasks(tasksData);

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
      if (error.response?.status === 403) {
        toast.error("You don't have permission to view this project");
        navigate("/my-projects");
      } else {
        toast.error(error.response?.data?.message || "Failed to load project details");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const response = await conversationsApi.getMessages(conversationId);
      setMessages(response.content || []);
    } catch (error: any) {
      // Silently fail
    }
  };

  const sendMessage = async () => {
    if (!conversationId || !chatInput.trim()) return;
    try {
      setIsSendingMessage(true);
      await conversationsApi.sendMessage(conversationId, {
        content: chatInput,
      });
      setChatInput("");
      loadMessages();
    } catch (error: any) {
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const loadTimeLogs = async () => {
    if (!id) return;
    try {
      const response = await projectsApi.getTimeLogs(parseInt(id));
      setTimeLogs(response || []);
    } catch (error: any) {
      setTimeLogs([]);
    }
  };

  const loadFiles = async () => {
    if (!id) return;
    try {
      const files = await filesApi.list(parseInt(id));
      setProjectFiles(files || []);
    } catch (error: any) {
      setProjectFiles([]);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not specified";
    return `NPR ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Project not found</p>
            <Button asChild className="mt-4">
              <Link to="/my-projects">Back to My Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "DONE" || t.status === "COMPLETED").length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to="/my-projects">
          <ArrowLeft className="h-4 w-4" />
          Back to My Projects
        </Link>
      </Button>

      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-secondary/10 text-secondary">{project.status}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Created on {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">{formatCurrency(project.budget)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="font-semibold">{progress}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <FileText className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tasks</p>
              <p className="font-semibold">{completedTasks}/{totalTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Logged</p>
              <p className="font-semibold">
                {formatTime(timeLogs.reduce((sum, log) => sum + (log.minutes * 60), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({totalTasks})</TabsTrigger>
          <TabsTrigger value="files">Files ({projectFiles.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {project.description || "No description provided"}
              </p>
            </CardContent>
          </Card>

          {project.freelancerId && (
            <Card>
              <CardHeader>
                <CardTitle>Freelancer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Freelancer ID: {project.freelancerId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {timeLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Time Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {timeLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{log.description || "No description"}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                        <p className="font-semibold">{formatTime(log.minutes * 60)}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No tasks yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                      </div>
                      <Badge variant={task.status === "DONE" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4 mt-4">
          {projectFiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No files uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Files className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No messages yet</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.senderId === user?.id ? "justify-end" : ""}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === user?.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.createdAt
                              ? new Date(message.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button onClick={sendMessage} disabled={!chatInput.trim() || isSendingMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


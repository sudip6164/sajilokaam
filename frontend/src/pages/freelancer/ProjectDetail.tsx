import { useState } from "react";
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
  Circle,
  MoreHorizontal,
  Plus,
  MessageSquare,
  Files,
  Timer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

interface Milestone {
  id: number;
  title: string;
  amount: string;
  status: "pending" | "in-progress" | "completed" | "paid";
  dueDate: string;
  tasks: Task[];
}

const projectData = {
  id: 1,
  name: "TechStartup Website",
  client: "ABC Corp",
  clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
  deadline: "Dec 25, 2024",
  startDate: "Nov 15, 2024",
  progress: 75,
  budget: "NPR 95,000",
  description: "Build a modern, responsive website for a tech startup including landing page, about, services, team, and contact pages with blog functionality.",
  status: "in-progress",
};

const initialMilestones: Milestone[] = [
  {
    id: 1,
    title: "Design Phase",
    amount: "NPR 25,000",
    status: "completed",
    dueDate: "Nov 25, 2024",
    tasks: [
      { id: "t1", title: "Wireframes", completed: true },
      { id: "t2", title: "UI Mockups", completed: true },
      { id: "t3", title: "Design Review", completed: true },
    ],
  },
  {
    id: 2,
    title: "Development Phase",
    amount: "NPR 50,000",
    status: "in-progress",
    dueDate: "Dec 15, 2024",
    tasks: [
      { 
        id: "t4", 
        title: "Homepage Development", 
        completed: true,
        subtasks: [
          { id: "st1", title: "Hero section", completed: true },
          { id: "st2", title: "Features section", completed: true },
          { id: "st3", title: "Testimonials", completed: true },
        ]
      },
      { 
        id: "t5", 
        title: "Inner Pages", 
        completed: false,
        subtasks: [
          { id: "st4", title: "About page", completed: true },
          { id: "st5", title: "Services page", completed: false },
          { id: "st6", title: "Contact page", completed: false },
        ]
      },
      { id: "t6", title: "Blog Integration", completed: false },
    ],
  },
  {
    id: 3,
    title: "Testing & Launch",
    amount: "NPR 20,000",
    status: "pending",
    dueDate: "Dec 25, 2024",
    tasks: [
      { id: "t7", title: "Cross-browser testing", completed: false },
      { id: "t8", title: "Performance optimization", completed: false },
      { id: "t9", title: "Deployment", completed: false },
    ],
  },
];

const chatMessages = [
  { id: 1, sender: "client", name: "ABC Corp", message: "Hi! How's the progress on the homepage?", time: "10:30 AM" },
  { id: 2, sender: "freelancer", name: "You", message: "Hello! The homepage is almost done. Just finishing up the testimonials section.", time: "10:35 AM" },
  { id: 3, sender: "client", name: "ABC Corp", message: "Great! Can you share a preview?", time: "10:36 AM" },
  { id: 4, sender: "freelancer", name: "You", message: "Sure, I'll send the staging link shortly.", time: "10:38 AM" },
];

const sharedFiles = [
  { id: 1, name: "homepage-mockup.fig", size: "2.4 MB", uploadedAt: "Nov 20, 2024", type: "design" },
  { id: 2, name: "brand-guidelines.pdf", size: "1.2 MB", uploadedAt: "Nov 18, 2024", type: "document" },
  { id: 3, name: "project-requirements.docx", size: "456 KB", uploadedAt: "Nov 15, 2024", type: "document" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState(initialMilestones);
  const [chatInput, setChatInput] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const toggleTask = (milestoneId: number, taskId: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          tasks: m.tasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      }
      return m;
    }));
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

  const statusColors = {
    pending: "bg-muted text-muted-foreground",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-secondary/10 text-secondary",
    paid: "bg-accent/10 text-accent-foreground",
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{projectData.name}</h1>
            <p className="text-muted-foreground mt-1">{projectData.description}</p>
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
                <p className="font-medium">{projectData.client}</p>
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
                <p className="font-medium">{projectData.budget}</p>
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
                <p className="font-medium">{projectData.deadline}</p>
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
                <p className="font-medium">{projectData.progress}%</p>
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

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-secondary">{milestone.amount}</span>
                        <span>Due: {milestone.dueDate}</span>
                      </div>
                    </div>
                    <Badge className={statusColors[milestone.status]}>
                      {milestone.status.replace("-", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestone.tasks.map((task) => (
                      <div key={task.id} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(milestone.id, task.id)}
                          />
                          <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                            {task.title}
                          </span>
                        </div>
                        {task.subtasks && (
                          <div className="ml-8 space-y-2">
                            {task.subtasks.map((subtask) => (
                              <div key={subtask.id} className="flex items-center gap-3">
                                <Checkbox checked={subtask.completed} />
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={projectData.clientAvatar} />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{projectData.client}</CardTitle>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === "freelancer" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "freelancer" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === "freelancer" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input 
                  placeholder="Type a message..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon">
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
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sharedFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} • Uploaded {file.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
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
              <div className="space-y-3">
                {[
                  { date: "Dec 18, 2024", task: "Services page development", duration: "3h 45m" },
                  { date: "Dec 17, 2024", task: "About page styling", duration: "2h 30m" },
                  { date: "Dec 16, 2024", task: "Homepage testimonials", duration: "4h 15m" },
                  { date: "Dec 15, 2024", task: "Hero section animations", duration: "2h 00m" },
                ].map((log, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{log.task}</p>
                      <p className="text-sm text-muted-foreground">{log.date}</p>
                    </div>
                    <Badge variant="outline">{log.duration}</Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="font-medium">Total Time</span>
                <span className="text-lg font-bold text-primary">12h 30m</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

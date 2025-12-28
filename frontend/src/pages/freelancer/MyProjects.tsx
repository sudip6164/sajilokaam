import { useState } from "react";
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  ArrowRight,
  GripVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

type ProjectStatus = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
}

interface Project {
  id: number;
  name: string;
  client: string;
  clientAvatar: string;
  deadline: string;
  progress: number;
  status: ProjectStatus;
  budget: string;
  tasks: Task[];
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: "TechStartup Website",
    client: "ABC Corp",
    clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
    deadline: "Dec 25, 2024",
    progress: 75,
    status: "in-progress",
    budget: "NPR 95,000",
    tasks: [
      { id: "t1", title: "Homepage design", priority: "high" },
      { id: "t2", title: "About page", priority: "medium" },
    ],
  },
  {
    id: 2,
    name: "Mobile Banking App",
    client: "XYZ Bank",
    clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=XYZ",
    deadline: "Jan 15, 2025",
    progress: 45,
    status: "in-progress",
    budget: "NPR 150,000",
    tasks: [
      { id: "t3", title: "Dashboard UI", priority: "high" },
      { id: "t4", title: "Transaction flow", priority: "high" },
    ],
  },
  {
    id: 3,
    name: "CRM Dashboard",
    client: "Sales Pro",
    clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=SP",
    deadline: "Dec 20, 2024",
    progress: 90,
    status: "in-progress",
    budget: "NPR 60,000",
    tasks: [
      { id: "t5", title: "Final testing", priority: "high" },
    ],
  },
  {
    id: 4,
    name: "E-commerce Platform",
    client: "ShopNepal",
    clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=SN",
    deadline: "Dec 18, 2024",
    progress: 100,
    status: "done",
    budget: "NPR 120,000",
    tasks: [],
  },
  {
    id: 5,
    name: "Portfolio Website",
    client: "Creative Studio",
    clientAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=CS",
    deadline: "Jan 30, 2025",
    progress: 0,
    status: "todo",
    budget: "NPR 25,000",
    tasks: [
      { id: "t6", title: "Initial wireframes", priority: "medium" },
      { id: "t7", title: "Design mockups", priority: "low" },
    ],
  },
];

const columns = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "in-progress", title: "In Progress", color: "bg-primary/10" },
  { id: "done", title: "Done", color: "bg-secondary/10" },
];

const priorityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyProjects() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedProject, setDraggedProject] = useState<number | null>(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectsByStatus = (status: ProjectStatus) => 
    filteredProjects.filter(p => p.status === status);

  const handleDragStart = (projectId: number) => {
    setDraggedProject(projectId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: ProjectStatus) => {
    if (draggedProject !== null) {
      setProjects(prev => prev.map(p => 
        p.id === draggedProject ? { ...p, status } : p
      ));
      setDraggedProject(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track your active projects</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search projects..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-xl ${column.color} p-4 min-h-[500px]`}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id as ProjectStatus)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                {column.title}
                <Badge variant="secondary" className="rounded-full">
                  {getProjectsByStatus(column.id as ProjectStatus).length}
                </Badge>
              </h3>
            </div>

            <div className="space-y-3">
              {getProjectsByStatus(column.id as ProjectStatus).map((project) => (
                <Card
                  key={project.id}
                  className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link 
                        to={`/freelancer/projects/${project.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {project.name}
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/freelancer/projects/${project.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Message Client</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={project.clientAvatar} />
                        <AvatarFallback>{project.client[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{project.client}</span>
                    </div>

                    {project.tasks.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {project.tasks.slice(0, 2).map((task) => (
                          <div key={task.id} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            <span className="flex-1 truncate">{task.title}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                        {project.tasks.length > 2 && (
                          <p className="text-xs text-muted-foreground pl-3">
                            +{project.tasks.length - 2} more tasks
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.deadline}
                      </div>
                      <span className="font-medium text-secondary">{project.budget}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

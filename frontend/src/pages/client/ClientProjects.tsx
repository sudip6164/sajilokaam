import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const projects = [
  {
    id: 1,
    title: "Company Portfolio Website",
    freelancer: {
      name: "Sita Sharma",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    budget: "NPR 35,000",
    progress: 75,
    status: "in-progress",
    dueDate: "Dec 22, 2024",
    milestones: [
      { name: "Design Mockups", status: "completed", amount: "NPR 8,000" },
      { name: "Frontend Development", status: "completed", amount: "NPR 12,000" },
      { name: "Backend Integration", status: "in-progress", amount: "NPR 10,000" },
      { name: "Testing & Launch", status: "pending", amount: "NPR 5,000" },
    ],
  },
  {
    id: 2,
    title: "Logo Design Package",
    freelancer: {
      name: "Hari Thapa",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    budget: "NPR 15,000",
    progress: 90,
    status: "in-progress",
    dueDate: "Dec 19, 2024",
    milestones: [
      { name: "Initial Concepts", status: "completed", amount: "NPR 5,000" },
      { name: "Revisions", status: "completed", amount: "NPR 5,000" },
      { name: "Final Delivery", status: "pending-approval", amount: "NPR 5,000" },
    ],
  },
  {
    id: 3,
    title: "Content Writing - Blog Posts",
    freelancer: {
      name: "Maya KC",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    budget: "NPR 20,000",
    progress: 45,
    status: "in-progress",
    dueDate: "Dec 28, 2024",
    milestones: [
      { name: "Research & Outline", status: "completed", amount: "NPR 5,000" },
      { name: "First 5 Articles", status: "in-progress", amount: "NPR 7,500" },
      { name: "Final 5 Articles", status: "pending", amount: "NPR 7,500" },
    ],
  },
  {
    id: 4,
    title: "Mobile App Design",
    freelancer: {
      name: "Raj Gurung",
      avatar: "https://i.pravatar.cc/150?img=15",
    },
    budget: "NPR 45,000",
    progress: 100,
    status: "completed",
    dueDate: "Nov 30, 2024",
    milestones: [
      { name: "UI/UX Design", status: "completed", amount: "NPR 20,000" },
      { name: "Prototyping", status: "completed", amount: "NPR 15,000" },
      { name: "Design System", status: "completed", amount: "NPR 10,000" },
    ],
  },
];

const ClientProjects = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{
    project: string;
    milestone: string;
    amount: string;
  } | null>(null);
  const [feedback, setFeedback] = useState("");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-primary" />;
      case "pending-approval":
        return <AlertCircle className="h-4 w-4 text-accent" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-secondary/10 text-secondary">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-primary/10 text-primary">In Progress</Badge>;
      case "pending-approval":
        return <Badge className="bg-accent/10 text-accent-foreground">Needs Approval</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleApproveMilestone = (project: string, milestone: string, amount: string) => {
    setSelectedMilestone({ project, milestone, amount });
    setApprovalDialogOpen(true);
  };

  const confirmApproval = () => {
    toast({
      title: "Milestone Approved!",
      description: `Payment of ${selectedMilestone?.amount} has been released.`,
    });
    setApprovalDialogOpen(false);
    setFeedback("");
  };

  const filterProjects = (status: string) => {
    return projects.filter((project) => {
      const matchesStatus = status === "all" || project.status === status;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

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
            In Progress ({projects.filter((p) => p.status === "in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({projects.filter((p) => p.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        {["all", "in-progress", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {filterProjects(tab).map((project) => (
              <Card key={project.id} hover>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Project Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={project.freelancer.avatar} />
                              <AvatarFallback>
                                {project.freelancer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {project.freelancer.name}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(project.status)}
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Overall Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Budget: <span className="font-medium text-foreground">{project.budget}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Due: <span className="font-medium text-foreground">{project.dueDate}</span>
                        </span>
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="lg:w-80 space-y-3">
                      <h4 className="font-medium text-sm">Milestones</h4>
                      <div className="space-y-2">
                        {project.milestones.map((milestone, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(milestone.status)}
                              <div>
                                <p className="text-sm font-medium">{milestone.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {milestone.amount}
                                </p>
                              </div>
                            </div>
                            {milestone.status === "pending-approval" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleApproveMilestone(
                                    project.title,
                                    milestone.name,
                                    milestone.amount
                                  )
                                }
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/client/projects/${project.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filterProjects(tab).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No projects found</h3>
                  <p className="text-muted-foreground">
                    {tab === "all"
                      ? "You don't have any projects yet."
                      : `No ${tab.replace("-", " ")} projects at the moment.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Milestone</DialogTitle>
            <DialogDescription>
              Approve "{selectedMilestone?.milestone}" for {selectedMilestone?.project}?
              This will release {selectedMilestone?.amount} to the freelancer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Feedback (Optional)</label>
              <Textarea
                placeholder="Leave feedback for the freelancer..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApproval}>Approve & Release Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProjects;

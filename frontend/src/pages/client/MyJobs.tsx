import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Clock,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const jobs = [
  {
    id: 1,
    title: "E-commerce Website Development",
    category: "Web Development",
    budget: "NPR 80,000",
    bids: 12,
    deadline: "Dec 25, 2024",
    posted: "Dec 10, 2024",
    status: "active",
    description: "Looking for an experienced developer to build a full-featured e-commerce platform...",
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    category: "UI/UX Design",
    budget: "NPR 45,000",
    bids: 8,
    deadline: "Dec 20, 2024",
    posted: "Dec 8, 2024",
    status: "active",
    description: "Need a creative designer for our fitness tracking mobile application...",
  },
  {
    id: 3,
    title: "SEO Optimization Campaign",
    category: "Digital Marketing",
    budget: "NPR 25,000",
    bids: 15,
    deadline: "Dec 18, 2024",
    posted: "Dec 5, 2024",
    status: "active",
    description: "Comprehensive SEO audit and optimization for our corporate website...",
  },
  {
    id: 4,
    title: "Company Portfolio Website",
    category: "Web Development",
    budget: "NPR 35,000",
    bids: 6,
    deadline: "Dec 22, 2024",
    posted: "Dec 1, 2024",
    status: "in-progress",
    freelancer: "Sita Sharma",
    description: "Modern portfolio website with CMS integration...",
  },
  {
    id: 5,
    title: "Logo Design Package",
    category: "Graphic Design",
    budget: "NPR 15,000",
    bids: 20,
    deadline: "Nov 30, 2024",
    posted: "Nov 15, 2024",
    status: "completed",
    freelancer: "Hari Thapa",
    description: "Complete brand identity package including logo variations...",
  },
  {
    id: 6,
    title: "WordPress Blog Setup",
    category: "Web Development",
    budget: "NPR 10,000",
    bids: 5,
    deadline: "Nov 20, 2024",
    posted: "Nov 10, 2024",
    status: "cancelled",
    description: "Basic WordPress blog with custom theme...",
  },
];

const MyJobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "in-progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "completed":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-3 w-3" />;
      case "in-progress":
        return <Users className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filterJobs = (status: string) => {
    return jobs.filter((job) => {
      const matchesStatus = status === "all" || job.status === status;
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const handleDelete = (id: number) => {
    setSelectedJob(id);
    setDeleteDialogOpen(true);
  };

  const JobCard = ({ job }: { job: typeof jobs[0] }) => (
    <Card hover className="group">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  to={`/client/jobs/${job.id}`}
                  className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-muted-foreground">{job.category}</p>
              </div>
              <Badge className={`${getStatusColor(job.status)} gap-1 capitalize`}>
                {getStatusIcon(job.status)}
                {job.status.replace("-", " ")}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-accent" />
                <span className="font-medium">{job.budget}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                <span>{job.bids} bids</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Due: {job.deadline}</span>
              </span>
            </div>

            {job.freelancer && (
              <p className="text-sm">
                <span className="text-muted-foreground">Assigned to: </span>
                <span className="font-medium text-primary">{job.freelancer}</span>
              </p>
            )}
          </div>

          <div className="flex md:flex-col gap-2">
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link to={`/client/jobs/${job.id}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
            {job.status === "active" && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(job.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" />
            My Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your posted jobs in one place
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/client/post-job">
            <Plus className="h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Newest First</DropdownMenuItem>
            <DropdownMenuItem>Oldest First</DropdownMenuItem>
            <DropdownMenuItem>Most Bids</DropdownMenuItem>
            <DropdownMenuItem>Highest Budget</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({jobs.filter((j) => j.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({jobs.filter((j) => j.status === "in-progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({jobs.filter((j) => j.status === "completed").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({jobs.filter((j) => j.status === "cancelled").length})
          </TabsTrigger>
        </TabsList>

        {["all", "active", "in-progress", "completed", "cancelled"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {filterJobs(tab).length > 0 ? (
              filterJobs(tab).map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {tab === "all"
                      ? "You haven't posted any jobs yet."
                      : `No ${tab.replace("-", " ")} jobs at the moment.`}
                  </p>
                  {tab === "all" && (
                    <Button asChild>
                      <Link to="/client/post-job">Post Your First Job</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All bids on this job will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyJobs;

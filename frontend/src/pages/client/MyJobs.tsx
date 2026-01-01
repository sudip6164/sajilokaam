import { useState, useEffect } from "react";
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
  ArrowRight,
  Calendar,
  TrendingUp,
  Sparkles,
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
import { useAuth } from "@/contexts/AuthContext";
import { jobsApi, bidsApi } from "@/lib/api";
import { toast } from "sonner";

const MyJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const jobsData = await jobsApi.list({ clientId: user.id });
      
      // Fetch bid counts for each job
      const jobsWithBids = await Promise.all(
        jobsData.map(async (job: any) => {
          try {
            const bids = await bidsApi.list({ jobId: job.id });
            return { ...job, bidCount: bids.length };
          } catch {
            return { ...job, bidCount: 0 };
          }
        })
      );
      
      setJobs(jobsWithBids);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    try {
      await jobsApi.delete(selectedJob);
      toast.success("Job deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedJob(null);
      loadJobs();
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "open":
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case "in_progress":
      case "in-progress":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Users className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "completed":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "cancelled":
      case "closed":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getDaysRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filterJobs = (status: string) => {
    return jobs.filter((job) => {
      const jobStatus = job.status?.toLowerCase() || "";
      let matchesStatus = true;
      
      if (status === "all") {
        matchesStatus = true;
      } else if (status === "active") {
        matchesStatus = jobStatus === "open" || jobStatus === "active";
      } else if (status === "in-progress") {
        matchesStatus = jobStatus === "in_progress" || jobStatus === "in-progress";
      } else if (status === "completed") {
        matchesStatus = jobStatus === "completed";
      } else if (status === "cancelled") {
        matchesStatus = jobStatus === "cancelled" || jobStatus === "closed";
      }
      
      const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const JobCard = ({ job }: { job: any }) => {
    const canEdit = job.status === "OPEN" || job.status === "ACTIVE";
    const daysRemaining = getDaysRemaining(job.expiresAt);
    const isOverdue = daysRemaining !== null && daysRemaining < 0;
    
    const formatCurrency = (min?: number, max?: number) => {
      if (min && max) {
        return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
      }
      if (min) return `NPR ${min.toLocaleString()}+`;
      if (max) return `Up to NPR ${max.toLocaleString()}`;
      return "Negotiable";
    };

    return (
      <Link to={`/my-jobs/${job.id}`}>
        <Card className="transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    {job.category?.name && (
                      <p className="text-sm text-muted-foreground mb-3">{job.category.name}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(job.status)}
                      <span className="text-xs text-muted-foreground">• Posted {getTimeAgo(job.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  {(job.budgetMin || job.budgetMax) && (
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/10">
                      <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                      <span className="font-bold text-secondary">
                        {formatCurrency(job.budgetMin, job.budgetMax)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-blue-600">{job.bidCount || 0} bids</span>
                  </div>
                  
                  {job.expiresAt && (
                    <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${isOverdue ? 'bg-red-500/10' : daysRemaining !== null && daysRemaining <= 7 ? 'bg-yellow-500/10' : 'bg-muted/50'}`}>
                      <Clock className={`h-4 w-4 flex-shrink-0 ${isOverdue ? 'text-red-600' : daysRemaining !== null && daysRemaining <= 7 ? 'text-yellow-600' : 'text-muted-foreground'}`} />
                      <span className={isOverdue ? 'text-red-600 font-semibold' : daysRemaining !== null && daysRemaining <= 7 ? 'text-yellow-600 font-semibold' : 'text-muted-foreground'}>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysRemaining)} days`
                          : daysRemaining !== null && daysRemaining <= 7
                          ? `${daysRemaining} days remaining`
                          : `Due ${new Date(job.expiresAt).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                <Button variant="outline" size="sm" asChild className="group/btn border-2 flex-1 lg:flex-none" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/my-jobs/${job.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                    <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 flex-1 lg:flex-none border-2"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to={`/my-jobs/${job.id}?edit=true`}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-2 border-destructive/20 flex-1 lg:flex-none"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedJob(job.id);
                        setDeleteDialogOpen(true);
                      }}
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
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">My Jobs</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage all your posted jobs in one place
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <Link to="/post-job">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-primary"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-2 h-12">
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
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="border-2">
          <CardContent className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading jobs...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 border-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Active ({filterJobs("active").length})
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              In Progress ({filterJobs("in-progress").length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Completed ({filterJobs("completed").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Cancelled ({filterJobs("cancelled").length})
            </TabsTrigger>
          </TabsList>

          {["all", "active", "in-progress", "completed", "cancelled"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-6">
              {filterJobs(tab).length > 0 ? (
                <div className="space-y-4">
                  {filterJobs(tab).map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              ) : (
                <Card className="border-2">
                  <CardContent className="py-20 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                      <Briefcase className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-6">
                      {tab === "all"
                        ? "You haven't posted any jobs yet."
                        : `No ${tab.replace("-", " ")} jobs at the moment.`}
                    </p>
                    {tab === "all" && (
                      <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary">
                        <Link to="/post-job">
                          <Plus className="h-4 w-4 mr-2" />
                          Post Your First Job
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyJobs;

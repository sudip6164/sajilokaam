import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRight,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { bidsApi, jobsApi } from "@/lib/api";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  PENDING: { 
    label: "Pending", 
    icon: Clock, 
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10 border-yellow-500/20"
  },
  ACCEPTED: { 
    label: "Accepted", 
    icon: CheckCircle2, 
    color: "text-green-600",
    bgColor: "bg-green-500/10 border-green-500/20"
  },
  REJECTED: { 
    label: "Rejected", 
    icon: XCircle, 
    color: "text-red-600",
    bgColor: "bg-red-500/10 border-red-500/20"
  },
};

const getRelativeTime = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return then.toLocaleDateString();
};

export default function MyBids() {
  const { user } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBid, setSelectedBid] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadBids();
    }
  }, [user]);

  const loadBids = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const bidsData = await bidsApi.list({ freelancerId: user.id });
      setBids(bidsData);

      // Fetch job details for each bid
      const jobPromises = bidsData.map(async (bid: any) => {
        try {
          const job = await jobsApi.get(bid.jobId);
          return { jobId: bid.jobId, job };
        } catch {
          return { jobId: bid.jobId, job: null };
        }
      });
      const jobResults = await Promise.all(jobPromises);
      const jobsMap: Record<number, any> = {};
      jobResults.forEach(({ jobId, job }) => {
        if (job) jobsMap[jobId] = job;
      });
      setJobs(jobsMap);
    } catch (error) {
      toast.error("Failed to load bids");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Not set";
    return `NPR ${amount.toLocaleString()}`;
  };

  const filteredBids = bids.filter(bid => {
    const job = jobs[bid.jobId];
    const matchesSearch = job?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bid.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === "PENDING").length,
    accepted: bids.filter(b => b.status === "ACCEPTED").length,
    rejected: bids.filter(b => b.status === "REJECTED").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your bids...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Bids</h1>
              <p className="text-muted-foreground">Track and manage your job proposals</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.accepted}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by job title, description, or proposal..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="ACCEPTED">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Bids Grid */}
      {filteredBids.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No bids found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try adjusting your search or filters"
                    : "Start bidding on jobs to see them here"}
                </p>
              </div>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild>
                  <Link to="/jobs">
                    Browse Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredBids.map((bid) => {
            const job = jobs[bid.jobId];
            const status = statusConfig[bid.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            
            return (
              <Card 
                key={bid.id} 
                className="group hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary/20 hover:border-t-primary/60"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/jobs/${bid.jobId}`} 
                        className="block group-hover:text-primary transition-colors"
                      >
                        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
                          {job?.title || `Job #${bid.jobId}`}
                        </h3>
                      </Link>
                      {job?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <Badge className={`${status.bgColor} ${status.color} border`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Bid Amount */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Your Bid</span>
                    </div>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(Number(bid.amount))}
                    </span>
                  </div>

                  {/* Job Budget Range */}
                  {job && (job.budgetMin || job.budgetMax) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        Budget: {job.budgetMin && job.budgetMax
                          ? `NPR ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                          : formatCurrency(job.budgetMin || job.budgetMax)}
                      </span>
                    </div>
                  )}

                  {/* Proposal Message Preview */}
                  {bid.message && (
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Your Proposal</p>
                      <p className="text-sm line-clamp-2">{bid.message}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Submitted {getRelativeTime(bid.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedBid(bid)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/jobs/${bid.jobId}`}>
                        View Job
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    {bid.status === "ACCEPTED" && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        asChild
                      >
                        <Link to={`/projects?jobId=${bid.jobId}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Project
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bid Details Modal */}
      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
            <DialogDescription>
              {selectedBid && jobs[selectedBid.jobId]?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Job Title</p>
                    <p className="font-semibold">
                      {jobs[selectedBid.jobId]?.title || `Job #${selectedBid.jobId}`}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
                    <Badge className={`${statusConfig[selectedBid.status]?.bgColor || statusConfig.PENDING.bgColor} ${statusConfig[selectedBid.status]?.color || statusConfig.PENDING.color} border`}>
                      {statusConfig[selectedBid.status]?.label || selectedBid.status}
                    </Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Your Bid Amount</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(Number(selectedBid.amount))}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Submitted</p>
                    <p className="font-medium">
                      {new Date(selectedBid.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getRelativeTime(selectedBid.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {selectedBid.message && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Your Proposal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedBid.message}</p>
                  </CardContent>
                </Card>
              )}

              {jobs[selectedBid.jobId] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {jobs[selectedBid.jobId].description && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{jobs[selectedBid.jobId].description}</p>
                      </div>
                    )}
                    {(jobs[selectedBid.jobId].budgetMin || jobs[selectedBid.jobId].budgetMax) && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Budget Range</p>
                        <p className="text-sm font-medium">
                          {jobs[selectedBid.jobId].budgetMin && jobs[selectedBid.jobId].budgetMax
                            ? `NPR ${jobs[selectedBid.jobId].budgetMin.toLocaleString()} - ${jobs[selectedBid.jobId].budgetMax.toLocaleString()}`
                            : formatCurrency(jobs[selectedBid.jobId].budgetMin || jobs[selectedBid.jobId].budgetMax)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/jobs/${selectedBid.jobId}`}>
                    View Job Posting
                  </Link>
                </Button>
                {selectedBid.status === "ACCEPTED" && (
                  <Button variant="default" className="flex-1" asChild>
                    <Link to={`/projects?jobId=${selectedBid.jobId}`}>
                      Go to Project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

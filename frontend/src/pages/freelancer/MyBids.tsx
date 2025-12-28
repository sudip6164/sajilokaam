import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Trash2,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: "Pending", icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle, color: "bg-secondary/10 text-secondary border-secondary/20" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "bg-destructive/10 text-destructive border-destructive/20" },
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
      job?.description?.toLowerCase().includes(searchQuery.toLowerCase());
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
        <div className="text-center py-12">Loading bids...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Bids</h1>
        <p className="text-muted-foreground mt-1">Track and manage your job proposals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Bids</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-secondary">{stats.accepted}</p>
            <p className="text-sm text-muted-foreground">Accepted</p>
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
                placeholder="Search by job title or client..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bids table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Your Bid</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-muted-foreground">No bids found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBids.map((bid) => {
                    const job = jobs[bid.jobId];
                    const status = statusConfig[bid.status] || statusConfig.PENDING;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <Link to={`/jobs/${bid.jobId}`} className="font-medium max-w-[200px] truncate hover:text-primary">
                            {job?.title || `Job #${bid.jobId}`}
                          </Link>
                          {job && (job.budgetMin || job.budgetMax) && (
                            <div className="text-xs text-muted-foreground">
                              Budget: {job.budgetMin && job.budgetMax
                                ? `NPR ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                                : formatCurrency(job.budgetMin || job.budgetMax)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>Client ID: {job?.clientId || "N/A"}</TableCell>
                        <TableCell className="font-medium text-secondary">{formatCurrency(Number(bid.amount))}</TableCell>
                        <TableCell>{bid.estimatedCompletionDate ? new Date(bid.estimatedCompletionDate).toLocaleDateString() : "Not set"}</TableCell>
                        <TableCell>{new Date(bid.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedBid(bid)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/jobs/${bid.jobId}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Job
                                </Link>
                              </DropdownMenuItem>
                              {bid.status === "ACCEPTED" && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/freelancer/projects?jobId=${bid.jobId}`}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    View Project
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bid details modal */}
      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bid Details</DialogTitle>
            <DialogDescription>{selectedBid?.job}</DialogDescription>
          </DialogHeader>
          {selectedBid && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Job</p>
                  <p className="font-medium">{jobs[selectedBid.jobId]?.title || `Job #${selectedBid.jobId}`}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusConfig[selectedBid.status]?.color || statusConfig.PENDING.color}>
                    {statusConfig[selectedBid.status]?.label || selectedBid.status}
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Your Bid</p>
                  <p className="font-medium text-secondary">{formatCurrency(Number(selectedBid.amount))}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{new Date(selectedBid.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBid.duration}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{selectedBid.submittedAt}</p>
                </div>
              </div>
              {selectedBid.message && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Your Proposal</p>
                  <p className="text-sm">{selectedBid.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

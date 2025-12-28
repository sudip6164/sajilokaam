import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Briefcase,
  Star
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { jobsApi, bidsApi } from "@/lib/api";
import { toast } from "sonner";

export default function AvailableJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [budgetRange, setBudgetRange] = useState("Any Budget");
  const [duration, setDuration] = useState("Any Duration");
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [bidDuration, setBidDuration] = useState("");
  const [bidDialogOpen, setBidDialogOpen] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.list({ status: "OPEN" });
      
      // Fetch bid counts for each job
      const jobsWithBids = await Promise.all(
        data.map(async (job: any) => {
          try {
            const bids = await bidsApi.listByJob(job.id);
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

  const toggleSave = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
    toast.success(prev.includes(jobId) ? "Job removed from saved" : "Job saved");
  };

  const handleSubmitBid = async () => {
    if (!selectedJob || !bidAmount || !bidProposal) {
      toast.error("Please fill in all bid details");
      return;
    }

    try {
      await bidsApi.create({
        jobId: selectedJob.id,
        amount: Number(bidAmount),
        proposal: bidProposal,
        estimatedCompletionDate: bidDuration ? new Date(Date.now() + parseInt(bidDuration) * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      });
      
      toast.success(`Your bid for "${selectedJob.title}" has been submitted successfully.`);
      setBidDialogOpen(false);
      setSelectedJob(null);
      setBidAmount("");
      setBidProposal("");
      setBidDuration("");
      loadJobs(); // Refresh to update bid counts
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to submit bid";
      toast.error(message);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Negotiable";
    return `NPR ${amount.toLocaleString()}`;
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Jobs</h1>
        <p className="text-muted-foreground mt-1">Find and bid on projects that match your skills</p>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search jobs by title, skills, or keywords..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={budgetRange} onValueChange={setBudgetRange}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(dur => (
                    <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredJobs.length}</span> of {jobs.length} jobs
        </p>
        <Select defaultValue="newest">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="budget-high">Highest Budget</SelectItem>
            <SelectItem value="budget-low">Lowest Budget</SelectItem>
            <SelectItem value="bids-low">Fewest Bids</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/jobs/${job.id}`}>
                        <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                          {job.title}
                        </h3>
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {job.bidCount || 0} bids
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      {job.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Due: {new Date(job.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleSave(job.id)}
                  >
                    {savedJobs.includes(job.id) ? (
                      <BookmarkCheck className="h-5 w-5 text-primary" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {job.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="pt-3 border-t flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {(job.budgetMin || job.budgetMax) && (
                    <div className="flex items-center gap-1 text-secondary font-medium">
                      <DollarSign className="h-4 w-4" />
                      {job.budgetMin && job.budgetMax
                        ? `NPR ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                        : formatCurrency(job.budgetMin || job.budgetMax)}
                    </div>
                  )}
                  {job.expiresAt && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Due: {new Date(job.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button onClick={() => {
                  setSelectedJob(job);
                  setBidDialogOpen(true);
                }}>
                  Place Bid
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Bid Modal */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">Client's Budget:</p>
              <p className="font-semibold text-secondary">
                {selectedJob?.budgetMin && selectedJob?.budgetMax
                  ? `NPR ${selectedJob.budgetMin.toLocaleString()} - ${selectedJob.budgetMax.toLocaleString()}`
                  : formatCurrency(selectedJob?.budgetMin || selectedJob?.budgetMax)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidAmount">Your Bid Amount (NPR) *</Label>
              <Input 
                id="bidAmount"
                type="number"
                placeholder="e.g., 75000"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidDuration">Estimated Completion (weeks)</Label>
              <Input
                id="bidDuration"
                type="number"
                placeholder="e.g., 2"
                value={bidDuration}
                onChange={(e) => setBidDuration(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposal">Your Proposal *</Label>
              <Textarea 
                id="proposal"
                placeholder="Describe why you're the best fit for this project..."
                rows={5}
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
                required
                onChange={(e) => setBidProposal(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitBid}>
              Submit Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

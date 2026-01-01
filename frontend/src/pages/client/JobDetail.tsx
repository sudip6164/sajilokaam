import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  MessageSquare,
  Star,
  CheckCircle,
  Shield,
  User,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api, { jobsApi, projectsApi } from "@/lib/api";
import { toast } from "sonner";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [jobData, bidsData] = await Promise.all([
        jobsApi.get(Number(id)),
        api.get(`/jobs/${id}/bids/compare`).then((res) => res.data).catch(() => []), // Return empty array on error
      ]);
      setJob(jobData);
      setBids(bidsData || []);
    } catch (error) {
      toast.error("Failed to load job details");
      navigate("/my-jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = (bid: any) => {
    setSelectedBid(bid);
    setProjectTitle(job?.title || "");
    setProjectDescription(job?.description || "");
    setAcceptDialogOpen(true);
  };

  const confirmAcceptBid = async () => {
    if (!selectedBid || !projectTitle.trim()) {
      toast.error("Project title is required");
      return;
    }

    try {
      await projectsApi.acceptBid(selectedBid.bidId, {
        title: projectTitle,
        description: projectDescription,
      });
      toast.success(`Bid accepted! Project created with ${selectedBid.freelancerName}`);
      setAcceptDialogOpen(false);
      navigate("/my-projects");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to accept bid";
      toast.error(message);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Negotiable";
    return `NPR ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="text-center py-12">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Button asChild className="mt-4">
              <Link to="/my-jobs">Back to My Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link to="/my-jobs">
          <ArrowLeft className="h-4 w-4" />
          Back to My Jobs
        </Link>
      </Button>

      {/* Job Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-secondary/10 text-secondary">{job.status}</Badge>
            {job.category?.name && (
              <span className="text-sm text-muted-foreground">{job.category.name}</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">
            {job.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Posted on {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Job</Button>
          <Button variant="outline" className="text-destructive">
            Close Job
          </Button>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-semibold">
                {job.budgetMin && job.budgetMax
                  ? `NPR ${job.budgetMin.toLocaleString()} - ${job.budgetMax.toLocaleString()}`
                  : formatCurrency(job.budgetMin || job.budgetMax)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bids</p>
              <p className="font-semibold">{bids.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-semibold">
                {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{job.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bids">
        <TabsList>
          <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
          <TabsTrigger value="details">Job Details</TabsTrigger>
        </TabsList>

        {/* Bids Tab */}
        <TabsContent value="bids" className="space-y-4 mt-4">
          {bids.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No bids yet</p>
              </CardContent>
            </Card>
          ) : (
            bids.map((bid) => (
              <Card key={bid.bidId} hover>
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Freelancer Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                        <AvatarFallback>{bid.freelancerName?.charAt(0) || "F"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{bid.freelancerName}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{bid.freelancerEmail}</p>
                        {bid.experienceLevel && (
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span className="text-muted-foreground">
                              {bid.experienceLevel} level
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bid Details */}
                    <div className="flex flex-col sm:flex-row gap-4 lg:items-start">
                      <div className="space-y-1 text-center sm:text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(Number(bid.amount))}
                        </p>
                        <Badge variant={bid.status === "PENDING" ? "secondary" : bid.status === "ACCEPTED" ? "default" : "destructive"}>
                          {bid.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {bid.status === "PENDING" && (
                          <Button size="sm" onClick={() => handleAcceptBid(bid)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Proposal */}
                  {bid.message && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">{bid.message}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    Submitted: {new Date(bid.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {job.description || "No description provided"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Accept Bid Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept This Bid?</DialogTitle>
            <DialogDescription>
              You're about to hire {selectedBid?.freelancerName} for{" "}
              {formatCurrency(Number(selectedBid?.amount))}. This will create a project and close the job for other bidders.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {selectedBid?.freelancerName?.charAt(0) || "F"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedBid?.freelancerName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(selectedBid?.amount))}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-title">Project Title *</Label>
              <Input
                id="project-title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description (optional)"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAcceptBid} disabled={!projectTitle.trim()}>
              Confirm & Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetail;

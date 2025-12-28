import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Clock, DollarSign, Calendar, ArrowLeft, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobsApi, bidsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function JobDetailPublic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob();
      loadBids();
    }
  }, [id]);

  const loadJob = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await jobsApi.get(Number(id));
      setJob(data);
    } catch (error) {
      toast.error("Failed to load job details");
      navigate("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBids = async () => {
    if (!id) return;
    try {
      const data = await bidsApi.list({ jobId: Number(id) });
      setBids(data);
    } catch (error) {
      // Silently fail - bids might not be accessible
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Negotiable";
    return `NPR ${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Button asChild className="mt-4">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canBid = isAuthenticated && hasRole("FREELANCER");
  const isOwner = isAuthenticated && user?.id === job.clientId;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/jobs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{job.title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {job.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {job.budget && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{formatCurrency(job.budget)}</span>
              </div>
            )}
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <Badge variant="secondary">{job.status}</Badge>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </div>
              {bids.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {bids.length} bid{bids.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Login to submit a bid or save this job
              </p>
              <Button asChild>
                <Link to="/login">Login to Continue</Link>
              </Button>
            </div>
          )}

          {canBid && !isOwner && (
            <div className="pt-4 border-t">
              <Button asChild>
                <Link to={`/freelancer/jobs/${job.id}`}>Submit Bid</Link>
              </Button>
            </div>
          )}

          {isOwner && (
            <div className="pt-4 border-t">
              <Button asChild>
                <Link to={`/client/jobs/${job.id}`}>Manage Job</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


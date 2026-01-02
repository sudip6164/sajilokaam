import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowLeft, 
  Briefcase,
  MapPin,
  Building2,
  CheckCircle2,
  Users,
  Tag,
  FileText,
  Share2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  TrendingUp,
  Award,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { jobsApi, bidsApi, adminApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function JobDetailPublic() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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
      
      // Load client information if available (optional - might fail for public users)
      if (data.clientId) {
        try {
          const clientData = await adminApi.getUser(data.clientId);
          setClient(clientData);
        } catch (error) {
          // Client info might not be available for public viewing - that's okay
          // We'll just show the job without client details
        }
      }
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
      const data = await bidsApi.listByJob(Number(id));
      setBids(data);
    } catch (error) {
      // Silently fail - bids might not be accessible for public users
    }
  };

  const formatCurrency = (min?: number, max?: number) => {
    if (min && max) {
      return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `NPR ${min.toLocaleString()}+`;
    if (max) return `Up to NPR ${max.toLocaleString()}`;
    return "Negotiable";
  };

  const formatDescription = (description: string) => {
    if (!description) return "";
    
    // Split by common section markers
    const sections = description.split(/\n\s*\n/);
    
    return sections.map((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return null;
      
      // Check if it's a heading (starts with # or is all caps)
      if (trimmed.startsWith("#") || trimmed.match(/^[A-Z\s]+$/)) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {trimmed.replace(/^#+\s*/, "")}
          </h3>
        );
      }
      
      // Check if it's a bullet list
      if (trimmed.includes("•") || trimmed.includes("-") || trimmed.match(/^\d+\./)) {
        const items = trimmed.split(/\n/).filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 ml-4">
            {items.map((item, i) => (
              <li key={i} className="text-muted-foreground leading-relaxed">
                {item.replace(/^[•\-\d+\.]\s*/, "")}
              </li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-4">
          {trimmed}
        </p>
      );
    }).filter(Boolean);
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

  const handleSaveJob = async () => {
    // TODO: Implement save job functionality
    setIsSaving(true);
    setTimeout(() => {
      setIsSaved(!isSaved);
      setIsSaving(false);
      toast.success(isSaved ? "Job removed from saved" : "Job saved");
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">This job may have been removed or doesn't exist.</p>
            <Button asChild>
              <Link to="/jobs">Browse All Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canBid = isAuthenticated && hasRole("FREELANCER");
  const isOwner = isAuthenticated && user?.id === job.clientId;
  const skills = job.requiredSkills || [];
  const category = job.category?.name || "Uncategorized";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {category}
                      </Badge>
                      <Badge 
                        className={
                          job.status === "OPEN" 
                            ? "bg-green-500/10 text-green-600 border-green-500/20" 
                            : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold leading-tight mb-3">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>Posted {getTimeAgo(job.createdAt)}</span>
                      </div>
                      {bids.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{bids.length} proposal{bids.length !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveJob}
                      disabled={isSaving}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                {/* Budget & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {(job.budgetMin || job.budgetMax) && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Budget</p>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(job.budgetMin, job.budgetMax)}
                        </p>
                        {job.budgetType && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.budgetType === "HOURLY" ? "Hourly Rate" : "Fixed Price"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {job.expiresAt && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/5 border border-secondary/10">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Calendar className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Deadline</p>
                        <p className="text-lg font-bold text-secondary">
                          {new Date(job.expiresAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills Required */}
                {skills.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Skills Required</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: any, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="px-3 py-1.5 text-sm bg-background hover:bg-primary/5 border-primary/20"
                        >
                          <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
                          {skill.name || skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-bold mb-4 text-foreground">Job Description</h2>
                  <div className="prose prose-sm max-w-none">
                    {formatDescription(job.description || "No description provided.")}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Section */}
            {!isAuthenticated && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Interested in this job?</h3>
                      <p className="text-sm text-muted-foreground">
                        Sign in to submit a proposal or save this job for later.
                      </p>
                    </div>
                    <Button size="lg" asChild>
                      <Link to="/login">Sign In to Continue</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {canBid && !isOwner && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Ready to submit a proposal?</h3>
                      <p className="text-sm text-muted-foreground">
                        Create a professional proposal to stand out from other freelancers.
                      </p>
                    </div>
                    <Button size="lg" onClick={() => navigate(`/jobs/${id}/bid`)}>
                      Submit Proposal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card className="border-2 border-secondary/20 bg-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Manage Your Job Posting</h3>
                      <p className="text-sm text-muted-foreground">
                        View proposals, edit details, or manage applicants.
                      </p>
                    </div>
                    <Button size="lg" variant="secondary" asChild>
                      <Link to={`/my-jobs/${job.id}`}>Manage Job</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Profile Card */}
            {client && (
              <Card className="border-2 shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    About the Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {client.fullName?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {client.fullName || "Client"}
                      </p>
                      {client.email && (
                        <p className="text-sm text-muted-foreground truncate">
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {client.locationCity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{client.locationCity}{client.locationCountry && `, ${client.locationCountry}`}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Verified Client</span>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/freelancers/${client.id}`}>
                      View Client Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Job Summary Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Posted</span>
                    <span className="text-sm font-medium">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline">{category}</Badge>
                  </div>
                  {job.budgetType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment Type</span>
                      <span className="text-sm font-medium">
                        {job.budgetType === "HOURLY" ? "Hourly" : "Fixed Price"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Proposals</span>
                    <span className="text-sm font-medium">{bids.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

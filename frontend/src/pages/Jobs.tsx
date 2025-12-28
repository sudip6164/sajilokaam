import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { jobsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Jobs() {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const data = await jobsApi.list({ status: "OPEN" });
      setJobs(data);
    } catch (error) {
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (min?: number, max?: number) => {
    if (min && max) {
      return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `NPR ${min.toLocaleString()}+`;
    if (max) return `Up to NPR ${max.toLocaleString()}`;
    return "Negotiable";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground mt-2">
          Find your next project opportunity
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No jobs found</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {job.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {(job.budgetMin || job.budgetMax) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(job.budgetMin, job.budgetMax)}</span>
                    </div>
                  )}
                  {job.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Due: {new Date(job.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Badge variant="secondary">{job.status}</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  {!isAuthenticated && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/login">Login to Bid</Link>
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button asChild size="sm">
                      <Link to={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


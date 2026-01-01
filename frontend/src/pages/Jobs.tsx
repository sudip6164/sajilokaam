import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Clock, DollarSign, Briefcase, Filter, X, Calendar, TrendingUp, Sparkles, MapPin, Users, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jobsApi, bidsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const budgetRanges = [
  { label: "Any Budget", value: "all" },
  { label: "Under NPR 10,000", value: "0-10000" },
  { label: "NPR 10,000 - 50,000", value: "10000-50000" },
  { label: "NPR 50,000 - 100,000", value: "50000-100000" },
  { label: "NPR 100,000 - 500,000", value: "100000-500000" },
  { label: "Over NPR 500,000", value: "500000+" },
];

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Budget: High to Low", value: "budget-desc" },
  { label: "Budget: Low to High", value: "budget-asc" },
];

export default function Jobs() {
  const { isAuthenticated, hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isFreelancer = hasRole("FREELANCER");

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

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

  const formatCurrency = (min?: number, max?: number) => {
    if (min && max) {
      return `NPR ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    if (min) return `NPR ${min.toLocaleString()}+`;
    if (max) return `Up to NPR ${max.toLocaleString()}`;
    return "Negotiable";
  };

  const getBudgetRange = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const avg = min && max ? (min + max) / 2 : min || max || 0;
    if (avg < 10000) return "0-10000";
    if (avg < 50000) return "10000-50000";
    if (avg < 100000) return "50000-100000";
    if (avg < 500000) return "100000-500000";
    return "500000+";
  };

  const filteredAndSortedJobs = jobs
    .filter((job) => {
      // Search filter
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Budget filter
      const jobBudgetRange = getBudgetRange(job.budgetMin, job.budgetMax);
      const matchesBudget = budgetFilter === "all" || jobBudgetRange === budgetFilter;

      return matchesSearch && matchesBudget;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "budget-desc":
          return (b.budgetMax || b.budgetMin || 0) - (a.budgetMax || a.budgetMin || 0);
        case "budget-asc":
          return (a.budgetMin || a.budgetMax || 0) - (b.budgetMin || b.budgetMax || 0);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSearchQuery("");
    setBudgetFilter("all");
    setSortBy("newest");
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || budgetFilter !== "all";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "open":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">Open</Badge>;
      case "active":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">Active</Badge>;
      case "closed":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Closed</Badge>;
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Discover Opportunities
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? "job" : "jobs"} waiting for you
            </p>
          </div>
          {isAuthenticated && isFreelancer && (
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/bids">
                <Briefcase className="h-4 w-4 mr-2" />
                My Bids
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-5">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, skills, or keywords..."
                className="pl-12 h-14 text-base border-2 focus:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Filters</span>
              </div>

              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger className="w-[200px] border-2">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 ml-auto border rounded-lg p-1 bg-muted/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8"
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8"
                >
                  List
                </Button>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="border-2">
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid/List */}
      {filteredAndSortedJobs.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-20 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <Briefcase className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your filters or search query to find more opportunities"
                : "Check back later for new opportunities"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} size="lg">
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-3 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <span className="text-xs text-muted-foreground">• {getTimeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-5 min-h-[60px] leading-relaxed">
                    {job.description || "No description provided"}
                  </p>

                  <div className="space-y-3 mb-5">
                    {(job.budgetMin || job.budgetMax) && (
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/10">
                        <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="font-bold text-secondary text-base">
                          {formatCurrency(job.budgetMin, job.budgetMax)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {job.expiresAt && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Due {new Date(job.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{getTimeAgo(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    {!isAuthenticated ? (
                      <Button variant="outline" className="w-full group/btn" size="sm">
                        <Zap className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                        Login to Bid
                      </Button>
                    ) : isFreelancer ? (
                      <Button className="w-full group/btn bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" size="sm">
                        View & Bid
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedJobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`}>
              <Card className="transition-all duration-300 hover:shadow-xl cursor-pointer group border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl group-hover:text-primary transition-colors mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusBadge(job.status)}
                            <span className="text-xs text-muted-foreground">• {getTimeAgo(job.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {job.description || "No description provided"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {(job.budgetMin || job.budgetMax) && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10">
                            <DollarSign className="h-4 w-4 text-secondary" />
                            <span className="font-bold text-secondary">
                              {formatCurrency(job.budgetMin, job.budgetMax)}
                            </span>
                          </div>
                        )}
                        {job.expiresAt && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Due {new Date(job.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{getTimeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      {!isAuthenticated ? (
                        <Button variant="outline" size="sm" className="group/btn">
                          <Zap className="h-4 w-4 mr-2 group-hover/btn:animate-pulse" />
                          Login to Bid
                        </Button>
                      ) : isFreelancer ? (
                        <Button size="sm" className="group/btn bg-gradient-to-r from-primary to-secondary">
                          View & Bid
                          <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, DollarSign, Star, CheckCircle, Filter, X, User, Briefcase, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Rating", value: "rating" },
  { label: "Hourly Rate: Low to High", value: "rate-asc" },
  { label: "Hourly Rate: High to Low", value: "rate-desc" },
];

export default function Freelancers() {
  const { isAuthenticated, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const isClient = hasRole("CLIENT");

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      setIsLoading(true);
      // Use public endpoint to get freelancers
      const response = await api.get("/users/freelancers", { params: { page: 0, size: 100 } });
      const usersData = response.data;
      
      // Transform to freelancer cards format
      const freelancerCards = usersData.content.map((user: any) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        location: "Kathmandu, Nepal", // Placeholder - would come from profile
        hourlyRate: 1500, // Placeholder - would come from profile
        rating: 4.8, // Placeholder
        completedProjects: 25, // Placeholder
        skills: ["React", "Node.js", "TypeScript"], // Placeholder
        verified: true, // Placeholder
        bio: "Experienced developer with expertise in modern web technologies.", // Placeholder
      }));
      
      setFreelancers(freelancerCards);
    } catch (error: any) {
      console.error("Failed to load freelancers:", error);
      toast.error("Failed to load freelancers");
      setFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedFreelancers = freelancers
    .filter((freelancer) => {
      const matchesSearch =
        freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        freelancer.skills.some((skill: string) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        freelancer.bio?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return 0; // Would sort by createdAt if available
        case "rating":
          return b.rating - a.rating;
        case "rate-asc":
          return a.hourlyRate - b.hourlyRate;
        case "rate-desc":
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading freelancers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Freelancers
          </h1>
          <p className="text-muted-foreground">
            {filteredAndSortedFreelancers.length} {filteredAndSortedFreelancers.length === 1 ? "freelancer" : "freelancers"} available
          </p>
        </div>
        {isAuthenticated && isClient && (
          <Button asChild>
            <Link to="/post-job">
              <Briefcase className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or expertise..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sort:</span>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
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

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Freelancers Grid/List */}
      {filteredAndSortedFreelancers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try adjusting your search query"
                : "Check back later for new freelancers"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${freelancer.name}`} />
                    <AvatarFallback className="text-lg">
                      {freelancer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {freelancer.name}
                      </h3>
                      {freelancer.verified && (
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{freelancer.rating}</span>
                      <span className="text-muted-foreground">({freelancer.completedProjects} projects)</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {freelancer.bio || "No bio available"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                    <span className="font-medium text-secondary">
                      NPR {freelancer.hourlyRate.toLocaleString()}/hr
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {freelancer.skills.slice(0, 3).map((skill: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{freelancer.skills.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button className="w-full" size="sm" asChild>
                    <Link to={`/freelancers/${freelancer.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="transition-all hover:shadow-md cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-16 w-16 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${freelancer.name}`} />
                      <AvatarFallback>
                        {freelancer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                          {freelancer.name}
                        </h3>
                        {freelancer.verified && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {freelancer.bio || "No bio available"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="font-medium">{freelancer.rating}</span>
                          <span className="text-muted-foreground">({freelancer.completedProjects})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-secondary">
                            NPR {freelancer.hourlyRate.toLocaleString()}/hr
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {freelancer.skills.slice(0, 5).map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button size="sm" asChild>
                      <Link to={`/freelancers/${freelancer.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


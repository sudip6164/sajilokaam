import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  Filter, 
  X, 
  User, 
  Users,
  Briefcase, 
  TrendingUp,
  Grid3x3,
  List,
  SlidersHorizontal,
  Sparkles,
  Award,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
      const response = await api.get("/users/freelancers", { params: { page: 0, size: 100 } });
      const usersData = response.data;
      
      const freelancerCards = usersData.content.map((user: any) => {
        const parseSkills = (skills: string) => {
          if (!skills) return [];
          try {
            return JSON.parse(skills);
          } catch {
            return skills.split(",").map((s: string) => s.trim()).filter(Boolean);
          }
        };
        
        const primarySkills = parseSkills(user.primarySkills || "");
        const secondarySkills = parseSkills(user.secondarySkills || "");
        const allSkills = [...primarySkills, ...secondarySkills];
        
        const locationParts = [user.locationCity, user.locationCountry].filter(Boolean);
        const location = locationParts.length > 0 ? locationParts.join(", ") : "Location not specified";
        
        const hourlyRate = user.hourlyRate 
          ? parseFloat(user.hourlyRate.toString())
          : (user.hourlyRateMin ? parseFloat(user.hourlyRateMin.toString()) : 0);
        
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          location: location,
          hourlyRate: hourlyRate,
          rating: 4.8,
          completedProjects: 25,
          skills: allSkills.length > 0 ? allSkills : ["Skills not specified"],
          verified: user.status === "VERIFIED",
          bio: user.overview || user.headline || "No bio available",
          profilePictureUrl: user.profilePictureUrl,
          experienceLevel: user.experienceLevel,
          experienceYears: user.experienceYears,
        };
      });
      
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
          return 0;
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
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-lg">Loading freelancers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/10 via-primary/5 to-background p-8 md:p-12 border-2 border-secondary/20">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    Find Freelancers
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {filteredAndSortedFreelancers.length} {filteredAndSortedFreelancers.length === 1 ? "freelancer" : "freelancers"} available
                  </p>
                </div>
              </div>
              {isAuthenticated && isClient && (
                <Button asChild size="lg" className="mt-4 shadow-lg bg-gradient-to-r from-primary to-secondary">
                  <Link to="/post-job">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post a Job
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-2 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-secondary" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, skills, or expertise..."
                className="pl-12 h-14 text-base border-2 focus:border-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Separator />

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border">
                <Filter className="h-4 w-4 text-secondary" />
                <span className="text-sm font-semibold">Sort:</span>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[220px] border-2">
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

              <div className="flex items-center gap-2 ml-auto border-2 rounded-lg p-1 bg-muted/50">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-9"
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-9"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>

              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="border-2">
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Freelancers Grid/List */}
        {filteredAndSortedFreelancers.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-20 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <User className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No freelancers found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Check back later for new freelancers"}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")} size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedFreelancers.map((freelancer) => (
              <Link key={freelancer.id} to={`/freelancers/${freelancer.id}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group border-2 hover:border-secondary/50 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-5">
                      <Avatar className="h-16 w-16 ring-2 ring-secondary/20 group-hover:ring-secondary/50 transition-all">
                        <AvatarImage src={freelancer.profilePictureUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${freelancer.name}`} />
                        <AvatarFallback className="text-lg bg-secondary/10 text-secondary font-bold">
                          {freelancer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg group-hover:text-secondary transition-colors line-clamp-1">
                            {freelancer.name}
                          </h3>
                          {freelancer.verified && (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-semibold">{freelancer.rating}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{freelancer.completedProjects} projects</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-5 min-h-[40px] leading-relaxed">
                      {freelancer.bio || "No bio available"}
                    </p>

                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{freelancer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                        <DollarSign className="h-4 w-4 text-secondary flex-shrink-0" />
                        <span className="font-bold text-secondary">
                          NPR {freelancer.hourlyRate.toLocaleString()}/hr
                        </span>
                      </div>
                      {freelancer.experienceLevel && (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground capitalize">{freelancer.experienceLevel.toLowerCase()} Level</span>
                          {freelancer.experienceYears && (
                            <span className="text-muted-foreground">• {freelancer.experienceYears} years</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {freelancer.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-background border-primary/20 hover:border-primary/40">
                          <Sparkles className="h-3 w-3 mr-1 text-primary" />
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
                      <Button className="w-full group/btn bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90" size="sm">
                        View Profile
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedFreelancers.map((freelancer) => (
              <Link key={freelancer.id} to={`/freelancers/${freelancer.id}`}>
                <Card className="transition-all duration-300 hover:shadow-xl cursor-pointer group border-2 hover:border-secondary/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <Avatar className="h-20 w-20 flex-shrink-0 ring-2 ring-secondary/20">
                          <AvatarImage src={freelancer.profilePictureUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${freelancer.name}`} />
                          <AvatarFallback className="text-xl bg-secondary/10 text-secondary font-bold">
                            {freelancer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-xl group-hover:text-secondary transition-colors">
                              {freelancer.name}
                            </h3>
                            {freelancer.verified && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                            {freelancer.bio || "No bio available"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-accent text-accent" />
                              <span className="font-semibold">{freelancer.rating}</span>
                              <span className="text-muted-foreground">({freelancer.completedProjects})</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{freelancer.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-secondary" />
                              <span className="font-bold text-secondary">
                                NPR {freelancer.hourlyRate.toLocaleString()}/hr
                              </span>
                            </div>
                            {freelancer.experienceLevel && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Award className="h-4 w-4" />
                                <span className="capitalize">{freelancer.experienceLevel.toLowerCase()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {freelancer.skills.slice(0, 5).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-background">
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
                        <Button size="sm" className="group/btn bg-gradient-to-r from-secondary to-primary" asChild>
                          <Link to={`/freelancers/${freelancer.id}`}>
                            View Profile
                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

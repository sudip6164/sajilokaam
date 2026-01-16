import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, Wallet, Star, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from './ui/card';
import { useRouter } from './Router';
import { jobsApi, jobCategoriesApi, profileApi, reviewsApi, clientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from './ui/skeleton';

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  jobType?: string;
  budgetMin?: number;
  budgetMax?: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  expiresAt?: string;
  deadline?: string;
  requiredSkills?: Array<{
    id: number;
    name: string;
  }>;
}

interface JobCategory {
  id: number;
  name: string;
  description?: string;
}

export function FindWorkPage() {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [budgetRange, setBudgetRange] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [clientRatings, setClientRatings] = useState<Record<number, { average: number; count: number }>>({});
  const [clientNames, setClientNames] = useState<Record<number, string>>({});

  // Fetch jobs and categories on mount
  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, [selectedCategory, budgetRange, jobTypeFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        status: 'OPEN', // Only show open jobs
      };

      if (selectedCategory !== 'all') {
        params.categoryId = parseInt(selectedCategory);
      }

      if (jobTypeFilter !== 'all') {
        params.jobType = jobTypeFilter === 'fixed' ? 'FIXED_PRICE' : 'HOURLY';
      }

      // Parse budget range
      if (budgetRange !== 'all') {
        if (budgetRange === 'under-1000') {
          params.budgetMax = 1000;
        } else if (budgetRange === '1000-5000') {
          params.budgetMin = 1000;
          params.budgetMax = 5000;
        } else if (budgetRange === '5000-10000') {
          params.budgetMin = 5000;
          params.budgetMax = 10000;
        } else if (budgetRange === 'over-10000') {
          params.budgetMin = 10000;
        }
      }

      const data = await jobsApi.list(params);
      setJobs(data as any);
      
      // Fetch client info (name and ratings) for all jobs
      const ratingsMap: Record<number, { average: number; count: number }> = {};
      const namesMap: Record<number, string> = {};
      await Promise.all(
        (data as any[]).map(async (job: any) => {
          if (job.clientId) {
            try {
              // job.clientId is a USER ID, so use clientsApi.getById which expects user ID
              const clientProfile = await clientsApi.getById(job.clientId);
              console.log(`FindWorkPage: Job ${job.id} - clientId (user ID): ${job.clientId}, profile:`, clientProfile);
              
              // Store client name - use userId from profile, not profile id
              const clientName = clientProfile.companyName || clientProfile.user?.fullName || 'Client';
              namesMap[job.id] = clientName;
              
              // Fetch client reviews using user ID (job.clientId IS the user ID)
              const clientUserId = job.clientId; // job.clientId is already the user ID
              console.log(`FindWorkPage: Job ${job.id} - Using clientUserId: ${clientUserId}, name: ${clientName}`);
              
              try {
                const reviews = await reviewsApi.listByUser(clientUserId);
                console.log(`FindWorkPage: Job ${job.id} - reviews:`, reviews);
                if (Array.isArray(reviews) && reviews.length > 0) {
                  const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
                  ratingsMap[job.id] = { average: avg, count: reviews.length };
                }
              } catch (err) {
                console.error(`FindWorkPage: Error fetching reviews for job ${job.id}:`, err);
              }
            } catch (err) {
              console.error(`FindWorkPage: Error fetching client profile for job ${job.id} (clientId: ${job.clientId}):`, err);
              // Set a default name even if profile fetch fails
              namesMap[job.id] = 'Client';
            }
          }
        })
      );
      console.log('FindWorkPage: Setting clientRatings:', ratingsMap);
      console.log('FindWorkPage: Setting clientNames:', namesMap);
      setClientRatings(ratingsMap);
      setClientNames(namesMap);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await jobCategoriesApi.list();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const toggleSaveJob = (jobId: number) => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  // Client-side search filtering
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.requiredSkills?.some(skill => skill.name.toLowerCase().includes(query))
    );
  });

  const formatBudget = (job: Job) => {
    if (job.jobType === 'HOURLY' && job.budgetMin && job.budgetMax) {
      return `Rs. ${job.budgetMin}-Rs. ${job.budgetMax}/hr`;
    } else if (job.jobType === 'FIXED_PRICE' && job.budgetMax) {
      return `Rs. ${job.budgetMax.toLocaleString()} fixed`;
    } else if (job.budgetMax) {
      return `Rs. ${job.budgetMax.toLocaleString()}`;
    }
    return 'Budget not specified';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-muted/20 pt-16">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur fixed top-0 left-0 right-0 z-50">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-6">
          <button 
            onClick={() => navigate('home')}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-semibold text-foreground">SajiloKaam</span>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 lg:px-12 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Work</h1>
          <p className="text-lg text-muted-foreground">Discover projects that match your skills and interests</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for projects, skills, or keywords..."
                className="pl-11 h-12 border-2 rounded-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="md:w-auto h-12 border-2 hover:border-primary hover:bg-primary/5">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={budgetRange} onValueChange={setBudgetRange}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="under-1000">Under Rs. 1,000</SelectItem>
                <SelectItem value="1000-5000">Rs. 1,000 - 5,000</SelectItem>
                <SelectItem value="5000-10000">Rs. 5,000 - 10,000</SelectItem>
                <SelectItem value="over-10000">Over Rs. 10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            {loading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <>
                <span className="text-foreground font-semibold">{filteredJobs.length}</span> project{filteredJobs.length !== 1 ? 's' : ''} found
              </>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Listings */}
        {!loading && (
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card className="border-2 p-8 text-center">
                <p className="text-muted-foreground">No jobs found. Try adjusting your filters.</p>
              </Card>
            ) : (
              filteredJobs.map((job) => {
                console.log(`FindWorkPage Render: Job ${job.id} - clientNames[${job.id}]:`, clientNames[job.id], 'clientRatings[${job.id}]:', clientRatings[job.id]);
                return (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-card-foreground hover:text-primary cursor-pointer transition-colors">
                            {job.title}
                          </h3>
                          {job.status === 'OPEN' && (
                            <Badge className="text-xs bg-success/10 text-success border-success/20 hover:bg-success/20">
                              Open
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className="ml-4 hover:bg-primary/10"
                      >
                        <Bookmark 
                          className={`h-5 w-5 ${savedJobs.includes(job.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Budget and Duration */}
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {formatBudget(job)}
                          </span>
                        </div>
                        {job.category && (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-xs">
                              {job.category.name}
                            </Badge>
                          </div>
                        )}
                        {(clientNames[job.id] || clientRatings[job.id]) && (
                          <div className="flex items-center gap-2 text-sm">
                            {clientNames[job.id] && (
                              <>
                                <span className="text-muted-foreground">by</span>
                                <span className="font-medium">{clientNames[job.id]}</span>
                              </>
                            )}
                            {clientRatings[job.id] && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{clientRatings[job.id].average.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">({clientRatings[job.id].count})</span>
                              </div>
                            )}
                          </div>
                        )}
                        {job.createdAt && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{formatDate(job.createdAt)}</span>
                          </div>
                        )}
                        {job.deadline && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill) => (
                            <Badge key={skill.id} variant="outline" className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors">
                              {skill.name}
                            </Badge>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requiredSkills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 pt-2 border-t-2 border-border">
                        {isAuthenticated ? (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 md:flex-none bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-sm"
                              onClick={() => navigate('job-detail', { jobId: job.id })}
                            >
                              Apply Now
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-2 hover:border-primary hover:bg-primary/5"
                              onClick={() => navigate('job-detail', { jobId: job.id })}
                            >
                              View Details
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              className="flex-1 md:flex-none bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-sm"
                              onClick={() => navigate('login')}
                            >
                              Login to Bid
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-2 hover:border-primary hover:bg-primary/5"
                              onClick={() => navigate('job-detail', { jobId: job.id })}
                            >
                              View Details
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

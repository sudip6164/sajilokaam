import { useState } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Star, Bookmark, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from './ui/card';
import { useRouter } from './Router';

const jobs = [
  {
    id: 1,
    title: "React Developer for E-commerce Platform",
    description: "Looking for an experienced React developer to build a modern e-commerce platform with Redux, TypeScript, and integration with payment gateways.",
    budget: { type: "fixed", amount: 5000 },
    duration: "2-3 months",
    skills: ["React", "TypeScript", "Redux", "Payment Integration"],
    client: {
      name: "TechCorp Solutions",
      rating: 4.8,
      reviews: 47,
      location: "San Francisco, CA"
    },
    postedAt: "2 hours ago",
    proposals: 12,
    verified: true
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design",
    description: "Need a talented designer to create modern, user-friendly interfaces for our fitness tracking mobile app. Experience with health/fitness apps preferred.",
    budget: { type: "hourly", min: 40, max: 80 },
    duration: "1-2 months",
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
    client: {
      name: "FitLife Startup",
      rating: 4.9,
      reviews: 23,
      location: "New York, NY"
    },
    postedAt: "4 hours ago",
    proposals: 8,
    verified: true
  },
  {
    id: 3,
    title: "Content Writer for Tech Blog",
    description: "Seeking a skilled content writer to create engaging articles about emerging technologies, AI, and software development trends.",
    budget: { type: "hourly", min: 25, max: 45 },
    duration: "Ongoing",
    skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
    client: {
      name: "Digital Insights",
      rating: 4.7,
      reviews: 156,
      location: "Remote"
    },
    postedAt: "1 day ago",
    proposals: 23,
    verified: false
  },
  {
    id: 4,
    title: "Python Data Analysis & Visualization",
    description: "Need a data scientist to analyze customer behavior data and create interactive dashboards using Python, Pandas, and visualization libraries.",
    budget: { type: "fixed", amount: 3500 },
    duration: "1 month",
    skills: ["Python", "Data Analysis", "Pandas", "Matplotlib", "Tableau"],
    client: {
      name: "RetailMetrics Co",
      rating: 4.6,
      reviews: 34,
      location: "Chicago, IL"
    },
    postedAt: "2 days ago",
    proposals: 15,
    verified: true
  },
  {
    id: 5,
    title: "WordPress Website Development",
    description: "Looking for a WordPress developer to create a custom business website with booking functionality and payment integration.",
    budget: { type: "fixed", amount: 2000 },
    duration: "3-4 weeks",
    skills: ["WordPress", "PHP", "Custom Themes", "WooCommerce"],
    client: {
      name: "Local Services Hub",
      rating: 4.5,
      reviews: 89,
      location: "Austin, TX"
    },
    postedAt: "3 days ago",
    proposals: 31,
    verified: true
  },
  {
    id: 6,
    title: "Digital Marketing Campaign Management",
    description: "Experienced digital marketer needed to manage Google Ads, Facebook campaigns, and SEO strategy for growing SaaS company.",
    budget: { type: "hourly", min: 50, max: 100 },
    duration: "3-6 months",
    skills: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "SaaS Marketing"],
    client: {
      name: "CloudTech Solutions",
      rating: 4.9,
      reviews: 67,
      location: "Seattle, WA"
    },
    postedAt: "1 week ago",
    proposals: 19,
    verified: true
  }
];

const categories = [
  "All Categories",
  "Web Development",
  "Mobile Development", 
  "Design & Creative",
  "Writing & Content",
  "Digital Marketing",
  "Data Science",
  "DevOps & Cloud"
];

export function FindWorkPage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [budgetRange, setBudgetRange] = useState('All Budgets');
  const [savedJobs, setSavedJobs] = useState<number[]>([]);

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || 
                           job.skills.some(skill => {
                             switch(selectedCategory) {
                               case 'Web Development': return ['React', 'WordPress', 'PHP', 'TypeScript'].includes(skill);
                               case 'Design & Creative': return ['UI/UX Design', 'Figma', 'Mobile Design'].includes(skill);
                               case 'Writing & Content': return ['Content Writing', 'Technical Writing', 'SEO'].includes(skill);
                               case 'Digital Marketing': return ['Google Ads', 'Facebook Ads', 'SEO', 'Analytics'].includes(skill);
                               case 'Data Science': return ['Python', 'Data Analysis', 'Pandas', 'Matplotlib'].includes(skill);
                               default: return true;
                             }
                           });
    
    return matchesSearch && matchesCategory;
  });

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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={budgetRange} onValueChange={setBudgetRange}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Budget Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Budgets">All Budgets</SelectItem>
                <SelectItem value="Under $1000">Under $1,000</SelectItem>
                <SelectItem value="$1000-$5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="$5000-$10000">$5,000 - $10,000</SelectItem>
                <SelectItem value="Over $10000">Over $10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filteredJobs.length}</span> project{filteredJobs.length !== 1 ? 's' : ''} found
          </p>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[150px] h-10 border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="budget-high">Highest Budget</SelectItem>
              <SelectItem value="budget-low">Lowest Budget</SelectItem>
              <SelectItem value="proposals">Fewest Proposals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-card-foreground hover:text-primary cursor-pointer transition-colors">
                        {job.title}
                      </h3>
                      {job.verified && (
                        <Badge className="text-xs bg-success/10 text-success border-success/20 hover:bg-success/20">
                          Verified Client
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
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {job.budget.type === 'fixed' 
                          ? `$${job.budget.amount.toLocaleString()} fixed`
                          : `$${job.budget.min}-$${job.budget.max}/hr`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{job.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{job.client.location}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Client Info and Stats */}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-sm">{job.client.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground font-medium">
                            {job.client.rating} ({job.client.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <span className="bg-muted px-2 py-1 rounded">{job.proposals} proposals</span>
                      <span>{job.postedAt}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="border-2 hover:border-primary hover:bg-primary/5">
            Load More Projects
          </Button>
        </div>
      </main>
    </div>
  );
}
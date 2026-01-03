import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Header } from './Header';
import { Footer } from './Footer';
import { JobFilters, JobFiltersState } from './filters/JobFilters';
import { ActiveFilters } from './filters/ActiveFilters';
import { SortOptions, SortOption, ViewMode } from './filters/SortOptions';
import { EnhancedJobCard, Job } from './EnhancedJobCard';
import { SavedSearches } from './SavedSearches';
import { useRouter } from './Router';

const mockJobs: Job[] = [
  {
    id: 1,
    title: "Senior React Developer for SaaS Platform",
    description: "We're looking for an experienced React developer to build a modern enterprise SaaS platform. You'll work with our team to design and implement scalable features using React, TypeScript, and Node.js. Strong understanding of state management, API integration, and modern development practices required.",
    category: "Web Development",
    budget: { type: 'hourly', amount: 75, max: 120 },
    skills: ["React", "TypeScript", "Node.js", "Redux", "GraphQL", "AWS"],
    postedTime: "2 hours ago",
    client: {
      name: "TechVentures Inc",
      rating: 4.9,
      reviews: 127,
      location: "San Francisco, CA",
      verified: true,
      totalSpent: 250000,
      hireRate: 95,
    },
    proposals: 8,
    experienceLevel: "Expert",
    projectLength: "3-6 months",
    isFeatured: true,
  },
  {
    id: 2,
    title: "Mobile App UI/UX Design - Fitness Application",
    description: "Need a talented designer to create modern, intuitive interfaces for our iOS and Android fitness tracking app. Experience with health/wellness apps is a plus. Deliverables include wireframes, high-fidelity mockups, and interactive prototypes.",
    category: "Design & Creative",
    budget: { type: 'fixed', amount: 4500 },
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping", "User Research"],
    postedTime: "5 hours ago",
    client: {
      name: "FitLife Startup",
      rating: 4.7,
      reviews: 43,
      location: "Austin, TX",
      verified: true,
      totalSpent: 85000,
      hireRate: 88,
    },
    proposals: 15,
    experienceLevel: "Intermediate",
    projectLength: "1-3 months",
  },
  {
    id: 3,
    title: "Python Data Scientist for Machine Learning Project",
    description: "Seeking an expert data scientist to develop and deploy machine learning models for customer churn prediction. You should have strong experience with Python, scikit-learn, TensorFlow, and data visualization tools.",
    category: "Data Science & Analytics",
    budget: { type: 'hourly', amount: 90, max: 150 },
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "Data Visualization"],
    postedTime: "1 day ago",
    client: {
      name: "DataCorp Analytics",
      rating: 5.0,
      reviews: 89,
      location: "New York, NY",
      verified: true,
      totalSpent: 420000,
      hireRate: 97,
    },
    proposals: 12,
    experienceLevel: "Expert",
    projectLength: "3-6 months",
    isUrgent: true,
    isFeatured: true,
  },
  {
    id: 4,
    title: "Content Writer for Tech Blog - SEO Focused",
    description: "Looking for a skilled content writer to create engaging, SEO-optimized articles about emerging technologies, software development, and digital transformation. Must have excellent research skills and understanding of SEO best practices.",
    category: "Writing & Translation",
    budget: { type: 'hourly', amount: 30, max: 50 },
    skills: ["Content Writing", "SEO", "Research", "Technical Writing", "Copywriting"],
    postedTime: "3 hours ago",
    client: {
      name: "Digital Marketing Pro",
      rating: 4.8,
      reviews: 156,
      location: "London, UK",
      verified: true,
      totalSpent: 125000,
      hireRate: 92,
    },
    proposals: 24,
    experienceLevel: "Intermediate",
    projectLength: "Less than 1 month",
  },
  {
    id: 5,
    title: "Full-Stack Developer - E-commerce Platform",
    description: "Need an experienced full-stack developer to build a custom e-commerce platform from scratch. Tech stack: React, Node.js, PostgreSQL, Stripe integration. Must have experience with payment gateways and e-commerce best practices.",
    category: "Web Development",
    budget: { type: 'fixed', amount: 12000 },
    skills: ["React", "Node.js", "PostgreSQL", "Stripe", "E-commerce", "API Development"],
    postedTime: "6 hours ago",
    client: {
      name: "Online Retail Co",
      rating: 4.6,
      reviews: 67,
      location: "Los Angeles, CA",
      verified: true,
      totalSpent: 180000,
      hireRate: 85,
    },
    proposals: 19,
    experienceLevel: "Expert",
    projectLength: "3-6 months",
  },
  {
    id: 6,
    title: "WordPress Developer for Business Website",
    description: "Looking for a WordPress developer to create a professional business website with custom theme development. Should include blog, contact forms, and SEO optimization.",
    category: "Web Development",
    budget: { type: 'fixed', amount: 2500 },
    skills: ["WordPress", "PHP", "CSS", "JavaScript", "SEO"],
    postedTime: "1 day ago",
    client: {
      name: "Small Business Solutions",
      rating: 4.5,
      reviews: 32,
      location: "Chicago, IL",
      verified: false,
      totalSpent: 45000,
      hireRate: 78,
    },
    proposals: 31,
    experienceLevel: "Entry Level",
    projectLength: "Less than 1 month",
  },
  {
    id: 7,
    title: "Social Media Manager - B2B SaaS Company",
    description: "We need a social media expert to manage our LinkedIn, Twitter, and Facebook presence. Create engaging content, grow followers, and drive engagement. B2B SaaS experience required.",
    category: "Marketing & Sales",
    budget: { type: 'hourly', amount: 35, max: 60 },
    skills: ["Social Media Marketing", "Content Creation", "LinkedIn", "Analytics", "B2B Marketing"],
    postedTime: "4 hours ago",
    client: {
      name: "CloudTech Solutions",
      rating: 4.9,
      reviews: 94,
      location: "Seattle, WA",
      verified: true,
      totalSpent: 210000,
      hireRate: 94,
    },
    proposals: 17,
    experienceLevel: "Intermediate",
    projectLength: "More than 6 months",
  },
  {
    id: 8,
    title: "iOS Developer for Healthcare App",
    description: "Seeking an experienced iOS developer to build a healthcare appointment booking app. Must have experience with HealthKit, HIPAA compliance, and modern iOS development practices using Swift and SwiftUI.",
    category: "Mobile Development",
    budget: { type: 'hourly', amount: 80, max: 130 },
    skills: ["Swift", "SwiftUI", "iOS", "HealthKit", "API Integration", "HIPAA"],
    postedTime: "7 hours ago",
    client: {
      name: "HealthTech Innovations",
      rating: 4.8,
      reviews: 71,
      location: "Boston, MA",
      verified: true,
      totalSpent: 320000,
      hireRate: 91,
    },
    proposals: 9,
    experienceLevel: "Expert",
    projectLength: "3-6 months",
    isUrgent: true,
  },
];

const defaultFilters: JobFiltersState = {
  categories: [],
  budgetRange: { min: 0, max: 0 },
  experienceLevel: [],
  projectLength: [],
  location: [],
  skills: [],
  hourlyRate: { min: 0, max: 0 },
  fixedPrice: { min: 0, max: 0 },
  clientRating: 0,
  paymentVerified: false,
  remote: false,
};

export function EnhancedFindWorkPage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFiltersState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    const newFilters = { ...filters };
    
    switch (type) {
      case 'category':
        newFilters.categories = newFilters.categories.filter(c => c !== value);
        break;
      case 'experience':
        newFilters.experienceLevel = newFilters.experienceLevel.filter(e => e !== value);
        break;
      case 'projectLength':
        newFilters.projectLength = newFilters.projectLength.filter(p => p !== value);
        break;
      case 'location':
        newFilters.location = newFilters.location.filter(l => l !== value);
        break;
      case 'skill':
        newFilters.skills = newFilters.skills.filter(s => s !== value);
        break;
      case 'fixedPrice':
        newFilters.fixedPrice = { min: 0, max: 0 };
        break;
      case 'hourlyRate':
        newFilters.hourlyRate = { min: 0, max: 0 };
        break;
      case 'remote':
        newFilters.remote = false;
        break;
      case 'paymentVerified':
        newFilters.paymentVerified = false;
        break;
    }
    
    setFilters(newFilters);
  };

  // Filter and sort jobs
  let filteredJobs = [...mockJobs];

  // Apply search
  if (searchQuery) {
    filteredJobs = filteredJobs.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Apply filters
  if (filters.categories.length > 0) {
    filteredJobs = filteredJobs.filter(job => filters.categories.includes(job.category));
  }
  if (filters.experienceLevel.length > 0) {
    filteredJobs = filteredJobs.filter(job => filters.experienceLevel.includes(job.experienceLevel));
  }
  if (filters.projectLength.length > 0) {
    filteredJobs = filteredJobs.filter(job => filters.projectLength.includes(job.projectLength));
  }
  if (filters.skills.length > 0) {
    filteredJobs = filteredJobs.filter(job =>
      filters.skills.some(skill => job.skills.includes(skill))
    );
  }
  if (filters.paymentVerified) {
    filteredJobs = filteredJobs.filter(job => job.client.verified);
  }

  // Apply sorting
  filteredJobs.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return a.id - b.id; // Mock: lower ID = newer
      case 'oldest':
        return b.id - a.id;
      case 'budget-high':
        return (b.budget.amount || 0) - (a.budget.amount || 0);
      case 'budget-low':
        return (a.budget.amount || 0) - (b.budget.amount || 0);
      case 'proposals':
        return a.proposals - b.proposals;
      case 'relevance':
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />

      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Work</h1>
          <p className="text-muted-foreground">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for jobs by title, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex border-2"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
            <SavedSearches />
          </div>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full mt-3 border-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Active Filters */}
        <div className="mb-6">
          <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <JobFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  onClearAll={handleClearFilters}
                />
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <div className="space-y-6">
            {/* Sort Options */}
            <SortOptions
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={filteredJobs.length}
            />

            {/* Jobs Grid/List */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredJobs.map(job => (
                  <EnhancedJobCard
                    key={job.id}
                    job={job}
                    onViewDetails={(id) => navigate('job-detail', { jobId: id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
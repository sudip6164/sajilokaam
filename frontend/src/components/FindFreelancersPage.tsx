import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Heart, MessageCircle, ArrowLeft, DollarSign, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { Header } from './Header';
import { freelancersApi } from '@/lib/api';
import { toast } from 'sonner';

const mockFreelancers = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Full-Stack Developer",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 85,
    skills: ["React", "Node.js", "Python", "AWS", "MongoDB"],
    description: "Experienced full-stack developer with 6+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.",
    completedJobs: 89,
    responseTime: "1 hour",
    successRate: "98%",
    featured: true,
    online: true,
    portfolio: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=200&fit=crop"
    ],
    category: "Web Development"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "UI/UX Designer",
    location: "New York, NY",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    reviews: 203,
    hourlyRate: 75,
    skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Design Systems"],
    description: "Creative designer specializing in user-centered design and brand identity. Proven track record of improving user engagement.",
    completedJobs: 156,
    responseTime: "2 hours",
    successRate: "95%",
    featured: true,
    online: false,
    portfolio: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop",
      "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=300&h=200&fit=crop"
    ],
    category: "Design & Creative"
  },
  {
    id: 3,
    name: "Emily Watson",
    title: "Content Writer & SEO Specialist",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5.0,
    reviews: 94,
    hourlyRate: 45,
    skills: ["SEO Writing", "Copywriting", "Content Strategy", "WordPress", "Google Analytics"],
    description: "Professional writer creating engaging content that drives results. Specialized in SEO optimization and conversion copywriting.",
    completedJobs: 78,
    responseTime: "30 min",
    successRate: "100%",
    featured: false,
    online: true,
    portfolio: [
      "https://images.unsplash.com/photo-1486312338219-ce68e2c6f44d?w=300&h=200&fit=crop"
    ],
    category: "Writing & Content"
  },
  {
    id: 4,
    name: "David Kim",
    title: "Digital Marketing Expert",
    location: "Toronto, CA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.7,
    reviews: 156,
    hourlyRate: 65,
    skills: ["Google Ads", "Facebook Ads", "Analytics", "Email Marketing", "Conversion Optimization"],
    description: "Growth-focused marketer with proven track record of increasing ROI. Expert in paid advertising and performance marketing.",
    completedJobs: 112,
    responseTime: "1 hour",
    successRate: "92%",
    featured: false,
    online: true,
    portfolio: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
    ],
    category: "Digital Marketing"
  },
  {
    id: 5,
    name: "Ana Silva",
    title: "Data Scientist",
    location: "São Paulo, Brazil",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    reviews: 67,
    hourlyRate: 55,
    skills: ["Python", "Machine Learning", "Data Visualization", "SQL", "TensorFlow"],
    description: "Data scientist with expertise in machine learning and predictive analytics. Turning complex data into actionable insights.",
    completedJobs: 43,
    responseTime: "3 hours",
    successRate: "96%",
    featured: false,
    online: false,
    portfolio: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop"
    ],
    category: "Data Science"
  },
  {
    id: 6,
    name: "James Thompson",
    title: "Mobile App Developer",
    location: "Melbourne, AU",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    rating: 4.6,
    reviews: 89,
    hourlyRate: 70,
    skills: ["React Native", "Flutter", "iOS", "Android", "Firebase"],
    description: "Mobile app developer specializing in cross-platform solutions. Built 50+ apps with millions of downloads.",
    completedJobs: 67,
    responseTime: "4 hours",
    successRate: "94%",
    featured: false,
    online: true,
    portfolio: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop"
    ],
    category: "Mobile Development"
  }
];

const categories = [
  "All Skills",
  "Web Development",
  "Mobile Development",
  "Design & Creative", 
  "Writing & Content",
  "Digital Marketing",
  "Data Science",
  "DevOps & Cloud"
];

interface Freelancer {
  id: number;
  fullName: string;
  email: string;
  headline?: string;
  overview?: string;
  hourlyRate?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  locationCountry?: string;
  locationCity?: string;
  primarySkills?: string;
  secondarySkills?: string;
  profilePictureUrl?: string;
  experienceYears?: number;
  availability?: string;
  experienceLevel?: string;
}

export function FindFreelancersPage() {
  const { navigate } = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'hourly-rate'>('recommended');
  const [savedFreelancers, setSavedFreelancers] = useState<number[]>([]);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const response = await freelancersApi.list(0, 100);
      setFreelancers(response.content);
    } catch (error: any) {
      console.error('Error fetching freelancers:', error);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveFreelancer = (id: number) => {
    setSavedFreelancers(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // Filter freelancers
  let filteredFreelancers = [...freelancers];

  if (searchQuery) {
    filteredFreelancers = filteredFreelancers.filter(freelancer => {
      const fullName = freelancer.fullName?.toLowerCase() || '';
      const headline = freelancer.headline?.toLowerCase() || '';
      const primarySkills = freelancer.primarySkills?.toLowerCase() || '';
      const secondarySkills = freelancer.secondarySkills?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      return fullName.includes(query) ||
             headline.includes(query) ||
             primarySkills.includes(query) ||
             secondarySkills.includes(query);
    });
  }

  // Sort freelancers
  filteredFreelancers.sort((a, b) => {
    switch (sortBy) {
      case 'hourly-rate':
        return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px] pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading freelancers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Find Freelancers</h1>
          <p className="text-lg text-muted-foreground">Discover talented professionals for your next project</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for freelancers, skills, or services..."
                className="pl-11 h-12 border-2 rounded-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="md:w-auto h-12 border-2 hover:border-primary hover:bg-primary/5">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Skill Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-11 border-2">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="hourly-rate">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] h-11 border-2">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="online">Online Now</SelectItem>
                <SelectItem value="available">Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground font-medium">
            <span className="text-foreground font-semibold">{filteredFreelancers.length}</span> freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
          </p>
          <Select defaultValue="rating">
            <SelectTrigger className="w-[150px] h-10 border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="rate-low">Lowest Rate</SelectItem>
              <SelectItem value="rate-high">Highest Rate</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Freelancer Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredFreelancers.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground text-lg">No freelancers found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredFreelancers.map((freelancer) => {
              const skills = [
                ...(freelancer.primarySkills ? freelancer.primarySkills.split(',').map(s => s.trim()) : []),
                ...(freelancer.secondarySkills ? freelancer.secondarySkills.split(',').map(s => s.trim()) : [])
              ].filter(Boolean);
              
              const location = [freelancer.locationCity, freelancer.locationCountry]
                .filter(Boolean)
                .join(', ') || 'Location not specified';

              return (
            <Card key={freelancer.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      {freelancer.profilePictureUrl ? (
                        <AvatarImage
                          src={freelancer.profilePictureUrl}
                          alt={freelancer.fullName}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {freelancer.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground hover:text-primary cursor-pointer transition-colors">
                          {freelancer.fullName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{freelancer.headline || 'Freelancer'}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{location}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveFreelancer(freelancer.id)}
                        className="hover:bg-red-50"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${savedFreelancers.includes(freelancer.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Rate and Experience */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    {freelancer.experienceYears && (
                      <span className="text-muted-foreground">
                        {freelancer.experienceYears} years exp.
                      </span>
                    )}
                    {freelancer.experienceLevel && (
                      <Badge variant="outline" className="text-xs">
                        {freelancer.experienceLevel}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">
                      {freelancer.hourlyRate 
                        ? `Rs. ${freelancer.hourlyRate}/hr`
                        : freelancer.hourlyRateMin && freelancer.hourlyRateMax
                        ? `Rs. ${freelancer.hourlyRateMin}-${freelancer.hourlyRateMax}/hr`
                        : 'Rate not set'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {freelancer.overview || 'No overview provided yet'}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {skills.length > 0 ? (
                    <>
                      {skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors">
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 5 && (
                        <Badge variant="outline" className="text-xs bg-muted">
                          +{skills.length - 5} more
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>

                {/* Availability */}
                {freelancer.availability && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{freelancer.availability}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-sm"
                    onClick={() => navigate('messages')}
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => navigate('view-freelancer', { freelancerId: freelancer.id })}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
              );
            })
          )}
        </div>

        {/* Load More */}
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="border-2 hover:border-primary hover:bg-primary/5">
            Load More Freelancers
          </Button>
        </div>
      </main>
    </div>
  );
}
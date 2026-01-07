import { useState } from 'react';
import { Search, Filter, MapPin, Star, Heart, MessageCircle, ArrowLeft, DollarSign, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { Header } from './Header';

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

export function FindFreelancersPage() {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'hourly-rate'>('recommended');
  const [savedFreelancers, setSavedFreelancers] = useState<number[]>([]);

  const toggleSaveFreelancer = (id: number) => {
    setSavedFreelancers(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // Filter freelancers
  let filteredFreelancers = [...mockFreelancers];

  if (searchQuery) {
    filteredFreelancers = filteredFreelancers.filter(freelancer =>
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (selectedCategory) {
    filteredFreelancers = filteredFreelancers.filter(f => f.category === selectedCategory);
  }

  if (selectedSkills.length > 0) {
    filteredFreelancers = filteredFreelancers.filter(f =>
      selectedSkills.every(skill => f.skills.includes(skill))
    );
  }

  // Sort freelancers
  filteredFreelancers.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'hourly-rate':
        return a.hourlyRate - b.hourlyRate;
      default:
        return 0;
    }
  });

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
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 bg-card">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={freelancer.avatar}
                        alt={freelancer.name}
                      />
                      <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {freelancer.online && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-success border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-card-foreground hover:text-primary cursor-pointer transition-colors">
                          {freelancer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{freelancer.location}</span>
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
                {/* Rating and Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{freelancer.rating}</span>
                    <span className="text-muted-foreground">({freelancer.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">Rs. {freelancer.hourlyRate}/hr</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {freelancer.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {freelancer.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs bg-muted">
                      +{freelancer.skills.length - 4} more
                    </Badge>
                  )}
                </div>

                {/* Portfolio Preview */}
                {freelancer.portfolio.length > 0 && (
                  <div className="flex gap-2">
                    {freelancer.portfolio.slice(0, 2).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="h-20 w-28 rounded-lg object-cover border-2 border-border hover:border-primary transition-colors cursor-pointer"
                      />
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-xs text-center bg-muted/30 rounded-lg p-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{freelancer.completedJobs}</p>
                    <p className="text-muted-foreground">Jobs Done</p>
                  </div>
                  <div>
                    <p className="font-semibold text-success text-sm">{freelancer.successRate}</p>
                    <p className="text-muted-foreground">Success</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">{freelancer.responseTime}</span>
                    </div>
                    <p className="text-muted-foreground">Response</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-sm"
                    onClick={() => navigate('freelancer-profile', { freelancerId: freelancer.id })}
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => navigate('freelancer-profile', { freelancerId: freelancer.id })}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}</div>

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
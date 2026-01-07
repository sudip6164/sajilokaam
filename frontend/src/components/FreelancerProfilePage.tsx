import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { useRouter } from './Router';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award,
  Briefcase,
  Calendar,
  MessageSquare,
  Heart,
  Share2,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

// Mock freelancer data - in real app, this would come from the router params
const freelancerData = {
  id: 1,
  name: "Sarah Chen",
  title: "Full-Stack Developer",
  location: "San Francisco, CA",
  rating: 4.9,
  reviewCount: 127,
  hourlyRate: 85,
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop",
  skills: ["React", "Node.js", "Python", "TypeScript", "PostgreSQL", "AWS", "Docker", "GraphQL"],
  languages: ["English (Native)", "Mandarin (Fluent)", "Spanish (Conversational)"],
  description: "Experienced full-stack developer with 6+ years building scalable web applications. I specialize in React, Node.js, and cloud architecture. I've helped numerous startups and enterprises build robust, high-performance applications from the ground up.",
  completedJobs: 89,
  responseTime: "1 hour",
  memberSince: "March 2019",
  successRate: "98%",
  totalEarnings: "$250K+",
  availability: "Available 30 hrs/week",
  portfolio: [
    {
      id: 1,
      title: "E-commerce Platform",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop",
      description: "Built a complete e-commerce platform with React and Node.js",
      tech: ["React", "Node.js", "MongoDB"]
    },
    {
      id: 2,
      title: "Healthcare Dashboard",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      description: "Analytics dashboard for healthcare providers",
      tech: ["React", "D3.js", "PostgreSQL"]
    },
    {
      id: 3,
      title: "Mobile Banking App",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
      description: "Secure mobile banking application with real-time features",
      tech: ["React Native", "Firebase", "AWS"]
    }
  ],
  reviewsList: [
    {
      id: 1,
      client: "John Smith",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      date: "2 weeks ago",
      project: "E-commerce Website Development",
      comment: "Sarah is an exceptional developer! She delivered a high-quality product ahead of schedule. Her communication was excellent throughout the project, and she provided valuable insights that improved our final product. Highly recommend!"
    },
    {
      id: 2,
      client: "Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      date: "1 month ago",
      project: "React Dashboard Development",
      comment: "Outstanding work! Sarah understood our requirements perfectly and implemented features beyond our expectations. Will definitely hire again."
    },
    {
      id: 3,
      client: "Michael Brown",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      rating: 4.8,
      date: "2 months ago",
      project: "API Integration",
      comment: "Great developer with strong technical skills. The API integration was completed smoothly and works perfectly."
    }
  ],
  experience: [
    {
      id: 1,
      title: "Senior Full-Stack Developer",
      company: "TechCorp Inc.",
      period: "2020 - Present",
      description: "Leading development of enterprise web applications"
    },
    {
      id: 2,
      title: "Full-Stack Developer",
      company: "StartupX",
      period: "2018 - 2020",
      description: "Built and maintained multiple SaaS products"
    }
  ],
  certifications: [
    "AWS Certified Solutions Architect",
    "React Advanced Certification",
    "Node.js Professional Certification"
  ]
};

export function FreelancerProfilePage() {
  const { navigate, pageParams } = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  
  // In a real app, you'd fetch freelancer data based on pageParams.freelancerId
  const freelancer = freelancerData;

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        {/* Profile Header Card */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl">
                  {freelancer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{freelancer.name}</h1>
                    <p className="text-xl text-muted-foreground mt-1">{freelancer.title}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {freelancer.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{freelancer.rating}</span>
                        <span className="text-sm text-muted-foreground">({freelancer.reviewCount} reviews)</span>
                      </div>
                      <Badge className="bg-success text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Top Rated
                      </Badge>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      onClick={() => navigate('login')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Me
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="text-xl font-bold text-primary">Rs. {freelancer.hourlyRate}/hr</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed Jobs</p>
                    <p className="text-xl font-bold">{freelancer.completedJobs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-xl font-bold text-success">{freelancer.successRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Response Time</p>
                    <p className="text-xl font-bold">{freelancer.responseTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Overview
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Reviews ({freelancer.reviewsList.length})
              </TabsTrigger>
              <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Experience
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>About Me</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {freelancer.description}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Languages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {freelancer.languages.map((lang) => (
                            <div key={lang} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span>{lang}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Member Since</span>
                          <span className="font-semibold">{freelancer.memberSince}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Earned</span>
                          <span className="font-semibold text-success">{freelancer.totalEarnings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Availability</span>
                          <span className="font-semibold">{freelancer.availability}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Certifications</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {freelancer.certifications.map((cert) => (
                          <div key={cert} className="flex items-start gap-2">
                            <Award className="h-4 w-4 text-primary mt-0.5" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancer.portfolio.map((project) => (
                    <Card key={project.id} className="border-2 hover:border-primary/50 hover:shadow-lg transition-all overflow-hidden">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {project.tech.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {freelancer.reviewsList.map((review) => (
                  <Card key={review.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={review.avatar} alt={review.client} />
                          <AvatarFallback>{review.client.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{review.client}</h4>
                              <p className="text-sm text-muted-foreground">{review.project}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-2 font-semibold">{review.rating}</span>
                          </div>
                          <p className="mt-3 text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {freelancer.experience.map((exp) => (
                  <Card key={exp.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{exp.title}</h3>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {exp.period}
                          </div>
                          <p className="mt-3 text-muted-foreground">{exp.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
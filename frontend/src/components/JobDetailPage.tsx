import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { 
  DollarSign, 
  MapPin, 
  Clock, 
  Calendar,
  Briefcase,
  Users,
  FileText,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
  Star
} from 'lucide-react';

// Mock job data - in real app, this would come from the router params
const mockJobData = {
  id: 1,
  title: "Full-Stack Developer Needed for SaaS Platform",
  category: "Web Development",
  posted: "3 days ago",
  budget: {
    type: "Fixed Price",
    amount: 5000,
    range: "$3000 - $5000"
  },
  duration: "3-6 months",
  experienceLevel: "Expert",
  projectType: "Long-term collaboration",
  location: "Remote",
  proposals: 12,
  hires: 3,
  client: {
    name: "TechCorp Solutions",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    rating: 4.8,
    reviews: 45,
    totalSpent: "$50K+",
    hireRate: "95%",
    location: "San Francisco, CA",
    memberSince: "2020"
  },
  description: `We are seeking an experienced full-stack developer to join our team and help build a cutting-edge SaaS platform for the healthcare industry. 

The ideal candidate should have:
- 5+ years of experience with React and Node.js
- Strong understanding of cloud architecture (AWS/Azure)
- Experience with microservices and API design
- Knowledge of healthcare compliance (HIPAA) is a plus

This is a long-term project with potential for ongoing work. We value communication, attention to detail, and the ability to work independently.`,
  
  requirements: [
    "Proficient in React, Node.js, and TypeScript",
    "Experience with PostgreSQL and MongoDB",
    "Strong understanding of RESTful APIs and GraphQL",
    "Familiarity with Docker and Kubernetes",
    "Experience with CI/CD pipelines",
    "Excellent communication skills"
  ],
  
  skills: [
    "React",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "AWS",
    "Docker",
    "GraphQL",
    "REST API"
  ],
  
  deliverables: [
    "Fully functional SaaS platform",
    "Clean, documented code",
    "Unit and integration tests",
    "Deployment pipeline setup",
    "Technical documentation"
  ],
  
  similarJobs: [
    {
      id: 2,
      title: "React Developer for E-commerce Site",
      budget: "$3000 - $4000",
      proposals: 8
    },
    {
      id: 3,
      title: "Node.js Backend Developer",
      budget: "$2500 - $3500",
      proposals: 15
    },
    {
      id: 4,
      title: "Full-Stack Developer for Mobile App",
      budget: "$4000 - $6000",
      proposals: 6
    }
  ]
};

export function JobDetailPage() {
  const { navigate, pageParams } = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  
  // In real app, fetch job data based on pageParams.jobId
  const job = mockJobData;

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3">{job.category}</Badge>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <p className="text-muted-foreground">Posted {job.posted}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{job.budget.range}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.budget.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{job.duration}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Experience</p>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-semibold">{job.experienceLevel}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 flex gap-3">
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    onClick={() => navigate('login')}
                  >
                    Apply Now
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('login')}
                  >
                    Send Proposal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.deliverables.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-primary mb-1">{job.budget.range}</p>
                  <p className="text-sm text-muted-foreground">{job.budget.type}</p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={() => navigate('login')}
                >
                  Submit Proposal
                </Button>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Project Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Proposals</span>
                  <span className="font-semibold">{job.proposals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Viewed</span>
                  <span className="font-semibold">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviewing</span>
                  <span className="font-semibold">3 freelancers</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.client.avatar} alt={job.client.name} />
                    <AvatarFallback>{job.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{job.client.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{job.client.rating}</span>
                      <span className="text-muted-foreground">({job.client.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">{job.client.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Spent</span>
                    <span className="text-sm font-medium text-success">{job.client.totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Hire Rate</span>
                    <span className="text-sm font-medium">{job.client.hireRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm font-medium">{job.client.memberSince}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.similarJobs.map((similar) => (
                  <button
                    key={similar.id}
                    className="w-full text-left p-3 rounded-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    onClick={() => navigate('job-detail', { jobId: similar.id })}
                  >
                    <h4 className="font-semibold text-sm mb-1">{similar.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="text-primary font-medium">{similar.budget}</span>
                      <span>{similar.proposals} proposals</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
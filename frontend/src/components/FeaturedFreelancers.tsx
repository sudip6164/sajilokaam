import { Star, MapPin, Clock, Award } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "./Router";

const freelancers = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Full-Stack Developer",
    location: "San Francisco, CA",
    rating: 4.9,
    reviews: 127,
    hourlyRate: 85,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    skills: ["React", "Node.js", "Python"],
    description: "Experienced developer with 6+ years building scalable web applications.",
    completedJobs: 89,
    responseTime: "1 hour"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    title: "UI/UX Designer",
    location: "New York, NY",
    rating: 4.8,
    reviews: 203,
    hourlyRate: 75,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    skills: ["Figma", "Adobe XD", "Prototyping"],
    description: "Creative designer specializing in user-centered design and brand identity.",
    completedJobs: 156,
    responseTime: "2 hours"
  },
  {
    id: 3,
    name: "Emily Watson",
    title: "Content Writer",
    location: "London, UK",
    rating: 5.0,
    reviews: 94,
    hourlyRate: 45,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    skills: ["SEO Writing", "Copywriting", "Research"],
    description: "Professional writer creating engaging content that drives results.",
    completedJobs: 78,
    responseTime: "30 min"
  },
  {
    id: 4,
    name: "David Kim",
    title: "Digital Marketer",
    location: "Toronto, CA",
    rating: 4.7,
    reviews: 156,
    hourlyRate: 65,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    skills: ["Google Ads", "Facebook Ads", "Analytics"],
    description: "Growth-focused marketer with proven track record of increasing ROI.",
    completedJobs: 112,
    responseTime: "1 hour"
  }
];

export function FeaturedFreelancers() {
  const { navigate } = useRouter();

  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Featured Freelancers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Hire top-rated professionals for your next project
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('find-freelancers')}
            className="hidden md:inline-flex"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {freelancers.map((freelancer) => (
            <div
              key={freelancer.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Avatar and Basic Info */}
              <div className="text-center">
                <Avatar className="mx-auto h-16 w-16 rounded-full object-cover">
                  <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                  <AvatarFallback className="bg-gray-500 text-white">
                    {freelancer.name[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 font-semibold text-card-foreground">{freelancer.name}</h3>
                <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                
                {/* Location */}
                <div className="mt-2 flex items-center justify-center text-xs text-muted-foreground">
                  <MapPin className="mr-1 h-3 w-3" />
                  {freelancer.location}
                </div>

                {/* Rating */}
                <div className="mt-2 flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{freelancer.rating}</span>
                  <span className="text-xs text-muted-foreground">({freelancer.reviews} reviews)</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-4 flex flex-wrap gap-1">
                {freelancer.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                {freelancer.description}
              </p>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <p className="font-medium text-card-foreground">{freelancer.completedJobs}</p>
                  <p className="text-muted-foreground">Projects</p>
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{freelancer.responseTime}</span>
                </div>
              </div>

              {/* Hourly Rate and CTA */}
              <div className="mt-4 space-y-3">
                <div className="text-center">
                  <span className="text-lg font-bold text-primary">Rs. {freelancer.hourlyRate}</span>
                  <span className="text-sm text-muted-foreground">/hour</span>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="sm"
                  onClick={() => navigate('freelancer-profile', { freelancerId: freelancer.id })}
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { freelancersApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  User,
  MapPin,
  DollarSign,
  Clock,
  Code,
  Globe,
  Mail,
  ArrowLeft,
  Briefcase,
  Award
} from 'lucide-react';

interface FreelancerProfile {
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

export function FreelancerPublicProfilePage() {
  const { navigate, pageParams } = useRouter();
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageParams?.freelancerId) {
      fetchFreelancerProfile(pageParams.freelancerId);
    } else {
      toast.error('Freelancer not found');
      navigate('find-freelancers');
    }
  }, [pageParams]);

  const fetchFreelancerProfile = async (freelancerId: number) => {
    try {
      setLoading(true);
      const response = await freelancersApi.list(0, 100);
      const profile = response.content.find(f => f.id === freelancerId);
      
      if (profile) {
        setFreelancer(profile);
      } else {
        toast.error('Freelancer not found');
        navigate('find-freelancers');
      }
    } catch (error: any) {
      console.error('Error fetching freelancer profile:', error);
      toast.error('Failed to load freelancer profile');
      navigate('find-freelancers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px] pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!freelancer) {
    return null;
  }

  const primarySkills = freelancer.primarySkills 
    ? freelancer.primarySkills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const secondarySkills = freelancer.secondarySkills 
    ? freelancer.secondarySkills.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const location = [freelancer.locationCity, freelancer.locationCountry]
    .filter(Boolean)
    .join(', ') || 'Location not specified';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('find-freelancers')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Freelancers
          </Button>

          {/* Profile Header Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-32 w-32">
                  {freelancer.profilePictureUrl ? (
                    <AvatarImage src={freelancer.profilePictureUrl} alt={freelancer.fullName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                      {freelancer.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{freelancer.fullName}</h1>
                  {freelancer.headline && (
                    <p className="text-xl text-muted-foreground mb-4">{freelancer.headline}</p>
                  )}

                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                    {freelancer.experienceYears && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{freelancer.experienceYears} years experience</span>
                      </div>
                    )}
                    {freelancer.experienceLevel && (
                      <Badge variant="outline">
                        {freelancer.experienceLevel}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                    <DollarSign className="h-6 w-6" />
                    {freelancer.hourlyRate 
                      ? `Rs. ${freelancer.hourlyRate}/hr`
                      : freelancer.hourlyRateMin && freelancer.hourlyRateMax
                      ? `Rs. ${freelancer.hourlyRateMin}-${freelancer.hourlyRateMax}/hr`
                      : 'Rate not set'}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary"
                      onClick={() => toast.info('Messaging feature coming soon!')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Freelancer
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => toast.info('Hire feature coming soon!')}
                    >
                      Hire Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {freelancer.overview || 'No overview provided yet'}
                  </p>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {primarySkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Primary Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {primarySkills.map((skill, idx) => (
                          <Badge key={idx} variant="default" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {secondarySkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Secondary Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {secondarySkills.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {primarySkills.length === 0 && secondarySkills.length === 0 && (
                    <p className="text-muted-foreground text-sm">No skills listed yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Availability */}
              {freelancer.availability && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-4 w-4" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{freelancer.availability}</p>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Experience Level</span>
                    <span className="text-sm font-medium">
                      {freelancer.experienceLevel || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Years of Experience</span>
                    <span className="text-sm font-medium">
                      {freelancer.experienceYears ? `${freelancer.experienceYears} years` : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Interested in hiring?</p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.info('Contact feature coming soon!')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

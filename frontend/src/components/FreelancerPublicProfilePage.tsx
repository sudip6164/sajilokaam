import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useRouter } from './Router';
import api from '@/lib/api';
import { toast } from 'sonner';
import { GooglePlayStyleReviews } from './reviews/GooglePlayStyleReviews';
import { projectsApi, reviewsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
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
  ArrowLeft
} from 'lucide-react';

export function FreelancerPublicProfilePage() {
  const { navigate, pageParams } = useRouter();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  
  useEffect(() => {
    if (pageParams?.freelancerId) {
      loadProfile(pageParams.freelancerId);
      if (currentUser) {
        loadCompletedProjects(pageParams.freelancerId);
      }
    } else {
      toast.error('Freelancer not found');
      navigate('find-freelancers');
    }
  }, [pageParams, currentUser]);

  useEffect(() => {
    if (profile?.user?.id || profile?.id) {
      fetchReviewStats();
    }
  }, [profile]);

  const fetchReviewStats = async () => {
    try {
      // Try multiple ways to get user ID: user.id, userId, or profile.id
      const userId = profile?.user?.id || profile?.userId || profile?.id;
      if (!userId) return;
      const reviews = await reviewsApi.listByUser(userId);
      if (Array.isArray(reviews) && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
        setAverageRating(avg);
        setTotalReviews(reviews.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
      setAverageRating(0);
      setTotalReviews(0);
    }
  };

  const loadProfile = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/users/freelancers/${id}`);
      setProfile(response.data);
    } catch (error: any) {
      console.error("Failed to load profile:", error);
      toast.error(error.response?.data?.message || "Failed to load freelancer profile");
      navigate('find-freelancers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompletedProjects = async (freelancerId: number) => {
    try {
      if (!currentUser) return;
      // Get all projects where current user is client and freelancerId is the freelancer
      // Allow any project, not just completed ones, so users can leave reviews
      const projects = await projectsApi.list({ clientId: currentUser.id });
      const relevantProjects = projects.filter((p: any) => p.freelancerId === freelancerId);
      setCompletedProjects(relevantProjects);
    } catch (error) {
      console.error('Error loading completed projects:', error);
      setCompletedProjects([]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const parseSkills = (skills: string) => {
    if (!skills) return [];
    try {
      return JSON.parse(skills);
    } catch {
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  };

  const primarySkills = parseSkills(profile.primarySkills || "");
  const secondarySkills = parseSkills(profile.secondarySkills || "");
  const allSkills = [...primarySkills, ...secondarySkills];
  const languages = profile.languages ? profile.languages.split(',').map((l: string) => l.trim()) : [];

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('find-freelancers')} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Freelancers
        </Button>

        {/* Profile Header Card */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.profilePictureUrl} alt={profile.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl">
                  {profile.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.fullName}</h1>
                    <p className="text-xl text-muted-foreground mt-1">{profile.headline || 'Freelancer'}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ') || 'Location not specified'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                averageRating > 0 && star <= Math.round(averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        {averageRating > 0 ? (
                          <>
                            <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">No ratings yet</span>
                        )}
                      </div>
                      {profile.status === "VERIFIED" && (
                        <Badge className="bg-success text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Top Rated
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      onClick={() => navigate('messages')}
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
                    <p className="text-xl font-bold text-primary">
                      {profile.hourlyRate 
                        ? `Rs. ${profile.hourlyRate}/hr`
                        : profile.hourlyRateMin && profile.hourlyRateMax
                        ? `Rs. ${profile.hourlyRateMin}-${profile.hourlyRateMax}/hr`
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Experience</p>
                    <p className="text-xl font-bold">{profile.experienceYears ? `${profile.experienceYears} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-xl font-bold text-success">{profile.experienceLevel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="text-xl font-bold">{profile.availability ? profile.availability.replace('_', ' ') : 'N/A'}</p>
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
              <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Experience
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Reviews
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
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {profile.overview || 'No overview provided yet.'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {allSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {allSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="px-3 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No skills listed</p>
                        )}
                      </CardContent>
                    </Card>

                    {languages.length > 0 && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Languages</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {languages.map((lang, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>{lang}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {averageRating > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-1.5">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{averageRating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({totalReviews})</span>
                            </div>
                          </div>
                        )}
                        {profile.experienceYears && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Experience</span>
                            <span className="font-semibold">{profile.experienceYears} years</span>
                          </div>
                        )}
                        {profile.experienceLevel && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Level</span>
                            <span className="font-semibold">{profile.experienceLevel}</span>
                          </div>
                        )}
                        {profile.availability && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Availability</span>
                            <span className="font-semibold">{profile.availability.replace('_', ' ')}</span>
                          </div>
                        )}
                        {profile.preferredJobTypes && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Job Types</span>
                            <span className="font-semibold">{profile.preferredJobTypes}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {profile.certifications && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Certifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {profile.certifications.split('\n').filter(Boolean).map((cert: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Award className="h-4 w-4 text-primary mt-0.5" />
                              <span className="text-sm">{cert}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Social Links */}
                    {(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {profile.portfolioUrl && (
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                Portfolio
                              </a>
                            </Button>
                          )}
                          {profile.websiteUrl && (
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                                Website
                              </a>
                            </Button>
                          )}
                          {profile.linkedinUrl && (
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {profile.githubUrl && (
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                                GitHub
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {profile.education && (
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Education</h3>
                          <p className="mt-3 text-muted-foreground whitespace-pre-line">{profile.education}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile.experience && (
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">Work Experience</h3>
                          <p className="mt-3 text-muted-foreground whitespace-pre-line">{profile.experience}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!profile.education && !profile.experience && (
                  <Card className="border-2">
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">No experience information provided yet.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <GooglePlayStyleReviews
                  userId={profile.user?.id || profile.id}
                  userType="freelancer"
                  userName={profile.user?.fullName || profile.fullName || 'Freelancer'}
                  canLeaveReview={currentUser && currentUser.id !== (profile.user?.id || profile.id)}
                  completedProjects={completedProjects}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

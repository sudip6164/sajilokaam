import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useRouter } from './Router';
import { MapPin, Star, Briefcase, Calendar, MessageSquare, Building2, Globe, Mail, Phone, Award } from 'lucide-react';
import { clientsApi, projectsApi, reviewsApi } from '@/lib/api';
import { toast } from 'sonner';
import { GooglePlayStyleReviews } from './reviews/GooglePlayStyleReviews';
import { useAuth } from '@/contexts/AuthContext';

export function ClientPublicProfilePage() {
  const { navigate, pageParams } = useRouter();
  const { user: currentUser } = useAuth();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!pageParams?.clientId) {
          toast.error('Client ID not provided');
          navigate('home');
          return;
        }

        const data = await clientsApi.getById(parseInt(pageParams.clientId));
        console.log('Client profile data:', data);
        console.log('Client profile - id (profile ID):', data.id, 'userId (user ID):', data.userId, 'user.id:', data.user?.id);
        setClient(data);
        
        if (currentUser) {
          loadCompletedProjects(parseInt(pageParams.clientId));
        }
      } catch (error: any) {
        console.error('Error fetching client:', error);
        toast.error('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [pageParams?.clientId, currentUser]);

  useEffect(() => {
    if (client?.user?.id || client?.id) {
      fetchReviewStats();
    }
  }, [client]);

  const fetchReviewStats = async () => {
    try {
      // IMPORTANT: Use user.id, NOT client.id (which is profile ID)
      // If user object is not loaded, try userId field from client profile
      const userId = client?.user?.id || (client as any)?.userId;
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

  const loadCompletedProjects = async (clientId: number) => {
    try {
      if (!currentUser) return;
      // Get all projects where current user is freelancer and clientId is the client
      // Allow any project, not just completed ones, so users can leave reviews
      const projects = await projectsApi.list({ freelancerId: currentUser.id });
      const relevantProjects = projects.filter((p: any) => p.clientId === clientId);
      setCompletedProjects(relevantProjects);
    } catch (error) {
      console.error('Error loading completed projects:', error);
      setCompletedProjects([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Client not found</h2>
            <Button onClick={() => navigate('home')}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const profilePictureUrl = client.profilePicture 
    ? `http://localhost:8080/api/profile/client/picture/${client.profilePicture}`
    : undefined;

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
                <AvatarImage src={profilePictureUrl} alt={client.user?.fullName || 'Client'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl">
                  {(client.user?.fullName || client.companyName || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {client.companyName || client.user?.fullName || 'Client'}
                    </h1>
                    {client.companyName && client.user?.fullName && (
                      <p className="text-xl text-muted-foreground mt-1">{client.user.fullName}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {client.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {client.location}
                        </div>
                      )}
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(averageRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>
                      )}
                      {client.user?.createdAt && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Member since {new Date(client.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
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
                      Contact
                    </Button>
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
              <TabsTrigger value="contact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Contact Info
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Reviews
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="overview" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.bio ? (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {client.bio}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        This client hasn't added a bio yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>Industry</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {client.industry ? (
                        <Badge variant="secondary" className="px-3 py-1">
                          {client.industry}
                        </Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not specified</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>Company Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {client.companySize ? (
                        <p className="text-lg font-semibold">{client.companySize} employees</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not specified</p>
                      )}
                    </CardContent>
                  </Card>

                  {client.preferredPaymentMethod && (
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="px-3 py-1">
                          {client.preferredPaymentMethod}
                        </Badge>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {client.user?.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-sm text-muted-foreground break-all">{client.user.email}</p>
                        </div>
                      </div>
                    )}
                    {client.phoneNumber && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{client.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Website</p>
                          <a 
                            href={client.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {client.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {client.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{client.location}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <GooglePlayStyleReviews
                  userId={client.user?.id || (client as any).userId}
                  userType="client"
                  userName={client.companyName || client.user?.fullName || 'Client'}
                  canLeaveReview={currentUser && currentUser.id !== (client.user?.id || (client as any).userId)}
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

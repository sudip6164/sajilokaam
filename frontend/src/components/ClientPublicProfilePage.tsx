import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { MapPin, Briefcase, Calendar, MessageSquare, Building2, Globe, Mail, Phone } from 'lucide-react';
import { clientsApi } from '@/lib/api';
import { toast } from 'sonner';

export function ClientPublicProfilePage() {
  const { navigate, pageParams } = useRouter();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        if (!pageParams?.clientId) {
          toast.error('Client ID not provided');
          navigate('home');
          return;
        }

        const data = await clientsApi.getById(parseInt(pageParams.clientId));
        setClient(data);
      } catch (error: any) {
        console.error('Error fetching client:', error);
        toast.error('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [pageParams?.clientId]);

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
    <div className="min-h-screen bg-background">
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {client.bio && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {client.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {client.industry && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="px-3 py-1">
                    {client.industry}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm break-all">{client.user.email}</span>
                  </div>
                )}
                {client.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.phoneNumber}</span>
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={client.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {client.website}
                    </a>
                  </div>
                )}
                {client.companySize && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.companySize} employees</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {client.preferredPaymentMethod && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Preferred Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">{client.preferredPaymentMethod}</Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Mail, 
  Globe, 
  Linkedin, 
  Github, 
  CheckCircle,
  Briefcase,
  GraduationCap,
  Award,
  DollarSign,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Header } from './Header';
import { Footer } from './Footer';
import { useRouter } from './Router';
import api from "@/lib/api";
import { toast } from "sonner";

export function FreelancerPublicProfilePage() {
  const { navigate, pageParams } = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pageParams?.freelancerId) {
      loadProfile(pageParams.freelancerId);
    } else {
      toast.error('Freelancer not found');
      navigate('find-freelancers');
    }
  }, [pageParams]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 pt-24">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Freelancer profile not found</p>
                <Button onClick={() => navigate('find-freelancers')}>
                  Browse Freelancers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const parseSkills = (skills: string) => {
    if (!skills) return [];
    try {
      return JSON.parse(skills);
    } catch {
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
  };

  const skills = parseSkills(profile.primarySkills || "");
  const secondarySkills = parseSkills(profile.secondarySkills || "");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('find-freelancers')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Freelancers
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile.profilePictureUrl || ""} alt={profile.fullName} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mb-2">{profile.fullName}</h1>
                  {profile.headline && (
                    <p className="text-muted-foreground mb-4">{profile.headline}</p>
                  )}
                  {profile.status === "VERIFIED" && (
                    <Badge className="mb-4" variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  {profile.hourlyRate && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Rs. {profile.hourlyRate.toLocaleString()}/hr</span>
                    </div>
                  )}
                  {(profile.locationCity || profile.locationCountry) && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {[profile.locationCity, profile.locationCountry]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.experienceYears && (
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{profile.experienceYears} years experience</span>
                    </div>
                  )}
                  {profile.availability && (
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="capitalize">{profile.availability.toLowerCase().replace("_", " ")}</span>
                    </div>
                  )}
                </div>

                {(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.websiteUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        </Button>
                      )}
                      {profile.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-1" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {profile.portfolioUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            Portfolio
                          </a>
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {profile.overview && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{profile.overview}</p>
                </CardContent>
              </Card>
            )}

            {skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {secondarySkills.map((skill: string, idx: number) => (
                      <Badge key={`sec-${idx}`} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{profile.education}</p>
                </CardContent>
              </Card>
            )}

            {profile.certifications && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{profile.certifications}</p>
                </CardContent>
              </Card>
            )}

            {profile.languages && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{profile.languages}</p>
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

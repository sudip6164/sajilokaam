import { useState, useEffect } from "react";
import { 
  Camera,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Star,
  CheckCircle2,
  Upload,
  Plus,
  X,
  ExternalLink,
  Loader2,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  Code,
  Languages,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { profileApi, authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const parseSkills = (skills: string) => {
  if (!skills) return [];
  try {
    return JSON.parse(skills);
  } catch {
    return skills.split(",").map((s) => s.trim()).filter(Boolean);
  }
};

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editData, setEditData] = useState({
    fullName: "",
    overview: "",
    headline: "",
    hourlyRate: "",
    hourlyRateMin: "",
    hourlyRateMax: "",
    locationCity: "",
    locationCountry: "",
    phone: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    primarySkills: "",
    secondarySkills: "",
    languages: "",
    education: "",
    certifications: "",
    experienceYears: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileApi.getFreelancerProfile();
      setProfile(data);
      setEditData({
        fullName: user?.fullName || "",
        overview: data.overview || "",
        headline: data.headline || "",
        hourlyRate: data.hourlyRate?.toString() || "",
        hourlyRateMin: data.hourlyRateMin?.toString() || "",
        hourlyRateMax: data.hourlyRateMax?.toString() || "",
        locationCity: data.locationCity || "",
        locationCountry: data.locationCountry || "",
        phone: "",
        websiteUrl: data.websiteUrl || "",
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        portfolioUrl: data.portfolioUrl || "",
        primarySkills: data.primarySkills || "",
        secondarySkills: data.secondarySkills || "",
        languages: data.languages || "",
        education: data.education || "",
        certifications: data.certifications || "",
        experienceYears: data.experienceYears?.toString() || "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Update name if changed
      if (editData.fullName && editData.fullName !== user?.fullName) {
        await authApi.updateProfile({ fullName: editData.fullName });
      }
      
      await profileApi.updateFreelancerProfile({
        headline: editData.headline || undefined,
        overview: editData.overview || undefined,
        hourlyRate: editData.hourlyRate ? parseFloat(editData.hourlyRate) : undefined,
        hourlyRateMin: editData.hourlyRateMin ? parseFloat(editData.hourlyRateMin) : undefined,
        hourlyRateMax: editData.hourlyRateMax ? parseFloat(editData.hourlyRateMax) : undefined,
        locationCity: editData.locationCity || undefined,
        locationCountry: editData.locationCountry || undefined,
        websiteUrl: editData.websiteUrl || undefined,
        linkedinUrl: editData.linkedinUrl || undefined,
        githubUrl: editData.githubUrl || undefined,
        portfolioUrl: editData.portfolioUrl || undefined,
        primarySkills: editData.primarySkills || undefined,
        secondarySkills: editData.secondarySkills || undefined,
        languages: editData.languages || undefined,
        education: editData.education || undefined,
        certifications: editData.certifications || undefined,
        experienceYears: editData.experienceYears ? parseInt(editData.experienceYears) : undefined,
      });
      
      // Refresh user data to get updated name
      if (editData.fullName && editData.fullName !== user?.fullName) {
        await refreshUser();
      }
      
      await loadProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Failed to load profile</p>
            <Button onClick={loadProfile}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVerified = profile.status === "VERIFIED" || profile.status === "APPROVED";
  const displayName = user?.fullName || "Freelancer";
  const displayEmail = user?.email || "";
  const location = [profile.locationCity, profile.locationCountry].filter(Boolean).join(", ");
  const primarySkills = parseSkills(profile.primarySkills || "");
  const secondarySkills = parseSkills(profile.secondarySkills || "");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="text-muted-foreground">Manage your professional profile</p>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Profile Header */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                    <AvatarFallback className="text-3xl">
                      {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1 border-2 border-background">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">{displayName}</h2>
                {profile.headline && (
                  <p className="text-muted-foreground mb-4">{profile.headline}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {isVerified && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {profile.status === "UNDER_REVIEW" && (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      Under Review
                    </Badge>
                  )}
                  {profile.status === "REJECTED" && (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                      Rejected
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  {location && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {displayEmail && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{displayEmail}</span>
                    </div>
                  )}
                  {profile.hourlyRate && (
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">
                        NPR {profile.hourlyRate.toLocaleString()}/hr
                      </span>
                    </div>
                  )}
                  {profile.experienceYears && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.experienceYears} years experience</span>
                    </div>
                  )}
                  {profile.experienceLevel && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span className="capitalize">{profile.experienceLevel.toLowerCase().replace("_", " ")}</span>
                    </div>
                  )}
                </div>

                {(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.websiteUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.websiteUrl.startsWith('http') ? profile.websiteUrl : `https://${profile.websiteUrl}`} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        </Button>
                      )}
                      {profile.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-1" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-1" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {profile.portfolioUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`} target="_blank" rel="noopener noreferrer">
                            <Sparkles className="h-4 w-4 mr-1" />
                            Portfolio
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview/Bio */}
          {profile.overview && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{profile.overview}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {(primarySkills.length > 0 || secondarySkills.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {primarySkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Primary Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {primarySkills.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {secondarySkills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Secondary Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {secondarySkills.map((skill: string, idx: number) => (
                          <Badge key={`sec-${idx}`} variant="outline" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.education && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{profile.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{profile.certifications}</p>
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile.languages && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{profile.languages}</p>
              </CardContent>
            </Card>
          )}

          {/* Availability & Experience */}
          {(profile.availability || profile.experienceLevel || profile.experienceYears) && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.availability && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Availability: </span>
                      <span className="capitalize">{profile.availability.toLowerCase().replace("_", " ")}</span>
                    </span>
                  </div>
                )}
                {profile.experienceLevel && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Experience Level: </span>
                      <span className="capitalize">{profile.experienceLevel.toLowerCase().replace("_", " ")}</span>
                    </span>
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Years of Experience: </span>
                      <span>{profile.experienceYears}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hourly Rate Range */}
          {(profile.hourlyRateMin || profile.hourlyRateMax) && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {profile.hourlyRateMin && profile.hourlyRateMax ? (
                    <p className="text-lg font-bold text-primary">
                      NPR {profile.hourlyRateMin.toLocaleString()} - {profile.hourlyRateMax.toLocaleString()}/hr
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-primary">
                      {profile.hourlyRateMin ? `NPR ${profile.hourlyRateMin.toLocaleString()}/hr (min)` : `NPR ${profile.hourlyRateMax?.toLocaleString()}/hr (max)`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.profilePictureUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer"} />
                <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const result = await profileApi.uploadProfilePicture(file);
                        toast.success("Profile picture uploaded successfully");
                        await loadProfile();
                      } catch (error: any) {
                        toast.error(error.response?.data?.error || "Failed to upload picture");
                      }
                    }
                  }}
                />
                <Button variant="outline" asChild>
                  <span>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input 
                  id="headline" 
                  value={editData.headline}
                  onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                  placeholder="e.g., Senior Full-Stack Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationCity">City</Label>
                <Input 
                  id="locationCity" 
                  value={editData.locationCity}
                  onChange={(e) => setEditData({ ...editData, locationCity: e.target.value })}
                  placeholder="Kathmandu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationCountry">Country</Label>
                <Input 
                  id="locationCountry" 
                  value={editData.locationCountry}
                  onChange={(e) => setEditData({ ...editData, locationCountry: e.target.value })}
                  placeholder="Nepal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Hourly Rate (NPR)</Label>
                <Input 
                  id="rate" 
                  type="number"
                  value={editData.hourlyRate}
                  onChange={(e) => setEditData({ ...editData, hourlyRate: e.target.value })}
                  placeholder="1500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overview">About Me / Overview</Label>
              <Textarea 
                id="overview" 
                rows={5}
                value={editData.overview}
                onChange={(e) => setEditData({ ...editData, overview: e.target.value })}
                placeholder="Tell us about yourself, your experience, and what you do..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input 
                  id="websiteUrl" 
                  value={editData.websiteUrl}
                  onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input 
                  id="linkedinUrl" 
                  value={editData.linkedinUrl}
                  onChange={(e) => setEditData({ ...editData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <Input 
                  id="githubUrl" 
                  value={editData.githubUrl}
                  onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                <Input 
                  id="portfolioUrl" 
                  value={editData.portfolioUrl}
                  onChange={(e) => setEditData({ ...editData, portfolioUrl: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primarySkills">Primary Skills (comma-separated)</Label>
                <Input 
                  id="primarySkills" 
                  value={editData.primarySkills}
                  onChange={(e) => setEditData({ ...editData, primarySkills: e.target.value })}
                  placeholder="React, Node.js, TypeScript"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondarySkills">Secondary Skills (comma-separated)</Label>
                <Input 
                  id="secondarySkills" 
                  value={editData.secondarySkills}
                  onChange={(e) => setEditData({ ...editData, secondarySkills: e.target.value })}
                  placeholder="Python, Docker, AWS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Textarea 
                id="education" 
                rows={3}
                value={editData.education}
                onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                placeholder="Your educational background..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <Textarea 
                id="certifications" 
                rows={3}
                value={editData.certifications}
                onChange={(e) => setEditData({ ...editData, certifications: e.target.value })}
                placeholder="Your certifications and credentials..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input 
                id="languages" 
                value={editData.languages}
                onChange={(e) => setEditData({ ...editData, languages: e.target.value })}
                placeholder="English, Nepali, Hindi"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

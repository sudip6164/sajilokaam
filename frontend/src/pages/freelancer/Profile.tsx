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
  CheckCircle,
  Upload,
  Plus,
  X,
  ExternalLink,
  Loader2
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
import { profileApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editData, setEditData] = useState({
    bio: "",
    hourlyRate: "",
    location: "",
    phone: "",
    website: "",
    linkedin: "",
    github: "",
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
        bio: data.bio || "",
        hourlyRate: data.hourlyRate?.toString() || "",
        location: data.location || "",
        phone: data.phone || "",
        website: data.website || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
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
      await profileApi.updateFreelancerProfile({
        bio: editData.bio,
        hourlyRate: editData.hourlyRate ? parseFloat(editData.hourlyRate) : undefined,
        location: editData.location,
        phone: editData.phone,
        website: editData.website,
        linkedin: editData.linkedin,
        github: editData.github,
      });
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
        <Button onClick={loadProfile} className="mt-4">Retry</Button>
      </div>
    );
  }

  const isVerified = profile.verificationStatus === "APPROVED";
  const displayName = user?.fullName || "Freelancer";
  const displayEmail = user?.email || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your professional profile</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                <AvatarFallback className="text-3xl">{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground rounded-full p-1">
                  <CheckCircle className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{displayName}</h2>
                {isVerified && (
                  <Badge className="bg-secondary text-secondary-foreground">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.verificationStatus === "UNDER_REVIEW" && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500">
                    Under Review
                  </Badge>
                )}
                {profile.verificationStatus === "REJECTED" && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                    Rejected
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {displayEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {displayEmail}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {profile.website && (
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Globe className="h-4 w-4" />
                    {profile.website}
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">About Me</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Hourly Rate */}
          {profile.hourlyRate && (
            <div className="mt-6 pt-6 border-t flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Hourly Rate</h3>
              </div>
              <p className="text-2xl font-bold text-secondary">NPR {profile.hourlyRate.toLocaleString()}/hr</p>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Edit Profile Modal */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer" />
                <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  placeholder="Kathmandu, Nepal"
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                rows={4}
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={editData.website}
                  onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={editData.linkedin}
                  onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input 
                  id="github" 
                  value={editData.github}
                  onChange={(e) => setEditData({ ...editData, github: e.target.value })}
                />
              </div>
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

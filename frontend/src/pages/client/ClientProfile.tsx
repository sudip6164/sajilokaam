import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Camera,
  Save,
  Bell,
  Lock,
  Shield,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { profileApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ClientProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editData, setEditData] = useState({
    companyName: "",
    companyDescription: "",
    location: "",
    phone: "",
    website: "",
  });

  const [notifications, setNotifications] = useState({
    emailBids: true,
    emailMessages: true,
    emailMilestones: true,
    emailPayments: true,
    pushNotifications: true,
    weeklyDigest: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileApi.getClientProfile();
      setProfile(data);
      setEditData({
        companyName: data.companyName || "",
        companyDescription: data.companyDescription || "",
        location: data.location || "",
        phone: data.phone || "",
        website: data.website || "",
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
      await profileApi.updateClientProfile(editData);
      await loadProfile();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification settings have been updated.",
    });
    setLoading(false);
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
  const displayName = profile.companyName || user?.fullName || "Client";
  const displayEmail = user?.email || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your company profile and account settings
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building className="h-4 w-4" />
            Company Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Avatar Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src="https://i.pravatar.cc/150?img=32" />
                    <AvatarFallback className="text-2xl">{displayName.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground rounded-full p-1">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  )}
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{displayName}</h3>
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
                  <p className="text-muted-foreground">{displayEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editData.companyName}
                    onChange={(e) =>
                      setEditData({ ...editData, companyName: e.target.value })
                    }
                    placeholder="Your Company Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={editData.companyDescription}
                  onChange={(e) =>
                    setEditData({ ...editData, companyDescription: e.target.value })
                  }
                  rows={4}
                  placeholder="Describe your company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    placeholder="Kathmandu, Nepal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={editData.website}
                      onChange={(e) =>
                        setEditData({ ...editData, website: e.target.value })
                      }
                      className="pl-10"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="+977 1-4567890"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "emailBids", label: "New Bids", desc: "Get notified when freelancers bid on your jobs" },
                { key: "emailMessages", label: "Messages", desc: "Receive email for new messages" },
                { key: "emailMilestones", label: "Milestone Updates", desc: "Get notified when milestones are completed" },
                { key: "emailPayments", label: "Payment Reminders", desc: "Receive payment due reminders" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Other Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summary of your projects
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyDigest: checked })
                  }
                />
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading} className="gap-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="gap-2">
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Save,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@sajilokaam.com",
    phone: "+977-9841234567",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newUserAlerts: true,
    verificationAlerts: true,
    paymentAlerts: true,
    systemAlerts: true,
  });

  // Platform Settings
  const [platform, setPlatform] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    autoApproveClients: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and platform settings</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Profile Settings</CardTitle>
            </div>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground text-2xl font-bold">A</span>
              </div>
              <Button variant="outline">Change Photo</Button>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure how you receive alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailNotifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New User Alerts</p>
                <p className="text-sm text-muted-foreground">Alert when new users register</p>
              </div>
              <Switch
                checked={notifications.newUserAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newUserAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Alerts</p>
                <p className="text-sm text-muted-foreground">Alert for pending verifications</p>
              </div>
              <Switch
                checked={notifications.verificationAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, verificationAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Alerts</p>
                <p className="text-sm text-muted-foreground">Alert for payment activities</p>
              </div>
              <Switch
                checked={notifications.paymentAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, paymentAlerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-muted-foreground">Critical system notifications</p>
              </div>
              <Switch
                checked={notifications.systemAlerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, systemAlerts: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Platform Settings</CardTitle>
            </div>
            <CardDescription>Configure platform-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
              </div>
              <Switch
                checked={platform.maintenanceMode}
                onCheckedChange={(checked) =>
                  setPlatform({ ...platform, maintenanceMode: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Registrations</p>
                <p className="text-sm text-muted-foreground">Enable new user registrations</p>
              </div>
              <Switch
                checked={platform.allowRegistrations}
                onCheckedChange={(checked) =>
                  setPlatform({ ...platform, allowRegistrations: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Email Verification</p>
                <p className="text-sm text-muted-foreground">Verify email before activation</p>
              </div>
              <Switch
                checked={platform.requireEmailVerification}
                onCheckedChange={(checked) =>
                  setPlatform({ ...platform, requireEmailVerification: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-approve Clients</p>
                <p className="text-sm text-muted-foreground">Skip manual approval for clients</p>
              </div>
              <Switch
                checked={platform.autoApproveClients}
                onCheckedChange={(checked) =>
                  setPlatform({ ...platform, autoApproveClients: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button variant="outline" className="w-full">Update Password</Button>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Templates</CardTitle>
            </div>
            <CardDescription>Customize automated email templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Welcome Email", description: "Sent to new users upon registration" },
                { name: "Verification Email", description: "Email verification template" },
                { name: "Password Reset", description: "Password reset request template" },
                { name: "Job Posted", description: "Notification for new job postings" },
                { name: "Bid Received", description: "Alert when bid is received" },
                { name: "Payment Received", description: "Payment confirmation template" },
              ].map((template) => (
                <div
                  key={template.name}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  <Button variant="link" className="px-0 mt-2">Edit Template</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

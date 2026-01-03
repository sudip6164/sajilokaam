import { useState } from 'react';
import { Settings, User, Shield, Bell, CreditCard, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useRouter } from './Router';
import { DashboardLayout } from './DashboardLayout';

type Tab = 'profile' | 'security' | 'notifications' | 'billing';

export function AccountSettingsPage() {
  const { user } = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-border bg-muted/30">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'billing' && <BillingTab />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    location: '',
    website: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
            <div>
              <Button type="button" variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
              Save Changes
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Password changed successfully!');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
            Update Password
          </Button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
        <p className="text-muted-foreground mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        <Button variant="outline">
          Enable 2FA
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div>
              <p className="font-medium">Current Session</p>
              <p className="text-sm text-muted-foreground">Chrome on Mac • San Francisco, US</p>
            </div>
            <span className="text-xs text-success flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    emailNewMessages: true,
    emailProjectUpdates: true,
    emailPayments: true,
    emailMarketing: false,
    pushNewMessages: true,
    pushProjectUpdates: false,
  });

  const handleSave = () => {
    alert('Notification preferences saved!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          <NotificationToggle
            label="New Messages"
            description="Receive emails when you get new messages"
            checked={settings.emailNewMessages}
            onChange={(checked) => setSettings({ ...settings, emailNewMessages: checked })}
          />
          <NotificationToggle
            label="Project Updates"
            description="Get notified about project milestones and updates"
            checked={settings.emailProjectUpdates}
            onChange={(checked) => setSettings({ ...settings, emailProjectUpdates: checked })}
          />
          <NotificationToggle
            label="Payments"
            description="Receive notifications about payments and withdrawals"
            checked={settings.emailPayments}
            onChange={(checked) => setSettings({ ...settings, emailPayments: checked })}
          />
          <NotificationToggle
            label="Marketing Emails"
            description="Receive promotional emails and platform updates"
            checked={settings.emailMarketing}
            onChange={(checked) => setSettings({ ...settings, emailMarketing: checked })}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="space-y-4">
          <NotificationToggle
            label="New Messages"
            description="Get push notifications for new messages"
            checked={settings.pushNewMessages}
            onChange={(checked) => setSettings({ ...settings, pushNewMessages: checked })}
          />
          <NotificationToggle
            label="Project Updates"
            description="Push notifications for project updates"
            checked={settings.pushProjectUpdates}
            onChange={(checked) => setSettings({ ...settings, pushProjectUpdates: checked })}
          />
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-secondary">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex-1">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Remove
            </Button>
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          Add Payment Method
        </Button>
      </div>

      {/* Billing History */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Billing History</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Professional Plan</p>
              <p className="text-sm text-muted-foreground">January 3, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$19.00</p>
              <Button variant="ghost" size="sm" className="text-primary">
                Download
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div>
              <p className="font-medium">Professional Plan</p>
              <p className="text-sm text-muted-foreground">December 3, 2025</p>
            </div>
            <div className="text-right">
              <p className="font-medium">$19.00</p>
              <Button variant="ghost" size="sm" className="text-primary">
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
        <div className="p-6 rounded-lg border-2 border-primary bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold">Professional Plan</h4>
              <p className="text-muted-foreground">$19/month</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Next billing date: February 3, 2026
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline" className="text-destructive hover:text-destructive">
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

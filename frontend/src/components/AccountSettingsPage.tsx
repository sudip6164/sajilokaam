import { useState, useEffect } from 'react';
import { Settings, User, Shield, Trash2, Eye, EyeOff, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { validatePassword, validateName } from '@/lib/validation';
import { toast } from 'sonner';
import { Header } from './Header';

type Tab = 'account' | 'security' | 'danger';

export function AccountSettingsPage() {
  const { navigate } = useRouter();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px] pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const isFreelancer = user.roles.some(r => r.name === 'FREELANCER');
  const isClient = user.roles.some(r => r.name === 'CLIENT');
  const isAdmin = user.roles.some(r => r.name === 'ADMIN');

  const tabs = [
    { id: 'account' as Tab, label: 'Account', icon: User },
    { id: 'security' as Tab, label: 'Security', icon: Shield },
    { id: 'danger' as Tab, label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account information and security settings
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
            {activeTab === 'account' && <AccountTab user={user} onUpdate={refreshUser} isFreelancer={isFreelancer} isClient={isClient} isAdmin={isAdmin} navigate={navigate} />}
            {activeTab === 'security' && <SecurityTab user={user} />}
            {activeTab === 'danger' && <DangerZoneTab user={user} navigate={navigate} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ user, onUpdate, isFreelancer, isClient, isAdmin, navigate }: { 
  user: any; 
  onUpdate: () => void;
  isFreelancer: boolean;
  isClient: boolean;
  isAdmin: boolean;
  navigate: (page: string) => void;
}) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
  });
  const [errors, setErrors] = useState<{ fullName?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate name
    const nameValidation = validateName(formData.fullName);
    if (!nameValidation.valid) {
      setErrors({ fullName: nameValidation.error });
      return;
    }

    try {
      setIsSaving(true);
      await authApi.updateProfile({ fullName: formData.fullName });
      await onUpdate();
      toast.success('Account information updated successfully!');
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrors({ fullName: 'Invalid name format' });
      } else {
        toast.error('Failed to update account information. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Account Information */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium mb-2">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                setFormData({ ...formData, fullName: e.target.value });
                if (errors.fullName) {
                  setErrors({ ...errors, fullName: undefined });
                }
              }}
              className={errors.fullName ? 'border-destructive' : ''}
              required
            />
            {errors.fullName && (
              <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-2">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2">Account Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {isAdmin && (
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
                  Admin
                </span>
              )}
              {isFreelancer && (
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                  Freelancer
                </span>
              )}
              {isClient && (
                <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                  Client
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Profile-Specific Settings */}
      <div className="pt-8 border-t border-border">
        <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
        <div className="bg-muted/30 rounded-lg p-6">
          <p className="text-muted-foreground mb-4">
            {isFreelancer && 'Manage your freelancer profile, skills, portfolio, and availability settings.'}
            {isClient && 'Manage your company profile, hiring needs, and preferences.'}
            {isAdmin && 'Admin profile settings are managed separately.'}
          </p>
          {isFreelancer && (
            <Button
              onClick={() => navigate('freelancer-profile')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Edit Freelancer Profile
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
          {isClient && (
            <Button
              onClick={() => navigate('client-profile')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Edit Client Profile
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityTab({ user }: { user: any }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate current password (we'll verify on backend)
    if (!passwordForm.current) {
      setErrors({ current: 'Current password is required' });
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(passwordForm.new);
    if (!passwordValidation.valid) {
      setErrors({ new: passwordValidation.errors[0] || 'Invalid password' });
      return;
    }

    // Validate password match
    if (passwordForm.new !== passwordForm.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }

    try {
      setIsChanging(true);
      await authApi.updateProfile({ 
        currentPassword: passwordForm.current,
        password: passwordForm.new 
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setPasswordStrength(null);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErrors({ new: 'Password must be at least 6 characters' });
      } else if (error.response?.status === 401) {
        setErrors({ current: 'Current password is incorrect' });
      } else {
        toast.error('Failed to change password. Please try again.');
      }
    } finally {
      setIsChanging(false);
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setPasswordForm({ ...passwordForm, new: value });
    if (errors.new) {
      setErrors({ ...errors, new: undefined });
    }
    
    if (value) {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
      if (!validation.valid) {
        setErrors({ ...errors, new: validation.errors[0] });
      }
    } else {
      setPasswordStrength(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div>
            <Label htmlFor="currentPassword" className="text-sm font-medium mb-2">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.current}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, current: e.target.value });
                  if (errors.current) {
                    setErrors({ ...errors, current: undefined });
                  }
                }}
                className={`pr-10 ${errors.current ? 'border-destructive' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.current && (
              <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.current}</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium mb-2">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.new}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                className={`pr-10 ${errors.new ? 'border-destructive' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.new && (
              <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.new}</span>
              </div>
            )}
            {passwordForm.new && !errors.new && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength === 'weak' ? 'bg-destructive w-1/3' :
                        passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                        'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-destructive' :
                    passwordStrength === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {passwordStrength === 'weak' ? 'Weak' :
                     passwordStrength === 'medium' ? 'Medium' :
                     'Strong'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use 8+ characters with a mix of letters, numbers, and symbols
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium mb-2">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirm}
                onChange={(e) => {
                  setPasswordForm({ ...passwordForm, confirm: e.target.value });
                  if (errors.confirm) {
                    setErrors({ ...errors, confirm: undefined });
                  }
                  // Check match
                  if (e.target.value && e.target.value !== passwordForm.new) {
                    setErrors({ ...errors, confirm: 'Passwords do not match' });
                  } else if (e.target.value && e.target.value === passwordForm.new) {
                    setErrors({ ...errors, confirm: undefined });
                  }
                }}
                className={`pr-10 ${errors.confirm ? 'border-destructive' : passwordForm.confirm && passwordForm.new === passwordForm.confirm ? 'border-green-500' : ''}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirm && (
              <div className="flex items-center gap-1 mt-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.confirm}</span>
              </div>
            )}
            {passwordForm.confirm && !errors.confirm && passwordForm.new === passwordForm.confirm && (
              <div className="flex items-center gap-1 mt-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Passwords match</span>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-secondary"
            disabled={isChanging}
          >
            {isChanging ? 'Changing Password...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function DangerZoneTab({ user, navigate }: { user: any; navigate: (page: string) => void }) {
  const { logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      await authApi.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('home');
    } catch (error: any) {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-destructive/20 rounded-full">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-destructive mb-2">Delete Account</h3>
            <p className="text-muted-foreground mb-4">
              Once you delete your account, there is no going back. This will permanently delete your account,
              profile, and all associated data. This action cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete My Account
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="deleteConfirm" className="text-sm font-medium mb-2 text-destructive">
                    Type <strong>DELETE</strong> to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="max-w-md"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete Account'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

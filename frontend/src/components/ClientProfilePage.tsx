import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Building2,
  MapPin,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Globe,
  Users,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react';

interface ClientProfileData {
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  description: string;
  locationCountry: string;
  locationCity: string;
  timezone: string;
  hiringNeeds: string;
  averageBudgetMin: string;
  averageBudgetMax: string;
  preferredContractType: string;
  languages: string;
}

const companySizes = [
  'Just me',
  '2-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Consulting',
  'Marketing & Advertising',
  'Media & Entertainment',
  'Non-profit',
  'Other'
];

const timezones = [
  'UTC',
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT)',
  'Europe/Paris (CET)',
  'Asia/Dubai (GST)',
  'Asia/Kolkata (IST)',
  'Asia/Shanghai (CST)',
  'Asia/Tokyo (JST)',
  'Australia/Sydney (AEDT)'
];

const contractTypes = [
  'Fixed Price',
  'Hourly',
  'Both'
];

export function ClientProfilePage() {
  const { navigate } = useRouter();
  const { isAuthenticated, hasRole, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ClientProfileData>({
    companyName: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
    description: '',
    locationCountry: '',
    locationCity: '',
    timezone: '',
    hiringNeeds: '',
    averageBudgetMin: '',
    averageBudgetMax: '',
    preferredContractType: '',
    languages: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Company Info', icon: Building2 },
    { number: 2, title: 'Location', icon: MapPin },
    { number: 3, title: 'Hiring Preferences', icon: Briefcase },
    { number: 4, title: 'Review', icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!isAuthenticated || !hasRole('CLIENT')) {
      toast.error('Please login as a client to complete your profile');
      navigate('login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, hasRole]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileApi.getClientProfile();
      if (profile) {
        setProfileData({
          companyName: profile.companyName || '',
          companyWebsite: profile.companyWebsite || '',
          companySize: profile.companySize || '',
          industry: profile.industry || '',
          description: profile.description || '',
          locationCountry: profile.locationCountry || '',
          locationCity: profile.locationCity || '',
          timezone: profile.timezone || '',
          hiringNeeds: profile.hiringNeeds || '',
          averageBudgetMin: profile.averageBudgetMin?.toString() || '',
          averageBudgetMax: profile.averageBudgetMax?.toString() || '',
          preferredContractType: profile.preferredContractType || '',
          languages: profile.languages || '',
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      // Profile might not exist yet, that's okay
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!profileData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (profileData.companyWebsite && !isValidUrl(profileData.companyWebsite)) {
        newErrors.companyWebsite = 'Please enter a valid URL';
      }
      if (!profileData.companySize) {
        newErrors.companySize = 'Company size is required';
      }
      if (!profileData.industry) {
        newErrors.industry = 'Industry is required';
      }
      if (!profileData.description.trim()) {
        newErrors.description = 'Company description is required';
      }
    } else if (step === 2) {
      if (!profileData.locationCountry.trim()) {
        newErrors.locationCountry = 'Country is required';
      }
      if (!profileData.locationCity.trim()) {
        newErrors.locationCity = 'City is required';
      }
      if (!profileData.timezone) {
        newErrors.timezone = 'Timezone is required';
      }
    } else if (step === 3) {
      if (!profileData.hiringNeeds.trim()) {
        newErrors.hiringNeeds = 'Hiring needs description is required';
      }
      if (profileData.averageBudgetMin && parseFloat(profileData.averageBudgetMin) < 0) {
        newErrors.averageBudgetMin = 'Budget must be positive';
      }
      if (profileData.averageBudgetMax && parseFloat(profileData.averageBudgetMax) < 0) {
        newErrors.averageBudgetMax = 'Budget must be positive';
      }
      if (profileData.averageBudgetMin && profileData.averageBudgetMax &&
          parseFloat(profileData.averageBudgetMin) >= parseFloat(profileData.averageBudgetMax)) {
        newErrors.averageBudgetMax = 'Maximum budget must be greater than minimum';
      }
      if (!profileData.preferredContractType) {
        newErrors.preferredContractType = 'Preferred contract type is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        companyName: profileData.companyName.trim(),
        companySize: profileData.companySize,
        industry: profileData.industry,
        description: profileData.description.trim(),
        locationCountry: profileData.locationCountry.trim(),
        locationCity: profileData.locationCity.trim(),
        timezone: profileData.timezone,
        hiringNeeds: profileData.hiringNeeds.trim(),
        preferredContractType: profileData.preferredContractType,
      };

      if (profileData.companyWebsite.trim()) {
        payload.companyWebsite = profileData.companyWebsite.trim().startsWith('http')
          ? profileData.companyWebsite.trim()
          : `https://${profileData.companyWebsite.trim()}`;
      }

      if (profileData.averageBudgetMin) {
        payload.averageBudgetMin = parseFloat(profileData.averageBudgetMin);
      }
      if (profileData.averageBudgetMax) {
        payload.averageBudgetMax = parseFloat(profileData.averageBudgetMax);
      }

      if (profileData.languages.trim()) {
        payload.languages = profileData.languages.trim();
      }

      await profileApi.updateClientProfile(payload);
      // Refresh user data to update name in header
      await refreshUser();
      toast.success('Profile saved successfully!');
      
      // If on last step, redirect to dashboard
      if (currentStep === steps.length) {
        navigate('client-dashboard');
      } else {
        handleNext();
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateProgress = () => {
    const totalFields = 13;
    const filledFields = Object.values(profileData).filter(v => v && v.toString().trim()).length;
    return (filledFields / totalFields) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-8 text-center">
              <p>Loading profile...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <Header />
      <div className="flex-1 w-full px-4 md:px-8 lg:px-12 py-8 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Complete Your Client Profile</h1>
            <p className="text-muted-foreground text-lg">
              Help freelancers understand your business and hiring needs
            </p>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex flex-col items-center">
                    <div 
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep >= step.number 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'bg-background border-muted-foreground text-muted-foreground'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium hidden md:block ${
                      currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Steps */}
          <Card className="border-2">
            <CardContent className="p-8">
              {/* Step 1: Company Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Company Information</h2>
                    <p className="text-muted-foreground">Tell us about your company</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName" className="text-base">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., Acme Corporation"
                        value={profileData.companyName}
                        onChange={(e) => {
                          setProfileData({ ...profileData, companyName: e.target.value });
                          setErrors({ ...errors, companyName: '' });
                        }}
                        className="mt-2"
                      />
                      {errors.companyName && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyWebsite" className="text-base">Company Website</Label>
                      <div className="relative mt-2">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyWebsite"
                          placeholder="www.example.com"
                          value={profileData.companyWebsite}
                          onChange={(e) => {
                            setProfileData({ ...profileData, companyWebsite: e.target.value });
                            setErrors({ ...errors, companyWebsite: '' });
                          }}
                          className="pl-9"
                        />
                      </div>
                      {errors.companyWebsite && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.companyWebsite}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companySize" className="text-base">Company Size *</Label>
                        <Select 
                          value={profileData.companySize} 
                          onValueChange={(value) => {
                            setProfileData({ ...profileData, companySize: value });
                            setErrors({ ...errors, companySize: '' });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.companySize && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.companySize}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="industry" className="text-base">Industry *</Label>
                        <Select 
                          value={profileData.industry} 
                          onValueChange={(value) => {
                            setProfileData({ ...profileData, industry: value });
                            setErrors({ ...errors, industry: '' });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map((ind) => (
                              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.industry && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.industry}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-base">Company Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your company, what you do, and your mission..."
                        value={profileData.description}
                        onChange={(e) => {
                          setProfileData({ ...profileData, description: e.target.value });
                          setErrors({ ...errors, description: '' });
                        }}
                        className="mt-2 min-h-[150px]"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {profileData.description.length} characters
                      </p>
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Location & Timezone</h2>
                    <p className="text-muted-foreground">Where is your company located?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="locationCountry" className="text-base">Country *</Label>
                        <Input
                          id="locationCountry"
                          placeholder="e.g., United States"
                          value={profileData.locationCountry}
                          onChange={(e) => {
                            setProfileData({ ...profileData, locationCountry: e.target.value });
                            setErrors({ ...errors, locationCountry: '' });
                          }}
                          className="mt-2"
                        />
                        {errors.locationCountry && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.locationCountry}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="locationCity" className="text-base">City *</Label>
                        <Input
                          id="locationCity"
                          placeholder="e.g., New York"
                          value={profileData.locationCity}
                          onChange={(e) => {
                            setProfileData({ ...profileData, locationCity: e.target.value });
                            setErrors({ ...errors, locationCity: '' });
                          }}
                          className="mt-2"
                        />
                        {errors.locationCity && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.locationCity}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timezone" className="text-base">Timezone *</Label>
                      <Select 
                        value={profileData.timezone} 
                        onValueChange={(value) => {
                          setProfileData({ ...profileData, timezone: value });
                          setErrors({ ...errors, timezone: '' });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.timezone && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.timezone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Hiring Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Hiring Preferences</h2>
                    <p className="text-muted-foreground">Tell us about your hiring needs</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="hiringNeeds" className="text-base">Hiring Needs *</Label>
                      <Textarea
                        id="hiringNeeds"
                        placeholder="Describe the types of projects you typically hire for, skills you look for, etc..."
                        value={profileData.hiringNeeds}
                        onChange={(e) => {
                          setProfileData({ ...profileData, hiringNeeds: e.target.value });
                          setErrors({ ...errors, hiringNeeds: '' });
                        }}
                        className="mt-2 min-h-[120px]"
                      />
                      {errors.hiringNeeds && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.hiringNeeds}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="averageBudgetMin" className="text-base">Average Budget Min (USD)</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="averageBudgetMin"
                            type="number"
                            placeholder="1000"
                            value={profileData.averageBudgetMin}
                            onChange={(e) => {
                              setProfileData({ ...profileData, averageBudgetMin: e.target.value });
                              setErrors({ ...errors, averageBudgetMin: '', averageBudgetMax: '' });
                            }}
                            className="pl-9"
                          />
                        </div>
                        {errors.averageBudgetMin && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.averageBudgetMin}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="averageBudgetMax" className="text-base">Average Budget Max (USD)</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="averageBudgetMax"
                            type="number"
                            placeholder="10000"
                            value={profileData.averageBudgetMax}
                            onChange={(e) => {
                              setProfileData({ ...profileData, averageBudgetMax: e.target.value });
                              setErrors({ ...errors, averageBudgetMax: '' });
                            }}
                            className="pl-9"
                          />
                        </div>
                        {errors.averageBudgetMax && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.averageBudgetMax}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="preferredContractType" className="text-base">Preferred Contract Type *</Label>
                      <Select 
                        value={profileData.preferredContractType} 
                        onValueChange={(value) => {
                          setProfileData({ ...profileData, preferredContractType: value });
                          setErrors({ ...errors, preferredContractType: '' });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.preferredContractType && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.preferredContractType}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="languages" className="text-base">Languages</Label>
                      <Input
                        id="languages"
                        placeholder="e.g., English, Spanish, French"
                        value={profileData.languages}
                        onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        List languages your team speaks (comma-separated)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Review Your Profile</h2>
                    <p className="text-muted-foreground">Make sure everything looks good</p>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Company Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Company Name</p>
                            <p className="font-medium">{profileData.companyName || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Company Size</p>
                            <p className="font-medium">{profileData.companySize || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Industry</p>
                            <p className="font-medium">{profileData.industry || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Website</p>
                            <p className="font-medium">{profileData.companyWebsite || 'Not provided'}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium whitespace-pre-wrap">{profileData.description || 'Not provided'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Location
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Country</p>
                            <p className="font-medium">{profileData.locationCountry || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">City</p>
                            <p className="font-medium">{profileData.locationCity || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Timezone</p>
                            <p className="font-medium">{profileData.timezone || 'Not provided'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Hiring Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Hiring Needs</p>
                          <p className="font-medium whitespace-pre-wrap">{profileData.hiringNeeds || 'Not provided'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Budget Range</p>
                            <p className="font-medium">
                              {profileData.averageBudgetMin && profileData.averageBudgetMax
                                ? `$${parseFloat(profileData.averageBudgetMin).toLocaleString()} - $${parseFloat(profileData.averageBudgetMax).toLocaleString()}`
                                : profileData.averageBudgetMin
                                ? `$${parseFloat(profileData.averageBudgetMin).toLocaleString()}+`
                                : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Contract Type</p>
                            <p className="font-medium">{profileData.preferredContractType || 'Not provided'}</p>
                          </div>
                          {profileData.languages && (
                            <div>
                              <p className="text-sm text-muted-foreground">Languages</p>
                              <p className="font-medium">{profileData.languages}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-primary to-secondary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Complete Profile'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}


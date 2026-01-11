import { useState, useEffect, useRef } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi, authApi, jobSkillsApi } from '@/lib/api';
import { validateName } from '@/lib/validation';
import { toast } from 'sonner';
import { 
  User,
  MapPin,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Globe,
  DollarSign,
  FileText,
  Clock,
  Award,
  Code,
  Camera,
  X,
  Plus,
  MessageSquare,
  Heart,
  Share2,
  Star
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface FreelancerProfileData {
  // Personal Account Info
  fullName: string;
  email: string;
  profilePictureUrl?: string;
  // Freelancer Profile Info
  headline: string;
  overview: string;
  hourlyRate: string;
  hourlyRateMin: string;
  hourlyRateMax: string;
  locationCity: string;
  locationCountry: string;
  timezone: string;
  primarySkills: string[];
  secondarySkills: string[];
  languages: string;
  education: string;
  certifications: string;
  portfolioUrl: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  experience: string;
  availability: string;
  preferredJobTypes: string;
  preferredContractTypes: string;
}

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
  'Asia/Kathmandu (NPT)',
  'Asia/Shanghai (CST)',
  'Asia/Tokyo (JST)',
  'Australia/Sydney (AEDT)'
];

const availabilityOptions = [
  'Full-time (40+ hrs/week)',
  'Part-time (20-40 hrs/week)',
  'Flexible (10-20 hrs/week)',
  'As needed (<10 hrs/week)'
];

const contractTypes = [
  'Fixed Price',
  'Hourly',
  'Both'
];

const jobTypes = [
  'One-time projects',
  'Ongoing projects',
  'Both'
];

export function FreelancerProfilePage() {
  const { navigate } = useRouter();
  const { isAuthenticated, hasRole, refreshUser, user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: number; name: string }>>([]);
  const [primarySkillInput, setPrimarySkillInput] = useState('');
  const [secondarySkillInput, setSecondarySkillInput] = useState('');
  const [profileData, setProfileData] = useState<FreelancerProfileData>({
    fullName: '',
    email: '',
    profilePictureUrl: '',
    headline: '',
    overview: '',
    hourlyRate: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    locationCity: '',
    locationCountry: '',
    timezone: '',
    primarySkills: [],
    secondarySkills: [],
    languages: '',
    education: '',
    certifications: '',
    portfolioUrl: '',
    websiteUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    experience: '',
    availability: '',
    preferredJobTypes: '',
    preferredContractTypes: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FreelancerProfileData, string>>>({});

  const totalSteps = 5;
  const progress = Math.min((currentStep / totalSteps) * 100, 100);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    if (!hasRole('FREELANCER')) {
      toast.error('Only freelancers can access this page');
      navigate('home');
      return;
    }

    fetchProfile();
    fetchSkills();
  }, [isAuthenticated]);

  const fetchSkills = async () => {
    try {
      const data = await jobSkillsApi.list();
      setAvailableSkills(data);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Get personal account info
      const personalInfo = {
        fullName: user?.fullName || '',
        email: user?.email || '',
      };
      
      // Get freelancer profile info
      const profile = await profileApi.getFreelancerProfile();
      let isProfileIncomplete = false;
      
      if (profile && profile.headline) {
        setProfileData({
          ...personalInfo,
          profilePictureUrl: profile.profilePictureUrl || '',
          headline: profile.headline || '',
          overview: profile.overview || '',
          hourlyRate: profile.hourlyRate?.toString() || '',
          hourlyRateMin: profile.hourlyRateMin?.toString() || '',
          hourlyRateMax: profile.hourlyRateMax?.toString() || '',
          locationCity: profile.locationCity || '',
          locationCountry: profile.locationCountry || '',
          timezone: profile.timezone || '',
          primarySkills: profile.primarySkills ? profile.primarySkills.split(',').map(s => s.trim()) : [],
          secondarySkills: profile.secondarySkills ? profile.secondarySkills.split(',').map(s => s.trim()) : [],
          languages: profile.languages || '',
          education: profile.education || '',
          certifications: profile.certifications || '',
          portfolioUrl: profile.portfolioUrl || '',
          websiteUrl: profile.websiteUrl || '',
          linkedinUrl: profile.linkedinUrl || '',
          githubUrl: profile.githubUrl || '',
          experience: profile.experience || '',
          availability: profile.availability || '',
          preferredJobTypes: profile.preferredJobTypes || '',
          preferredContractTypes: profile.preferredContractTypes || ''
        });
      } else {
        // No profile yet, use defaults
        isProfileIncomplete = true;
        setProfileData({
          ...personalInfo,
          profilePictureUrl: '',
          headline: '',
          overview: '',
          hourlyRate: '',
          hourlyRateMin: '',
          hourlyRateMax: '',
          locationCity: '',
          locationCountry: '',
          timezone: '',
          primarySkills: [],
          secondarySkills: [],
          languages: '',
          education: '',
          certifications: '',
          portfolioUrl: '',
          websiteUrl: '',
          linkedinUrl: '',
          githubUrl: '',
          experience: '',
          availability: '',
          preferredJobTypes: '',
          preferredContractTypes: ''
        });
      }
      
      // Auto-enter edit mode if profile is incomplete
      setIsEditMode(isProfileIncomplete);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        // No profile yet, use defaults
        toast.info('Please complete your profile to start working');
      } else {
        toast.error('Failed to load profile. Please try again.');
      }
      // Show edit mode if profile fetch failed
      setIsEditMode(true);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof FreelancerProfileData>(field: K, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPicture(true);
      const response = await profileApi.uploadProfilePicture(file);
      setProfileData(prev => ({ ...prev, profilePictureUrl: response.url }));
      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const addPrimarySkill = () => {
    if (!primarySkillInput.trim()) return;
    if (profileData.primarySkills.includes(primarySkillInput.trim())) {
      toast.error('Skill already added');
      return;
    }
    setProfileData(prev => ({
      ...prev,
      primarySkills: [...prev.primarySkills, primarySkillInput.trim()]
    }));
    setPrimarySkillInput('');
  };

  const removePrimarySkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.filter(s => s !== skill)
    }));
  };

  const addSecondarySkill = () => {
    if (!secondarySkillInput.trim()) return;
    if (profileData.secondarySkills.includes(secondarySkillInput.trim())) {
      toast.error('Skill already added');
      return;
    }
    setProfileData(prev => ({
      ...prev,
      secondarySkills: [...prev.secondarySkills, secondarySkillInput.trim()]
    }));
    setSecondarySkillInput('');
  };

  const removeSecondarySkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      secondarySkills: prev.secondarySkills.filter(s => s !== skill)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FreelancerProfileData, string>> = {};

    if (step === 1) {
      // Basic info validation
      if (!profileData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      } else {
        const nameValidation = validateName(profileData.fullName);
        if (!nameValidation.valid) {
          newErrors.fullName = nameValidation.error;
        }
      }
      if (!profileData.headline.trim()) {
        newErrors.headline = 'Professional headline is required';
      }
    } else if (step === 2) {
      // Rate validation
      if (profileData.hourlyRate && parseFloat(profileData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Rate must be greater than 0';
      }
      if (profileData.hourlyRateMin && parseFloat(profileData.hourlyRateMin) <= 0) {
        newErrors.hourlyRateMin = 'Minimum rate must be greater than 0';
      }
      if (profileData.hourlyRateMax && parseFloat(profileData.hourlyRateMax) <= 0) {
        newErrors.hourlyRateMax = 'Maximum rate must be greater than 0';
      }
      if (profileData.hourlyRateMin && profileData.hourlyRateMax && 
          parseFloat(profileData.hourlyRateMin) > parseFloat(profileData.hourlyRateMax)) {
        newErrors.hourlyRateMax = 'Maximum rate must be greater than minimum';
      }
    } else if (step === 3) {
      // Skills validation
      if (profileData.primarySkills.length === 0) {
        newErrors.primarySkills = 'At least one primary skill is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setSaving(true);
      
      // Save personal account info (fullName) if on step 1 or if it changed
      if (currentStep === 1 || profileData.fullName !== user?.fullName) {
        await authApi.updateProfile({ fullName: profileData.fullName.trim() });
        await refreshUser(); // Refresh to update header
      }
      
      // Save freelancer profile info (skip if on step 1)
      if (currentStep !== 1) {
        const payload: any = {};

        // Only include non-empty fields
        if (profileData.headline.trim()) {
          payload.headline = profileData.headline.trim();
        }
        if (profileData.overview.trim()) {
          payload.overview = profileData.overview.trim();
        }
        if (profileData.hourlyRate) {
          payload.hourlyRate = parseFloat(profileData.hourlyRate);
        }
        if (profileData.hourlyRateMin) {
          payload.hourlyRateMin = parseFloat(profileData.hourlyRateMin);
        }
        if (profileData.hourlyRateMax) {
          payload.hourlyRateMax = parseFloat(profileData.hourlyRateMax);
        }
        if (profileData.locationCity.trim()) {
          payload.locationCity = profileData.locationCity.trim();
        }
        if (profileData.locationCountry.trim()) {
          payload.locationCountry = profileData.locationCountry.trim();
        }
        if (profileData.timezone) {
          payload.timezone = profileData.timezone;
        }
        if (profileData.primarySkills.length > 0) {
          payload.primarySkills = profileData.primarySkills.join(', ');
        }
        if (profileData.secondarySkills.length > 0) {
          payload.secondarySkills = profileData.secondarySkills.join(', ');
        }
        if (profileData.languages.trim()) {
          payload.languages = profileData.languages.trim();
        }
        if (profileData.education.trim()) {
          payload.education = profileData.education.trim();
        }
        if (profileData.certifications.trim()) {
          payload.certifications = profileData.certifications.trim();
        }
        if (profileData.portfolioUrl.trim()) {
          payload.portfolioUrl = profileData.portfolioUrl.trim();
        }
        if (profileData.websiteUrl.trim()) {
          payload.websiteUrl = profileData.websiteUrl.trim();
        }
        if (profileData.linkedinUrl.trim()) {
          payload.linkedinUrl = profileData.linkedinUrl.trim();
        }
        if (profileData.githubUrl.trim()) {
          payload.githubUrl = profileData.githubUrl.trim();
        }
        if (profileData.experience.trim()) {
          payload.experience = profileData.experience.trim();
        }
        if (profileData.availability) {
          payload.availability = profileData.availability;
        }
        if (profileData.preferredJobTypes) {
          payload.preferredJobTypes = profileData.preferredJobTypes;
        }
        if (profileData.preferredContractTypes) {
          payload.preferredContractTypes = profileData.preferredContractTypes;
        }

        await profileApi.updateFreelancerProfile(payload);
      }
      
      toast.success('Profile saved successfully!');
      
      // If on last step, redirect to dashboard
      if (currentStep === totalSteps) {
        setTimeout(() => {
          setIsEditMode(false);
          navigate('freelancer-dashboard');
        }, 1000);
      } else {
        // Exit edit mode after saving intermediate steps
        setIsEditMode(false);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[400px] pt-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto pt-24 px-4 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Profile' : 'Freelancer Profile'}</h1>
                <p className="text-muted-foreground">
                  {isEditMode ? 'Update your freelance profile' : (profileData.headline || 'Your Freelance Profile')}
                </p>
              </div>
            </div>
            {!isEditMode && (
              <Button onClick={() => setIsEditMode(true)} size="lg">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="mb-8">
            {/* Progress Bar */}
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {!isEditMode && (
          <div className="space-y-6">
            {/* Profile View Mode - Beautiful Tabbed Design */}
            {/* Profile Header Card */}
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Avatar */}
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.profilePictureUrl} alt={profileData.fullName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl">
                      {profileData.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-bold">{profileData.fullName}</h2>
                        <p className="text-xl text-muted-foreground mt-1">{profileData.headline || 'Freelancer'}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {[profileData.locationCity, profileData.locationCountry].filter(Boolean).join(', ') || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Hourly Rate</p>
                        <p className="text-xl font-bold text-primary">
                          {profileData.hourlyRate 
                            ? `Rs. ${profileData.hourlyRate}/hr`
                            : profileData.hourlyRateMin && profileData.hourlyRateMax
                            ? `Rs. ${profileData.hourlyRateMin}-${profileData.hourlyRateMax}/hr`
                            : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Job Types</p>
                        <p className="text-xl font-bold">{profileData.preferredJobTypes || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contract Types</p>
                        <p className="text-xl font-bold text-success">{profileData.preferredContractTypes || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Availability</p>
                        <p className="text-xl font-bold">{profileData.availability || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="experience" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Experience
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>About Me</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {profileData.overview || 'No overview provided yet.'}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {profileData.primarySkills.length > 0 || profileData.secondarySkills.length > 0 ? (
                            <div className="space-y-4">
                              {profileData.primarySkills.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Primary Skills</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {profileData.primarySkills.map((skill, idx) => (
                                      <Badge key={idx} variant="default" className="px-3 py-1">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {profileData.secondarySkills.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Secondary Skills</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {profileData.secondarySkills.map((skill, idx) => (
                                      <Badge key={idx} variant="secondary" className="px-3 py-1">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No skills listed</p>
                          )}
                        </CardContent>
                      </Card>

                      {profileData.languages && (
                        <Card className="border-2">
                          <CardHeader>
                            <CardTitle>Languages</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {profileData.languages.split(',').map((lang, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-success" />
                                  <span>{lang.trim()}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <Card className="border-2">
                        <CardHeader>
                          <CardTitle>Quick Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Availability</span>
                            <span className="font-semibold">{profileData.availability || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Job Types</span>
                            <span className="font-semibold">{profileData.preferredJobTypes || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Contract Types</span>
                            <span className="font-semibold">{profileData.preferredContractTypes || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Timezone</span>
                            <span className="font-semibold">{profileData.timezone || 'Not set'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {profileData.certifications && (
                        <Card className="border-2">
                          <CardHeader>
                            <CardTitle>Certifications</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {profileData.certifications.split('\n').filter(Boolean).map((cert, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Award className="h-4 w-4 text-primary mt-0.5" />
                                <span className="text-sm">{cert}</span>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Social Links */}
                      {(profileData.websiteUrl || profileData.linkedinUrl || profileData.githubUrl || profileData.portfolioUrl) && (
                        <Card className="border-2">
                          <CardHeader>
                            <CardTitle>Links</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {profileData.portfolioUrl && (
                              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                <a href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                  Portfolio
                                </a>
                              </Button>
                            )}
                            {profileData.websiteUrl && (
                              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                <a href={profileData.websiteUrl} target="_blank" rel="noopener noreferrer">
                                  Website
                                </a>
                              </Button>
                            )}
                            {profileData.linkedinUrl && (
                              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                  LinkedIn
                                </a>
                              </Button>
                            )}
                            {profileData.githubUrl && (
                              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                                <a href={profileData.githubUrl} target="_blank" rel="noopener noreferrer">
                                  GitHub
                                </a>
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experience" className="space-y-4">
                  {profileData.education && (
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Education</h3>
                            <p className="mt-3 text-muted-foreground whitespace-pre-line">{profileData.education}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {profileData.experience && (
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Work Experience</h3>
                            <p className="mt-3 text-muted-foreground whitespace-pre-line">{profileData.experience}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!profileData.education && !profileData.experience && (
                    <Card className="border-2">
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No experience information provided yet.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {isEditMode && (
          <>
            {/* Edit Mode - Form */}
            <Card className="border border-border">
              <CardContent className="p-6 md:p-8">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    Basic Information
                  </h2>
                  <p className="text-muted-foreground">
                    Let clients know who you are
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                    <Avatar className="h-32 w-32">
                      {profileData.profilePictureUrl ? (
                        <AvatarImage src={profileData.profilePictureUrl} alt={profileData.fullName} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                          {profileData.fullName.charAt(0) || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPicture}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingPicture ? 'Uploading...' : 'Upload Profile Picture'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF. Max size 5MB.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="John Doe"
                      className={errors.fullName ? 'border-destructive' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="headline">
                      Professional Headline <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="headline"
                      value={profileData.headline}
                      onChange={(e) => updateField('headline', e.target.value)}
                      placeholder="Full-Stack Developer | React & Node.js Expert"
                      maxLength={100}
                      className={errors.headline ? 'border-destructive' : ''}
                    />
                    {errors.headline && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.headline}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {profileData.headline.length}/100 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="overview">Professional Overview</Label>
                    <Textarea
                      id="overview"
                      value={profileData.overview}
                      onChange={(e) => updateField('overview', e.target.value)}
                      placeholder="Tell clients about your experience, skills, and what makes you unique..."
                      rows={6}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {profileData.overview.length}/2000 characters
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Rates & Location */}
                {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-primary" />
                    Rates & Location
                  </h2>
                  <p className="text-muted-foreground">
                    Set your hourly rate and location
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (NPR)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={profileData.hourlyRate}
                      onChange={(e) => updateField('hourlyRate', e.target.value)}
                      placeholder="1000"
                      min="0"
                      step="50"
                      className={errors.hourlyRate ? 'border-destructive' : ''}
                    />
                    {errors.hourlyRate && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hourlyRateMin">Minimum Rate (NPR)</Label>
                      <Input
                        id="hourlyRateMin"
                        type="number"
                        value={profileData.hourlyRateMin}
                        onChange={(e) => updateField('hourlyRateMin', e.target.value)}
                        placeholder="800"
                        min="0"
                        step="50"
                        className={errors.hourlyRateMin ? 'border-destructive' : ''}
                      />
                      {errors.hourlyRateMin && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.hourlyRateMin}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="hourlyRateMax">Maximum Rate (NPR)</Label>
                      <Input
                        id="hourlyRateMax"
                        type="number"
                        value={profileData.hourlyRateMax}
                        onChange={(e) => updateField('hourlyRateMax', e.target.value)}
                        placeholder="1500"
                        min="0"
                        step="50"
                        className={errors.hourlyRateMax ? 'border-destructive' : ''}
                      />
                      {errors.hourlyRateMax && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.hourlyRateMax}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="locationCity">City</Label>
                      <Input
                        id="locationCity"
                        value={profileData.locationCity}
                        onChange={(e) => updateField('locationCity', e.target.value)}
                        placeholder="Kathmandu"
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationCountry">Country</Label>
                      <Input
                        id="locationCountry"
                        value={profileData.locationCountry}
                        onChange={(e) => updateField('locationCountry', e.target.value)}
                        placeholder="Nepal"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={profileData.timezone}
                      onValueChange={(value) => updateField('timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select 
                      value={profileData.availability}
                      onValueChange={(value) => updateField('availability', value)}
                    >
                      <SelectTrigger id="availability">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
                {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <Code className="h-6 w-6 text-primary" />
                    Skills & Expertise
                  </h2>
                  <p className="text-muted-foreground">
                    Showcase your technical skills
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primarySkills">
                      Primary Skills <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2 mb-2">
                      <Select
                        value={primarySkillInput}
                        onValueChange={setPrimarySkillInput}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkills.map(skill => (
                            <SelectItem key={skill.id} value={skill.name}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={addPrimarySkill}
                        disabled={!primarySkillInput}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Or type custom skill"
                        value={primarySkillInput}
                        onChange={(e) => setPrimarySkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPrimarySkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPrimarySkill}
                        disabled={!primarySkillInput}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                      {profileData.primarySkills.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No skills added yet</span>
                      ) : (
                        profileData.primarySkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removePrimarySkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    {errors.primarySkills && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.primarySkills}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="secondarySkills">Secondary Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Select
                        value={secondarySkillInput}
                        onValueChange={setSecondarySkillInput}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select a skill" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSkills.map(skill => (
                            <SelectItem key={skill.id} value={skill.name}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={addSecondarySkill}
                        disabled={!secondarySkillInput}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Or type custom skill"
                        value={secondarySkillInput}
                        onChange={(e) => setSecondarySkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSecondarySkill();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSecondarySkill}
                        disabled={!secondarySkillInput}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                      {profileData.secondarySkills.length === 0 ? (
                        <span className="text-sm text-muted-foreground">No skills added yet</span>
                      ) : (
                        profileData.secondarySkills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSecondarySkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      value={profileData.languages}
                      onChange={(e) => updateField('languages', e.target.value)}
                      placeholder="English (Fluent), Nepali (Native)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => updateField('experience', e.target.value)}
                      placeholder="5+ years"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Education & Certifications */}
                {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Education & Certifications
                  </h2>
                  <p className="text-muted-foreground">
                    Build credibility with your qualifications
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      value={profileData.education}
                      onChange={(e) => updateField('education', e.target.value)}
                      placeholder="Bachelor's in Computer Science, XYZ University (2018)"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="certifications">Certifications</Label>
                    <Textarea
                      id="certifications"
                      value={profileData.certifications}
                      onChange={(e) => updateField('certifications', e.target.value)}
                      placeholder="AWS Certified Solutions Architect, Google Cloud Professional"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Portfolio & Preferences */}
                {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Portfolio & Work Preferences
                  </h2>
                  <p className="text-muted-foreground">
                    Share your work and preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                    <Input
                      id="portfolioUrl"
                      type="url"
                      value={profileData.portfolioUrl}
                      onChange={(e) => updateField('portfolioUrl', e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Personal Website</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={profileData.websiteUrl}
                      onChange={(e) => updateField('websiteUrl', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      value={profileData.linkedinUrl}
                      onChange={(e) => updateField('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="githubUrl">GitHub Profile</Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      value={profileData.githubUrl}
                      onChange={(e) => updateField('githubUrl', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredJobTypes">Preferred Job Types</Label>
                    <Select 
                      value={profileData.preferredJobTypes}
                      onValueChange={(value) => updateField('preferredJobTypes', value)}
                    >
                      <SelectTrigger id="preferredJobTypes">
                        <SelectValue placeholder="Select job type preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="preferredContractTypes">Preferred Contract Types</Label>
                    <Select 
                      value={profileData.preferredContractTypes}
                      onValueChange={(value) => updateField('preferredContractTypes', value)}
                    >
                      <SelectTrigger id="preferredContractTypes">
                        <SelectValue placeholder="Select contract type preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setCurrentStep(1);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || saving}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </Button>

                {currentStep < totalSteps ? (
                  <Button onClick={handleNext} disabled={saving}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    {saving ? 'Saving...' : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Complete Profile
                      </>
                    )}
                  </Button>
                )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Skeleton } from './ui/skeleton';
import { useRouter } from './Router';
import { useAuth } from '@/contexts/AuthContext';
import { jobCategoriesApi, jobsApi, jobSkillsApi } from '@/lib/api';
import { Header } from './Header';
import { Footer } from './Footer';
import { 
  Briefcase, 
  Wallet, 
  Clock, 
  Tag, 
  FileText,
  X,
  Plus,
  ChevronLeft,
  Check,
  MapPin,
  AlertCircle
} from 'lucide-react';

export function PostJobPage() {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    categoryId: '',
    description: '',
    budgetType: 'fixed' as 'fixed' | 'hourly',
    fixedBudget: '',
    hourlyMin: '',
    hourlyMax: '',
    duration: '',
    experienceLevel: '',
    skills: [] as string[],
    skillIds: [] as number[],
    skillMap: {} as Record<string, number | undefined>, // Maps skill name to ID (undefined for custom)
    projectType: 'one-time',
    requirements: '',
    deliverables: '',
    location: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to post a job');
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch skills when category changes
  useEffect(() => {
    if (jobData.categoryId) {
      fetchSkills(parseInt(jobData.categoryId));
    } else {
      fetchSkills(); // Fetch all skills if no category selected
    }
  }, [jobData.categoryId]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await jobCategoriesApi.list();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSkills = async (categoryId?: number) => {
    try {
      setLoadingSkills(true);
      const data = await jobSkillsApi.list(categoryId);
      setAvailableSkills(data);
    } catch (err: any) {
      console.error('Error fetching skills:', err);
      toast.error('Failed to load skills');
    } finally {
      setLoadingSkills(false);
    }
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !jobData.skills.includes(trimmedSkill)) {
      // Check if skill exists in available skills
      const existingSkill = availableSkills.find(s => s.name.toLowerCase() === trimmedSkill.toLowerCase());
      if (existingSkill) {
        // Add with ID
        setJobData({
          ...jobData,
          skills: [...jobData.skills, existingSkill.name],
          skillIds: [...jobData.skillIds, existingSkill.id],
          skillMap: { ...jobData.skillMap, [existingSkill.name]: existingSkill.id }
        });
      } else {
        // Add custom skill (without ID)
        setJobData({
          ...jobData,
          skills: [...jobData.skills, trimmedSkill],
          skillMap: { ...jobData.skillMap, [trimmedSkill]: undefined }
        });
      }
      setSkillInput('');
      setErrors({ ...errors, skills: '' });
    }
  };

  const removeSkill = (skill: string) => {
    setJobData({ ...jobData, skills: jobData.skills.filter(s => s !== skill) });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!jobData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!jobData.categoryId) {
      newErrors.category = 'Category is required';
    }

    if (!jobData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (jobData.budgetType === 'fixed') {
      if (!jobData.fixedBudget || parseFloat(jobData.fixedBudget) <= 0) {
        newErrors.fixedBudget = 'Fixed budget must be greater than 0';
      }
    } else {
      if (!jobData.hourlyMin || parseFloat(jobData.hourlyMin) <= 0) {
        newErrors.hourlyMin = 'Minimum hourly rate is required';
      }
      if (!jobData.hourlyMax || parseFloat(jobData.hourlyMax) <= 0) {
        newErrors.hourlyMax = 'Maximum hourly rate is required';
      }
      if (jobData.hourlyMin && jobData.hourlyMax && 
          parseFloat(jobData.hourlyMin) >= parseFloat(jobData.hourlyMax)) {
        newErrors.hourlyMax = 'Maximum must be greater than minimum';
      }
    }

    if (!jobData.duration) {
      newErrors.duration = 'Project duration is required';
    }

    if (!jobData.experienceLevel) {
      newErrors.experienceLevel = 'Experience level is required';
    }

    if (jobData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      // Map experience level
      const experienceLevelMap: Record<string, string> = {
        'entry': 'ENTRY',
        'intermediate': 'MID',
        'expert': 'SENIOR',
      };

      // Map project length
      const projectLengthMap: Record<string, string> = {
        'less-1-month': 'Less than 1 month',
        '1-3-months': '1-3 months',
        '3-6-months': '3-6 months',
        'more-6-months': 'More than 6 months',
        'ongoing': 'More than 6 months',
      };

      // Prepare API payload
      const payload: any = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        categoryId: parseInt(jobData.categoryId, 10),
        jobType: jobData.budgetType === 'fixed' ? 'FIXED_PRICE' : 'HOURLY',
        experienceLevel: experienceLevelMap[jobData.experienceLevel] || 'MID',
        projectLength: projectLengthMap[jobData.duration] || jobData.duration,
        status: 'OPEN',
      };

      // Set budget
      if (jobData.budgetType === 'fixed') {
        payload.budgetMin = parseFloat(jobData.fixedBudget);
        payload.budgetMax = parseFloat(jobData.fixedBudget);
      } else {
        payload.budgetMin = parseFloat(jobData.hourlyMin);
        payload.budgetMax = parseFloat(jobData.hourlyMax);
      }

      // Set requirements and deliverables
      if (jobData.requirements.trim()) {
        payload.requirements = jobData.requirements.trim();
      }
      if (jobData.deliverables.trim()) {
        payload.deliverables = jobData.deliverables.trim();
      }

      // Set location if provided
      if (jobData.location.trim()) {
        payload.location = jobData.location.trim();
      }

      // Separate skills with IDs from custom skills
      const skillsWithIds: number[] = [];
      const customSkillNames: string[] = [];
      
      jobData.skills.forEach(skillName => {
        const skillId = jobData.skillMap[skillName];
        if (skillId !== undefined) {
          skillsWithIds.push(skillId);
        } else {
          customSkillNames.push(skillName);
        }
      });

      // Add skill IDs if any
      if (skillsWithIds.length > 0) {
        payload.skillIds = skillsWithIds;
      }

      // Add custom skills if any
      if (customSkillNames.length > 0) {
        payload.customSkills = customSkillNames;
      }

      console.log('Creating job with payload:', payload);
      console.log('Skills with IDs:', skillsWithIds);
      console.log('Custom skills:', customSkillNames);
      const createdJob = await jobsApi.create(payload);

      toast.success('Job posted successfully!');
      navigate('job-detail', { jobId: createdJob.id });
    } catch (err: any) {
      console.error('Error posting job:', err);
      toast.error(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Job Details', icon: Briefcase },
    { number: 2, title: 'Budget & Timeline', icon: DollarSign },
    { number: 3, title: 'Skills & Requirements', icon: Tag },
    { number: 4, title: 'Review & Post', icon: FileText }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/20 pt-16">
        <div className="w-full px-4 md:px-8 lg:px-12 py-8">
          <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('client-dashboard')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Post a New Job</h1>
            <p className="text-muted-foreground text-lg">Find the perfect freelancer for your project</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted -z-10">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'bg-background border-muted-foreground text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden md:block ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <Card className="border-2">
            <CardContent className="p-8">
              {/* Step 1: Job Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Job Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-base">Job Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., React Developer for E-commerce Platform"
                        value={jobData.title}
                        onChange={(e) => {
                          setJobData({ ...jobData, title: e.target.value });
                          setErrors({ ...errors, title: '' });
                        }}
                        className="mt-2"
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-base">Category *</Label>
                      {loadingCategories ? (
                        <Skeleton className="h-10 w-full mt-2" />
                      ) : (
                        <Select 
                          value={jobData.categoryId} 
                          onValueChange={(value) => {
                            setJobData({ ...jobData, categoryId: value });
                            setErrors({ ...errors, category: '' });
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {errors.category && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-base">Job Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project in detail. Include what you're looking for, project goals, and any specific requirements..."
                        value={jobData.description}
                        onChange={(e) => {
                          setJobData({ ...jobData, description: e.target.value });
                          setErrors({ ...errors, description: '' });
                        }}
                        className="mt-2 min-h-[200px]"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-muted-foreground">
                          {jobData.description.length} characters
                        </p>
                        {errors.description && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base">Project Type</Label>
                      <RadioGroup 
                        value={jobData.projectType} 
                        onValueChange={(value) => setJobData({ ...jobData, projectType: value })}
                        className="mt-3 space-y-3"
                      >
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
                          <RadioGroupItem value="one-time" id="one-time" />
                          <Label htmlFor="one-time" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">One-time project</p>
                              <p className="text-sm text-muted-foreground">Find the right freelancer for a single project</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
                          <RadioGroupItem value="ongoing" id="ongoing" />
                          <Label htmlFor="ongoing" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">Ongoing project</p>
                              <p className="text-sm text-muted-foreground">Long-term collaboration with regular work</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Budget & Timeline */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Budget & Timeline</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Budget Type *</Label>
                      <RadioGroup 
                        value={jobData.budgetType} 
                        onValueChange={(value) => setJobData({ ...jobData, budgetType: value })}
                        className="mt-3 space-y-3"
                      >
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <Label htmlFor="fixed" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">Fixed Price</p>
                              <p className="text-sm text-muted-foreground">Set a total project budget</p>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border-2 rounded-lg cursor-pointer hover:border-primary">
                          <RadioGroupItem value="hourly" id="hourly" />
                          <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                            <div>
                              <p className="font-medium">Hourly Rate</p>
                              <p className="text-sm text-muted-foreground">Pay by the hour with a rate range</p>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {jobData.budgetType === 'fixed' ? (
                      <div>
                        <Label htmlFor="fixedBudget" className="text-base">Fixed Budget (NPR) *</Label>
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rs.</span>
                          <Input
                            id="fixedBudget"
                            type="number"
                            placeholder="5000"
                            value={jobData.fixedBudget}
                            onChange={(e) => {
                              setJobData({ ...jobData, fixedBudget: e.target.value });
                              setErrors({ ...errors, fixedBudget: '' });
                            }}
                            className="pl-9"
                          />
                        </div>
                        {errors.fixedBudget && (
                          <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.fixedBudget}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyMin" className="text-base">Min Hourly Rate (NPR) *</Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rs.</span>
                            <Input
                              id="hourlyMin"
                              type="number"
                              placeholder="50"
                              value={jobData.hourlyMin}
                              onChange={(e) => {
                                setJobData({ ...jobData, hourlyMin: e.target.value });
                                setErrors({ ...errors, hourlyMin: '', hourlyMax: '' });
                              }}
                              className="pl-9"
                            />
                          </div>
                          {errors.hourlyMin && (
                            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.hourlyMin}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="hourlyMax" className="text-base">Max Hourly Rate (NPR) *</Label>
                          <div className="relative mt-2">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">Rs.</span>
                            <Input
                              id="hourlyMax"
                              type="number"
                              placeholder="80"
                              value={jobData.hourlyMax}
                              onChange={(e) => {
                                setJobData({ ...jobData, hourlyMax: e.target.value });
                                setErrors({ ...errors, hourlyMax: '' });
                              }}
                              className="pl-9"
                            />
                          </div>
                          {errors.hourlyMax && (
                            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.hourlyMax}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="duration" className="text-base">Project Duration *</Label>
                      <Select 
                        value={jobData.duration} 
                        onValueChange={(value) => {
                          setJobData({ ...jobData, duration: value });
                          setErrors({ ...errors, duration: '' });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-1-month">Less than 1 month</SelectItem>
                          <SelectItem value="1-3-months">1-3 months</SelectItem>
                          <SelectItem value="3-6-months">3-6 months</SelectItem>
                          <SelectItem value="more-6-months">More than 6 months</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.duration && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.duration}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-base">Project Location</Label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Remote, Kathmandu, Nepal, or Worldwide"
                          value={jobData.location}
                          onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Specify if the work is remote, requires on-site presence, or any location preference
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="experienceLevel" className="text-base">Required Experience Level *</Label>
                      <Select 
                        value={jobData.experienceLevel} 
                        onValueChange={(value) => {
                          setJobData({ ...jobData, experienceLevel: value });
                          setErrors({ ...errors, experienceLevel: '' });
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.experienceLevel && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.experienceLevel}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Skills & Requirements */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Skills & Requirements</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="skills" className="text-base">Required Skills *</Label>
                      
                      {/* Select from available skills */}
                      {loadingSkills ? (
                        <Skeleton className="h-10 w-full mt-2" />
                      ) : availableSkills.length > 0 ? (
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const skillId = parseInt(value);
                            const skill = availableSkills.find(s => s.id === skillId);
                            if (skill && !jobData.skillIds.includes(skillId)) {
                              setJobData({
                                ...jobData,
                                skillIds: [...jobData.skillIds, skillId],
                                skills: [...jobData.skills, skill.name],
                                skillMap: { ...jobData.skillMap, [skill.name]: skillId }
                              });
                              setErrors({ ...errors, skills: '' });
                            }
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select from available skills" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSkills.map((skill) => (
                              <SelectItem
                                key={skill.id}
                                value={skill.id.toString()}
                                disabled={jobData.skillIds.includes(skill.id)}
                              >
                                {skill.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      
                      {/* Or add custom skill */}
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="skills"
                          placeholder="Or type a custom skill (e.g., React, Node.js)"
                          value={skillInput}
                          onChange={(e) => {
                            setSkillInput(e.target.value);
                            setErrors({ ...errors, skills: '' });
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                        <Button type="button" onClick={addSkill} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2">
                        {jobData.categoryId 
                          ? 'Select from dropdown or type custom skills' 
                          : 'Select a category to see relevant skills, or type custom ones'}
                      </p>
                      
                      {errors.skills && (
                        <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.skills}
                        </p>
                      )}
                      
                      {/* Selected skills */}
                      {jobData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {jobData.skills.map((skill, index) => (
                            <Badge key={`${skill}-${index}`} variant="secondary" className="px-3 py-1.5">
                              {skill}
                              <button
                                type="button"
                                onClick={() => {
                                  const removedSkill = skill;
                                  const newSkills = jobData.skills.filter(s => s !== removedSkill);
                                  const newSkillMap = { ...jobData.skillMap };
                                  delete newSkillMap[removedSkill];
                                  setJobData({ ...jobData, skills: newSkills, skillMap: newSkillMap });
                                }}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="requirements" className="text-base">Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List specific requirements and qualifications (one per line)..."
                        value={jobData.requirements}
                        onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="deliverables" className="text-base">Deliverables</Label>
                      <Textarea
                        id="deliverables"
                        placeholder="List expected deliverables (one per line)..."
                        value={jobData.deliverables}
                        onChange={(e) => setJobData({ ...jobData, deliverables: e.target.value })}
                        className="mt-2 min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Post */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Review Your Job Post</h2>
                    <p className="text-muted-foreground">Make sure everything looks good before posting</p>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-2">
                      <CardHeader>
                        <CardTitle className="text-xl">{jobData.title || 'Job Title'}</CardTitle>
                        {jobData.categoryId && (
                          <Badge className="w-fit mt-2">
                            {categories.find(c => c.id.toString() === jobData.categoryId)?.name || 'Category'}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">
                            {jobData.description || 'No description provided'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-primary" />
                              Budget
                            </h4>
                            <p className="text-muted-foreground">
                              {jobData.budgetType === 'fixed' 
                                ? `Rs. ${jobData.fixedBudget || '0'} (Fixed)`
                                : `Rs. ${jobData.hourlyMin || '0'} - Rs. ${jobData.hourlyMax || '0'}/hr`
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              Duration
                            </h4>
                            <p className="text-muted-foreground">{jobData.duration || 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <h4 className="font-semibold mb-2">Experience Level</h4>
                          <p className="text-muted-foreground capitalize">{jobData.experienceLevel || 'Not specified'}</p>
                        </div>

                        {jobData.skills.length > 0 && (
                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3">Required Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {jobData.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {jobData.requirements && (
                          <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-2">Additional Requirements</h4>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {jobData.requirements}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">What happens next?</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success mt-0.5" />
                          <span>Your job will be visible to thousands of talented freelancers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success mt-0.5" />
                          <span>You'll start receiving proposals within hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-success mt-0.5" />
                          <span>Review proposals and hire the best freelancer for your project</span>
                        </li>
                      </ul>
                    </div>
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

                {currentStep < 4 ? (
                  <Button onClick={handleNext} disabled={loading}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-primary to-secondary"
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post Job'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

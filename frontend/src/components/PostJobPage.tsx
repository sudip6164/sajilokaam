import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useRouter } from './Router';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  Tag, 
  FileText,
  X,
  Plus,
  ChevronLeft,
  Check
} from 'lucide-react';

export function PostJobPage() {
  const { navigate } = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState({
    title: '',
    category: '',
    description: '',
    budgetType: 'fixed',
    fixedBudget: '',
    hourlyMin: '',
    hourlyMax: '',
    duration: '',
    experienceLevel: '',
    skills: [] as string[],
    projectType: 'one-time',
    requirements: ''
  });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !jobData.skills.includes(skillInput.trim())) {
      setJobData({ ...jobData, skills: [...jobData.skills, skillInput.trim()] });
      setSkillInput('');
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

  const handleSubmit = () => {
    // In a real app, this would submit to the backend
    console.log('Posting job:', jobData);
    navigate('client-dashboard');
  };

  const steps = [
    { number: 1, title: 'Job Details', icon: Briefcase },
    { number: 2, title: 'Budget & Timeline', icon: DollarSign },
    { number: 3, title: 'Skills & Requirements', icon: Tag },
    { number: 4, title: 'Review & Post', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-muted/20">
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
                        onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-base">Category *</Label>
                      <Select value={jobData.category} onValueChange={(value) => setJobData({ ...jobData, category: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web-dev">Web Development</SelectItem>
                          <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                          <SelectItem value="design">Design & Creative</SelectItem>
                          <SelectItem value="writing">Writing & Content</SelectItem>
                          <SelectItem value="marketing">Digital Marketing</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="devops">DevOps & Cloud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-base">Job Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project in detail. Include what you're looking for, project goals, and any specific requirements..."
                        value={jobData.description}
                        onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
                        className="mt-2 min-h-[200px]"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {jobData.description.length} characters
                      </p>
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
                        <Label htmlFor="fixedBudget" className="text-base">Fixed Budget (USD) *</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fixedBudget"
                            type="number"
                            placeholder="5000"
                            value={jobData.fixedBudget}
                            onChange={(e) => setJobData({ ...jobData, fixedBudget: e.target.value })}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourlyMin" className="text-base">Min Hourly Rate (USD) *</Label>
                          <div className="relative mt-2">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="hourlyMin"
                              type="number"
                              placeholder="50"
                              value={jobData.hourlyMin}
                              onChange={(e) => setJobData({ ...jobData, hourlyMin: e.target.value })}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="hourlyMax" className="text-base">Max Hourly Rate (USD) *</Label>
                          <div className="relative mt-2">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="hourlyMax"
                              type="number"
                              placeholder="80"
                              value={jobData.hourlyMax}
                              onChange={(e) => setJobData({ ...jobData, hourlyMax: e.target.value })}
                              className="pl-9"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="duration" className="text-base">Project Duration *</Label>
                      <Select value={jobData.duration} onValueChange={(value) => setJobData({ ...jobData, duration: value })}>
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
                    </div>

                    <div>
                      <Label htmlFor="experienceLevel" className="text-base">Required Experience Level *</Label>
                      <Select value={jobData.experienceLevel} onValueChange={(value) => setJobData({ ...jobData, experienceLevel: value })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="skills"
                          placeholder="e.g., React, Node.js, TypeScript"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Press Enter or click + to add skills
                      </p>
                      
                      {jobData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {jobData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
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
                      <Label htmlFor="requirements" className="text-base">Additional Requirements</Label>
                      <Textarea
                        id="requirements"
                        placeholder="List any specific requirements, qualifications, or deliverables..."
                        value={jobData.requirements}
                        onChange={(e) => setJobData({ ...jobData, requirements: e.target.value })}
                        className="mt-2 min-h-[150px]"
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
                        {jobData.category && (
                          <Badge className="w-fit mt-2">{jobData.category}</Badge>
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
                              <DollarSign className="h-4 w-4 text-primary" />
                              Budget
                            </h4>
                            <p className="text-muted-foreground">
                              {jobData.budgetType === 'fixed' 
                                ? `$${jobData.fixedBudget || '0'} (Fixed)`
                                : `$${jobData.hourlyMin || '0'} - $${jobData.hourlyMax || '0'}/hr`
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
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    Post Job
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

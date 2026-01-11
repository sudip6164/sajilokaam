import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { useRouter } from './Router';
import { jobsApi, bidsApi, profileApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { ProposalForm, ProposalData } from './proposals/ProposalForm';
import { toast } from 'sonner';
import { 
  DollarSign, 
  MapPin, 
  Clock, 
  Calendar,
  Briefcase,
  Users,
  FileText,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle2,
  Star
} from 'lucide-react';

interface JobData {
  id: number;
  title: string;
  category: string;
  posted: string;
  budget: {
    type: string;
    amount: number;
    range: string;
  };
  duration: string;
  experienceLevel: string;
  projectType: string;
  location: string;
  proposals: number;
  hires: number;
  client: {
    name: string;
    avatar?: string;
    rating: number;
    reviews: number;
    location: string;
    memberSince: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  deliverables: string[];
  similarJobs: Array<{
    id: number;
    title: string;
    budget: string;
    proposals: number;
  }>;
}

export function JobDetailPage() {
  const { navigate, pageParams, user } = useRouter();
  const { isAuthenticated, user: authUser, hasRole } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [job, setJob] = useState<JobData | null>(null);
  const [jobClientId, setJobClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Debug: Log user info
  console.log('JobDetailPage - User Info:', {
    userType: authUser?.type,
    isAuthenticated,
    authUserId: authUser?.id,
    jobClientId,
    isFreelancer: hasRole('FREELANCER'),
    isClient: hasRole('CLIENT'),
  });

  useEffect(() => {
    const jobId = pageParams?.jobId;
    if (!jobId) {
      setError('Job ID not provided');
      setLoading(false);
      return;
    }

    fetchJob(jobId);
  }, [pageParams?.jobId]);

  const handleSubmitProposal = async (proposalData: ProposalData) => {
    if (!job) return;
    
    // Validate user is a freelancer
    if (!hasRole('FREELANCER')) {
      toast.error('Only freelancers can submit proposals');
      setShowProposalForm(false);
      return;
    }
    
    // Validate user is not the job owner
    if (jobClientId === authUser?.id) {
      toast.error('You cannot submit a proposal on your own job');
      setShowProposalForm(false);
      return;
    }
    
    try {
      setSubmittingProposal(true);
      
      // Convert delivery time to estimated completion date
      const deliveryDays = proposalData.deliveryUnit === 'days' 
        ? proposalData.deliveryTime 
        : proposalData.deliveryUnit === 'weeks' 
        ? proposalData.deliveryTime * 7 
        : proposalData.deliveryTime * 30;
      
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
      
      await bidsApi.create({
        jobId: job.id,
        amount: proposalData.bidAmount,
        proposal: proposalData.coverLetter,
        estimatedCompletionDate: estimatedDate.toISOString(),
      });
      
      toast.success('Proposal submitted successfully!');
      setShowProposalForm(false);
      
      // Navigate to freelancer dashboard to see submitted proposals
      navigate('freelancer-dashboard');
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      toast.error(err.response?.data?.message || 'Failed to submit proposal. Please try again.');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const fetchJob = async (jobId: number) => {
    try {
      setLoading(true);
      setError(null);
      const jobData = await jobsApi.get(jobId);
      
      // Format posted date
      const postedDate = new Date(jobData.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - postedDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let posted = 'Just now';
      if (diffDays === 0) posted = 'Today';
      else if (diffDays === 1) posted = '1 day ago';
      else if (diffDays < 7) posted = `${diffDays} days ago`;
      else if (diffDays < 30) posted = `${Math.floor(diffDays / 7)} weeks ago`;
      else posted = `${Math.floor(diffDays / 30)} months ago`;

      // Format budget
      let budgetRange = 'Not specified';
      if (jobData.budgetMin && jobData.budgetMax) {
        if (jobData.budgetMin === jobData.budgetMax) {
          // Fixed price - show single value
          budgetRange = `Rs. ${jobData.budgetMax.toLocaleString()}`;
        } else {
          // Hourly rate - show range
          budgetRange = `Rs. ${jobData.budgetMin.toLocaleString()} - Rs. ${jobData.budgetMax.toLocaleString()}`;
        }
      } else if (jobData.budgetMax) {
        budgetRange = `Rs. ${jobData.budgetMax.toLocaleString()}`;
      } else if (jobData.budgetMin) {
        budgetRange = `Rs. ${jobData.budgetMin.toLocaleString()}+`;
      }

      // Parse requirements and deliverables (split by newlines or bullets)
      const parseTextToList = (text: string | undefined): string[] => {
        if (!text) return [];
        // Split by newlines and filter empty lines
        return text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => line.replace(/^[-•*]\s*/, '')); // Remove bullet points
      };

      const requirements = parseTextToList(jobData.jobDetails?.requirements);
      const deliverables = parseTextToList(jobData.jobDetails?.deliverables);

      // Format experience level
      const experienceLevelMap: Record<string, string> = {
        'ENTRY': 'Entry Level',
        'MID': 'Intermediate',
        'SENIOR': 'Expert',
      };

      // Fetch client profile to get their location
      let clientLocation = 'Not specified';
      let clientName = 'Client';
      if (jobData.clientId) {
        try {
          const clientProfile = await profileApi.getClientProfile(jobData.clientId);
          clientLocation = clientProfile.location || 'Not specified';
          clientName = clientProfile.companyName || clientProfile.user?.fullName || 'Client';
        } catch (err) {
          console.error('Error fetching client profile:', err);
        }
      }

      const transformedJob: JobData = {
        id: jobData.id,
        title: jobData.title,
        category: jobData.category?.name || 'Uncategorized',
        posted,
        budget: {
          type: jobData.jobType === 'HOURLY' ? 'Hourly' : 'Fixed Price',
          amount: jobData.budgetMax || jobData.budgetMin || 0,
          range: budgetRange,
        },
        duration: jobData.projectLength || 'Not specified',
        experienceLevel: experienceLevelMap[jobData.experienceLevel || ''] || jobData.experienceLevel || 'Not specified',
        projectType: jobData.jobType === 'HOURLY' ? 'Hourly rate' : 'Fixed price project',
        location: jobData.location || 'Not specified',
        proposals: 0, // Would need separate API call
        hires: 0, // Would need separate API call
        client: {
          name: clientName,
          rating: 4.5, // Would need client profile API
          reviews: 0,
          location: clientLocation, // Use client profile location
          memberSince: new Date(jobData.createdAt).getFullYear().toString(),
        },
        description: jobData.description || 'No description provided.',
        requirements: requirements.length > 0 ? requirements : ['No specific requirements listed.'],
        skills: jobData.requiredSkills?.map(s => s.name) || [],
        deliverables: deliverables.length > 0 ? deliverables : ['Deliverables will be discussed with selected freelancer.'],
        similarJobs: [], // Will fetch separately
      };

      setJob(transformedJob);
      
      // Store job client ID for validation
      if (jobData.clientId) {
        setJobClientId(jobData.clientId);
      }

      // Fetch similar jobs (same category)
      if (jobData.category?.id) {
        try {
          const similarJobsData = await jobsApi.list({
            categoryId: jobData.category.id,
            status: 'OPEN',
          });
          const similar = (similarJobsData as any[])
            .filter(j => j.id !== jobData.id)
            .slice(0, 3)
            .map(j => ({
              id: j.id,
              title: j.title,
              budget: j.budgetMin && j.budgetMax
                ? `Rs. ${j.budgetMin.toLocaleString()} - Rs. ${j.budgetMax.toLocaleString()}`
                : j.budgetMax
                ? `Rs. ${j.budgetMax.toLocaleString()}`
                : 'Not specified',
              proposals: 0,
            }));
          setJob(prev => prev ? { ...prev, similarJobs: similar } : null);
        } catch (err) {
          // Ignore error for similar jobs
        }
      }
    } catch (err: any) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 shadow-lg">
                <CardContent className="p-8">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
          <Card className="border-2">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
              <p className="text-muted-foreground mb-6">{error || 'The job you are looking for does not exist.'}</p>
              <Button onClick={() => navigate('find-work')}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
        
        {/* Proposal Form Modal */}
        {showProposalForm && job && (
          <ProposalForm
            jobTitle={job.title}
            jobBudget={{
              type: job.budget.type === 'Hourly' ? 'hourly' : 'fixed',
              amount: job.budget.amount,
            }}
            onSubmit={handleSubmitProposal}
            onCancel={() => setShowProposalForm(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ width: '100%', minWidth: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3">{job.category}</Badge>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <p className="text-muted-foreground">Posted {job.posted}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSaved(!isSaved)}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{job.budget.range}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.budget.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold">{job.duration}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Experience</p>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="font-semibold">{job.experienceLevel}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Location</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">{job.location}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 flex gap-3">
                  {isAuthenticated && hasRole('FREELANCER') && jobClientId !== authUser?.id ? (
                    <>
                      <Button 
                        size="lg" 
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        onClick={() => {
                          console.log('Submit Proposal button clicked!');
                          console.log('Current showProposalForm state:', showProposalForm);
                          console.log('Job data:', job);
                          setShowProposalForm(true);
                          console.log('Setting showProposalForm to true');
                        }}
                      >
                        Submit Proposal
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => setIsSaved(!isSaved)}
                      >
                        <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </>
                  ) : isAuthenticated && jobClientId === authUser?.id ? (
                    <Button 
                      size="lg" 
                      className="flex-1"
                      variant="outline"
                      onClick={() => navigate('proposals-list', { jobId: job?.id })}
                    >
                      View Proposals ({job?.proposals || 0})
                    </Button>
                  ) : !isAuthenticated ? (
                    <Button 
                      size="lg" 
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      onClick={() => navigate('login')}
                    >
                      Login to Apply
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="flex-1"
                      variant="outline"
                      disabled
                    >
                      Client View Only
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.deliverables.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-primary mb-1">{job.budget.range}</p>
                  <p className="text-sm text-muted-foreground">{job.budget.type}</p>
                </div>
                {isAuthenticated && hasRole('FREELANCER') && jobClientId !== authUser?.id ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    onClick={() => {
                      console.log('Sidebar Submit Proposal button clicked!');
                      setShowProposalForm(true);
                    }}
                  >
                    Submit Proposal
                  </Button>
                ) : isAuthenticated && jobClientId === authUser?.id ? (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('proposals-list', { jobId: job.id })}
                  >
                    View Proposals
                  </Button>
                ) : !isAuthenticated ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    onClick={() => navigate('login')}
                  >
                    Login to Apply
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Project Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Proposals</span>
                  <span className="font-semibold">{job.proposals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Viewed</span>
                  <span className="font-semibold">2 hours ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interviewing</span>
                  <span className="font-semibold">3 freelancers</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.client.avatar} alt={job.client.name} />
                    <AvatarFallback>{job.client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{job.client.name}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{job.client.rating}</span>
                      <span className="text-muted-foreground">({job.client.reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium">{job.client.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="text-sm font-medium">{job.client.memberSince}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            {job.similarJobs.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Similar Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.similarJobs.map((similar) => (
                    <button
                      key={similar.id}
                      className="w-full text-left p-3 rounded-lg border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                      onClick={() => navigate('job-detail', { jobId: similar.id })}
                    >
                      <h4 className="font-semibold text-sm mb-1">{similar.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="text-primary font-medium">{similar.budget}</span>
                        <span>{similar.proposals} proposals</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Proposal Form Modal */}
      {showProposalForm && job && (
        <ProposalForm
          jobTitle={job.title}
          jobBudget={{
            type: job.budget.type === 'Hourly' ? 'hourly' : 'fixed',
            amount: job.budget.amount,
          }}
          onSubmit={handleSubmitProposal}
          onCancel={() => setShowProposalForm(false)}
        />
      )}
    </div>
  );
}
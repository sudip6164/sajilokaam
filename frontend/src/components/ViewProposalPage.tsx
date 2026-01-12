import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { useRouter } from './Router';
import { bidsApi, jobsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Briefcase,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export function ViewProposalPage() {
  const { navigate, pageParams } = useRouter();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
      return;
    }

    const bidId = pageParams?.bidId;
    if (!bidId || typeof bidId !== 'number' || isNaN(bidId)) {
      console.error('Invalid bid ID:', bidId);
      toast.error('Invalid proposal ID');
      navigate('freelancer-dashboard');
      return;
    }

    fetchProposal(bidId);
  }, [pageParams?.bidId, isAuthenticated]);

  const fetchProposal = async (bidId: number) => {
    try {
      setLoading(true);
      
      console.log('Fetching proposal with ID:', bidId, 'Type:', typeof bidId);
      if (!bidId || typeof bidId !== 'number' || isNaN(bidId)) {
        throw new Error('Invalid bid ID: ' + bidId);
      }
      
      // First try to get bid from my-bids to get jobId
      const bidData = await bidsApi.get(bidId);
      setProposal(bidData);

      // Fetch job details
      const jobData = await jobsApi.get(bidData.jobId);
      setJob(jobData);
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load proposal details');
      toast.error('Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!proposal || !window.confirm('Are you sure you want to withdraw this proposal?')) {
      return;
    }

    try {
      await bidsApi.delete(proposal.jobId, proposal.id);
      toast.success('Proposal withdrawn successfully');
      navigate('freelancer-dashboard');
    } catch (error: any) {
      console.error('Error withdrawing proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to withdraw proposal');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      case 'WITHDRAWN':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-5xl mx-auto">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Proposal Not Found</h2>
                <p className="text-muted-foreground mb-6">{error || 'The proposal you are looking for does not exist.'}</p>
                <Button onClick={() => navigate('freelancer-dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const platformFee = proposal.amount * 0.1;
  const youllReceive = proposal.amount - platformFee;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('freelancer-dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl">Your Proposal</CardTitle>
                        <Badge className={`${getStatusColor(proposal.status)} flex items-center gap-1`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status}
                        </Badge>
                      </div>
                      {job && (
                        <Button
                          variant="link"
                          className="p-0 h-auto text-lg text-primary hover:underline"
                          onClick={() => navigate('job-detail', { jobId: job.id })}
                        >
                          {job.title}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bid Amount</p>
                        <p className="font-semibold text-lg">Rs. {proposal.amount?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Submitted</p>
                        <p className="font-semibold">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Letter */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cover Letter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {proposal.message || proposal.proposal || 'No cover letter provided.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              {job && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Job Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">Description</h4>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {job.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-semibold">
                          Rs. {job.budgetMin?.toLocaleString()} - Rs. {job.budgetMax?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-semibold">{job.category?.name || 'Not specified'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Earnings Breakdown */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bid Amount</span>
                    <span className="font-semibold">Rs. {proposal.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Platform Fee (10%)</span>
                    <span>- Rs. {platformFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between text-lg">
                    <span className="font-semibold">You'll Receive</span>
                    <span className="font-bold text-success">Rs. {youllReceive.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {proposal.status?.toUpperCase() === 'PENDING' && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.info('Edit functionality coming soon')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Proposal
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleWithdraw}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Withdraw Proposal
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Status Info */}
              <Card className="border-2 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {proposal.status?.toUpperCase() === 'PENDING' && (
                    <>
                      <p className="text-muted-foreground">
                        Your proposal is awaiting review by the client. You'll be notified when they respond.
                      </p>
                      <p className="text-muted-foreground">
                        You can withdraw this proposal at any time before the client accepts it.
                      </p>
                    </>
                  )}
                  {proposal.status?.toUpperCase() === 'ACCEPTED' && (
                    <p className="text-success font-medium">
                      Congratulations! Your proposal has been accepted. The project will start soon.
                    </p>
                  )}
                  {proposal.status?.toUpperCase() === 'REJECTED' && (
                    <p className="text-destructive font-medium">
                      Unfortunately, the client has chosen a different freelancer for this project.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
